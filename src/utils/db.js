const dbVersion = 7;

// Databases that hold only regenerable cached data and can safely be deleted
// and recreated when the browser's copy is corrupted. Databases holding user
// data (journal history, progress logs) are never auto-deleted.
const regenerableDatabases = new Set(['cache', 'data']);

// Limit to one repair attempt per database per page load so a repair that
// doesn't stick can't loop.
const repairAttemptedDatabases = new Set();

// Errors that can succeed on a clean retry with a fresh connection: the
// browser force-closing the backend, another tab's upgrade closing our
// connection, or an internal abort.
const transientErrorNames = new Set(['AbortError', 'InvalidStateError', 'NotReadableError', 'TimeoutError', 'TransactionInactiveError', 'UnknownError']);

// One shared connection per database, reused across operations. Each entry is
// { promise, db }: the promise so concurrent operations during boot share a
// single open request, and the resolved connection so eviction can close it
// without touching a connection that is still opening.
const openConnections = new Map();

// How long to wait for an open request before giving up. A wedged backing
// store can leave the request pending forever with no error or blocked event.
const openTimeoutMs = 10_000;

// Databases whose open request timed out. Skipped for the rest of the page
// load so every operation doesn't stall for the full timeout again.
const unavailableDatabases = new Set();

/**
 * Report a database problem for error-reporting to pick up.
 *
 * Dispatched as a plain CustomEvent (rather than the event registry) so this
 * low-level module stays dependency-free.
 *
 * @param {string} context      What was happening, e.g. 'repair' or 'operation-failed'.
 * @param {string} databaseName The name of the database involved.
 * @param {*}      [error]      The error that triggered the report, if any.
 */
const notifyDatabaseIssue = (context, databaseName, error) => {
  try {
    globalThis.dispatchEvent(
      new CustomEvent('mh-improved-db-issue', {
        detail: {
          context,
          databaseName,
          errorName: error?.name,
          errorMessage: error?.message || (error ? String(error) : undefined),
        },
      })
    );
  } catch {
    // Reporting is best-effort.
  }
};

let hasRequestedPersistence = false;

/**
 * Ask the browser to protect this origin's storage from eviction.
 *
 * Storage eviction under disk pressure is a common cause of corrupted or
 * unreadable IndexedDB data. Chromium grants or denies this silently; Firefox
 * shows a permission prompt, so we don't ask there.
 */
const requestPersistentStorage = () => {
  if (hasRequestedPersistence) {
    return;
  }

  hasRequestedPersistence = true;

  try {
    if (navigator.userAgent.includes('Firefox') || !navigator.storage?.persist) {
      return;
    }

    navigator.storage
      .persisted()
      .then((persisted) => persisted || navigator.storage.persist())
      .catch(() => {});
  } catch {
    // Persistence is a nice-to-have; storage still works without it.
  }
};

/**
 * Close a database connection safely.
 *
 * @param {IDBDatabase|null} db The database to close.
 */
const closeDatabase = (db) => {
  try {
    db?.close();
  } catch {
    // Closing a database is best-effort cleanup.
  }
};

/**
 * Drop the shared connection for a database and close it.
 *
 * A connection that is still opening is only evicted, not closed — the
 * operation that kicked off the open still gets to use it once.
 *
 * @param {string} databaseName The name of the database.
 */
const closeConnection = (databaseName) => {
  const entry = openConnections.get(databaseName);
  openConnections.delete(databaseName);
  closeDatabase(entry?.db);
};

/**
 * Drop the shared connection for a database if it is this connection.
 *
 * @param {string}      databaseName The name of the database.
 * @param {IDBDatabase} db           The connection being discarded.
 */
const evictConnection = (databaseName, db) => {
  const entry = openConnections.get(databaseName);
  if (entry && (entry.db === db || !entry.db)) {
    openConnections.delete(databaseName);
  }
};

/**
 * Check whether an error has a specific DOMException name.
 *
 * @param {*}      error The error to check.
 * @param {string} name  The DOMException name.
 *
 * @return {boolean} Whether the error has the name.
 */
const isErrorNamed = (error, name) => error && name === error.name;

/**
 * Check whether an error means a stored value can never be read back, e.g.
 * Chromium's "Failed to read large IndexedDB value" when the on-disk blob for
 * a record is missing or corrupted.
 *
 * @param {*} error The error to check.
 *
 * @return {boolean} Whether the record's value is permanently unreadable.
 */
const isUnreadableValueError = (error) => {
  return isErrorNamed(error, 'NotReadableError') || (isErrorNamed(error, 'UnknownError') && (error.message || '').includes('large IndexedDB value'));
};

/**
 * Open an IndexedDB database, creating its object store if needed.
 *
 * @param {string}      databaseName The name of the database to open.
 * @param {number|null} version      The version to request, or null to open the existing version.
 *
 * @return {Promise<IDBDatabase|null>} The database, or null if the upgrade is blocked.
 */
const openDatabase = (databaseName, version = dbVersion) => {
  return new Promise((resolve, reject) => {
    const request = version ? indexedDB.open(`mh-improved-${databaseName}`, version) : indexedDB.open(`mh-improved-${databaseName}`);
    let settled = false;

    // A wedged backing store can leave the open request pending forever with
    // no error or blocked event, which would block every feature waiting on
    // this database. Give up and skip the database for this page load.
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        unavailableDatabases.add(databaseName);
        console.warn(`IndexedDB "${databaseName}" open timed out; skipping it for this page load.`); // eslint-disable-line no-console
        notifyDatabaseIssue('open-timeout', databaseName);
        resolve(null);
      }
    }, openTimeoutMs);

    request.onerror = (event) => {
      clearTimeout(timeout);

      if (!settled) {
        settled = true;
        reject(event.target.error);
      }
    };

    // Another connection is blocking the upgrade (e.g. an older tab still open).
    // Resolve to null rather than hanging or surfacing an error.
    request.onblocked = () => {
      clearTimeout(timeout);

      if (!settled) {
        console.warn(`IndexedDB "${databaseName}" upgrade blocked by another connection.`); // eslint-disable-line no-console
        settled = true;
        resolve(null);
      }
    };

    request.onsuccess = (event) => {
      clearTimeout(timeout);

      const db = event.target.result;

      // If another tab/version needs to upgrade or delete this DB, get out of
      // its way. Without this, repair/delete attempts can stay blocked until
      // the page is closed.
      db.onversionchange = () => {
        evictConnection(databaseName, db);
        closeDatabase(db);
      };

      // The browser force-closed the connection (backend crash, storage
      // pressure). Drop it so the next operation opens a fresh one.
      db.onclose = () => evictConnection(databaseName, db);

      if (settled) {
        // The open settled without us (timeout or blocked) but the connection
        // eventually came through, so let future operations try again.
        unavailableDatabases.delete(databaseName);
        closeDatabase(db);
        return;
      }

      settled = true;
      resolve(db);
    };

    /**
     * On upgrade needed event.
     *
     * @param {Event} event The event object.
     */
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(databaseName)) {
        db.createObjectStore(databaseName, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Deletes an IndexedDB database with the given name.
 *
 * @param {string} databaseName The name of the database to be deleted.
 *
 * @return {Promise} Promise that resolves with the result of the delete operation.
 */
const databaseDelete = async (databaseName) => {
  // Close our own shared connection first so it doesn't block the delete.
  closeConnection(databaseName);

  databaseName = `mh-improved-${databaseName}`;

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onblocked = () => reject(new Error(`Deleting "${databaseName}" is blocked by another open connection.`));
  });
};

/**
 * Delete a broken database so it can be recreated, at most once per page load.
 *
 * @param {string} databaseName The name of the database to delete.
 *
 * @return {Promise<boolean>} Whether the delete succeeded.
 */
const deleteForRepair = async (databaseName) => {
  if (repairAttemptedDatabases.has(databaseName)) {
    return false;
  }

  repairAttemptedDatabases.add(databaseName);
  console.warn(`Recreating IndexedDB "${databaseName}" to recover from an error.`); // eslint-disable-line no-console
  notifyDatabaseIssue('repair', databaseName);

  try {
    await databaseDelete(databaseName);
    return true;
  } catch (error) {
    console.warn(`Recreating IndexedDB "${databaseName}" failed:`, error); // eslint-disable-line no-console
    notifyDatabaseIssue('repair-failed', databaseName, error);
    return false;
  }
};

/**
 * Attempt to recover a broken database by deleting and recreating it.
 *
 * @param {string} databaseName The name of the database to repair.
 *
 * @return {Promise<IDBDatabase|null>} The recreated database, or null if the repair failed.
 */
const repairDatabase = async (databaseName) => {
  if (!(await deleteForRepair(databaseName))) {
    return null;
  }

  try {
    return await openDatabase(databaseName);
  } catch (error) {
    console.warn(`Reopening IndexedDB "${databaseName}" after repair failed:`, error); // eslint-disable-line no-console
    return null;
  }
};

/**
 * Open a database connection, handling version conflicts and corruption.
 *
 * @param {string} databaseName The name of the database to connect to.
 *
 * @return {Promise<IDBDatabase|null>} The database, or null if unavailable.
 */
const connectDatabase = async (databaseName) => {
  let db;

  try {
    db = await openDatabase(databaseName);
  } catch (error) {
    if (isErrorNamed(error, 'VersionError')) {
      // A newer build (in another tab, an old userscript alongside the
      // extension, or a stale worker) already upgraded this database past the
      // version we requested. The object store name never changes across
      // versions, so open it at whatever version it's at instead of skipping it.
      try {
        db = await openDatabase(databaseName, null);
      } catch (fallbackError) {
        console.warn(`Skipping IndexedDB "${databaseName}":`, fallbackError); // eslint-disable-line no-console
        return null;
      }
    } else if (regenerableDatabases.has(databaseName)) {
      // Any other open failure usually means the browser's copy is corrupted
      // and its contents are unreadable anyway. Recreate caches; leave
      // databases holding user data alone.
      return await repairDatabase(databaseName);
    } else {
      console.warn(`IndexedDB "${databaseName}" is unavailable:`, error); // eslint-disable-line no-console
      return null;
    }
  }

  // A database missing its object store can't serve any requests and holds
  // no data, so recreating it is safe regardless of which database it is.
  if (db && !db.objectStoreNames.contains(databaseName)) {
    closeDatabase(db);
    return await repairDatabase(databaseName);
  }

  return db;
};

/**
 * Get the shared connection for a database, opening it if needed.
 *
 * Never rejects: on failure it either repairs the database (regenerable
 * caches only) or resolves to null so callers degrade to defaults.
 *
 * @param {string} databaseName The name of the database to be created.
 *
 * @return {Promise<IDBDatabase|null>} Promise that resolves with the database, or null if unavailable.
 */
const database = async (databaseName) => {
  // Accessing indexedDB itself can throw in restricted contexts (e.g. some
  // privacy modes), so treat that the same as it being absent.
  try {
    if (!globalThis.indexedDB) {
      return null;
    }
  } catch {
    return null;
  }

  if (unavailableDatabases.has(databaseName)) {
    return null;
  }

  requestPersistentStorage();

  let entry = openConnections.get(databaseName);
  if (!entry) {
    entry = {};
    entry.promise = connectDatabase(databaseName).then((db) => {
      if (openConnections.get(databaseName) === entry) {
        if (db) {
          entry.db = db;
        } else {
          // Don't cache failed opens; the next operation should retry.
          openConnections.delete(databaseName);
        }
      }

      return db;
    });

    openConnections.set(databaseName, entry);
  }

  return await entry.promise;
};

/**
 * Attach error handlers to an IDB request.
 *
 * @param {IDBRequest} request  The request to handle.
 * @param {Function}   setError Store the request error until the transaction aborts.
 */
const handleRequestError = (request, setError) => {
  request.onerror = (event) => {
    setError(event.target.error);
  };
};

/**
 * Run a single transaction against the given database's object store.
 *
 * Never rejects: if the database is unavailable or the operation fails, it
 * logs a warning and resolves with the fallback — a broken cache should
 * degrade a feature, not take it down. Read/write operations resolve only
 * after the transaction completes, so write quota/commit failures are not
 * reported as success just because the individual request succeeded.
 *
 * On failure, transient errors (aborted transactions, force-closed
 * connections) get one retry on a fresh connection for any database; if the
 * failure persists, regenerable caches are deleted and recreated.
 *
 * @param {string}   databaseName   The name of the database to operate on.
 * @param {string}   mode           The transaction mode, 'readonly' or 'readwrite'.
 * @param {Function} runRequest     Called with the object store and result setter.
 * @param {*}        [fallback]     Value to resolve with on failure.
 * @param {Function} [onFinalError] Called with the error once all retries are exhausted.
 * @param {number}   [attempt]      Which attempt this is, starting at 0.
 *
 * @return {Promise<*>} Promise that resolves with the request result, or the fallback.
 */
const dbOperation = async (databaseName, mode, runRequest, fallback, onFinalError, attempt = 0) => {
  const db = await database(databaseName);
  if (!db) {
    return fallback;
  }

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(databaseName, mode);
      const objectStore = transaction.objectStore(databaseName);
      let result = fallback;
      let transactionError;

      const setResult = (value) => {
        result = value;
      };

      const setError = (error) => {
        transactionError = error;
      };

      try {
        runRequest(objectStore, setResult, setError);
      } catch (error) {
        setError(error);

        try {
          transaction.abort();
        } catch {
          reject(error);
        }
      }

      transaction.onerror = (event) => setError(event.target.error || transaction.error);
      transaction.onabort = (event) => reject(transactionError || event.target.error || transaction.error);
      transaction.oncomplete = () => resolve(result);
    });
  } catch (error) {
    console.warn(`IndexedDB "${databaseName}" ${mode} operation failed:`, error); // eslint-disable-line no-console

    if (0 === attempt && transientErrorNames.has(error?.name)) {
      closeConnection(databaseName);
      return await dbOperation(databaseName, mode, runRequest, fallback, onFinalError, attempt + 1);
    }

    // A write to a user-data database ran out of quota. The caches are
    // regenerable, so free the space they hold and try the write once more.
    if (0 === attempt && isErrorNamed(error, 'QuotaExceededError') && !regenerableDatabases.has(databaseName)) {
      await Promise.all([...regenerableDatabases].map((cacheName) => databaseDelete(cacheName).catch(() => {})));

      return await dbOperation(databaseName, mode, runRequest, fallback, onFinalError, attempt + 1);
    }

    // A single unreadable record does not warrant wiping the whole database.
    // Fall through to onFinalError so the caller can heal just that record
    // (dbGet deletes it; dbGetAll reads around it). Reserve the whole-database
    // repair for errors that a targeted delete can't resolve.
    if (attempt < 2 && regenerableDatabases.has(databaseName) && !isUnreadableValueError(error)) {
      closeConnection(databaseName);

      if (await deleteForRepair(databaseName)) {
        return await dbOperation(databaseName, mode, runRequest, fallback, onFinalError, 2);
      }
    }

    notifyDatabaseIssue(`${mode}-failed`, databaseName, error);
    onFinalError?.(error);

    return fallback;
  }
};

/**
 * Get an item from the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to get the item from.
 * @param {string} id           The id of the item to get.
 *
 * @return {Promise} Promise that resolves with the item, or undefined if unavailable.
 */
const dbGet = async (databaseName, id) => {
  return dbOperation(
    databaseName,
    'readonly',
    (objectStore, setResult, setError) => {
      const request = objectStore.get(id);
      request.onsuccess = (event) => setResult(event.target.result);
      handleRequestError(request, setError);
    },
    undefined,
    (error) => {
      // A record whose stored value can't be read back stays unreadable
      // forever, and its data is already lost. Delete it so the store heals
      // instead of erroring on every future read of this id.
      if (isUnreadableValueError(error)) {
        console.warn(`Deleting unreadable IndexedDB record "${id}" from "${databaseName}".`); // eslint-disable-line no-console
        dbDelete(databaseName, id);
      }
    }
  );
};

/**
 * Set an item in the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to set the item in.
 * @param {Object} data         The data to set in the database.
 *
 * @return {Promise} Promise that resolves with the result of the set.
 */
const dbSet = async (databaseName, data) => {
  return dbOperation(databaseName, 'readwrite', (objectStore, setResult, setError) => {
    const request = objectStore.put({
      data,
      id: data.id || Date.now(),
    });

    request.onsuccess = (event) => setResult(event.target.result);
    handleRequestError(request, setError);
  });
};

/**
 * Delete an item from the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to delete the item from.
 * @param {string} id           The id of the item to delete.
 *
 * @return {Promise} Promise that resolves with the result of the delete.
 */
const dbDelete = async (databaseName, id) => {
  return dbOperation(databaseName, 'readwrite', (objectStore, setResult, setError) => {
    const request = objectStore.delete(id);
    request.onsuccess = (event) => setResult(event.target.result);
    handleRequestError(request, setError);
  });
};

/**
 * Get all items from a database one record at a time, skipping and deleting
 * records whose values can no longer be read back.
 *
 * Much slower than a single cursor walk, so this is only used as a recovery
 * path when a corrupt record aborts the normal read.
 *
 * @param {string} databaseName The name of the database to get the items from.
 *
 * @return {Promise<Array>} Promise that resolves with the readable items.
 */
const dbGetAllSkippingUnreadable = async (databaseName) => {
  // Walk the keys first — a key cursor never reads values, so it works even
  // when some values are corrupt.
  const ids = await dbOperation(
    databaseName,
    'readonly',
    (objectStore, setResult, setError) => {
      const keys = [];
      const request = objectStore.openKeyCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (!cursor) {
          setResult(keys);
          return;
        }

        keys.push(cursor.key);
        cursor.continue();
      };

      handleRequestError(request, setError);
    },
    null
  );

  if (!ids) {
    return [];
  }

  const items = [];
  for (const id of ids) {
    // dbGet deletes records it can't read, so the store heals as we go.
    const item = await dbGet(databaseName, id);
    if (item !== undefined) {
      items.push(item);
    }
  }

  return items;
};

/**
 * Get all items from the given IndexedDB database.
 *
 * Uses a cursor rather than getAll() to avoid Chromium's "Failed to read large
 * IndexedDB value" path for large stores. If a corrupt record still aborts the
 * read, falls back to fetching records individually and pruning the bad ones.
 *
 * @param {string} databaseName The name of the database to get the items from.
 *
 * @return {Promise} Promise that resolves with the items, or an empty array if unavailable.
 */
const dbGetAll = async (databaseName) => {
  let hitUnreadableRecord = false;

  const items = await dbOperation(
    databaseName,
    'readonly',
    (objectStore, setResult, setError) => {
      const results = [];
      const request = objectStore.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (!cursor) {
          setResult(results);
          return;
        }

        results.push(cursor.value);
        cursor.continue();
      };

      handleRequestError(request, setError);
    },
    [],
    (error) => {
      hitUnreadableRecord = isUnreadableValueError(error);
    }
  );

  if (hitUnreadableRecord) {
    console.warn(`IndexedDB "${databaseName}" has unreadable records; reading around them.`); // eslint-disable-line no-console
    return await dbGetAllSkippingUnreadable(databaseName);
  }

  return items;
};

/**
 * Get the count of items in the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to get the count from.
 *
 * @return {Promise<number>} Promise that resolves with the count of items.
 */
const dbGetCount = async (databaseName) => {
  return dbOperation(
    databaseName,
    'readonly',
    (objectStore, setResult, setError) => {
      const request = objectStore.count();
      request.onsuccess = (event) => setResult(event.target.result);
      handleRequestError(request, setError);
    },
    0
  );
};

/**
 * Delete all items from the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to delete the items from.
 *
 * @return {Promise} Promise that resolves with the result of the delete.
 */
const dbDeleteAll = async (databaseName) => {
  return dbOperation(databaseName, 'readwrite', (objectStore, setResult, setError) => {
    const request = objectStore.clear();
    request.onsuccess = (event) => setResult(event.target.result);
    handleRequestError(request, setError);
  });
};

export { database, databaseDelete, dbGet, dbSet, dbDelete, dbGetAll, dbGetCount, dbDeleteAll };
