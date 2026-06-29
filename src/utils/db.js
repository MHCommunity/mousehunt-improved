/**
 * Initializes a new IndexedDB database with the given name.
 *
 * @param {string} databaseName The name of the database to be created.
 *
 * @return {Promise} Promise that resolves with the database.
 */
const database = async (databaseName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`mh-improved-${databaseName}`, 7);

    request.onerror = (event) => {
      const error = event.target.error;

      // A VersionError means a newer build (in another tab or a stale worker)
      // already upgraded this database to a higher version than we requested.
      // Resolve to null so callers degrade gracefully (return defaults) instead
      // of throwing an unhandled exception during boot.
      if (error && 'VersionError' === error.name) {
        console.warn(`Skipping IndexedDB "${databaseName}": ${error.message}`); // eslint-disable-line no-console
        resolve(null);
        return;
      }

      reject(error);
    };

    // Another connection is blocking the upgrade (e.g. an older tab still open).
    // Resolve to null rather than hanging or surfacing an error.
    request.onblocked = () => {
      console.warn(`IndexedDB "${databaseName}" upgrade blocked by another connection.`); // eslint-disable-line no-console
      resolve(null);
    };

    request.onsuccess = (event) => resolve(event.target.result);

    /**
     * On upgrade needed event.
     *
     * @param {Event} event The event object.
     */
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (! db.objectStoreNames.contains(databaseName)) {
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
  databaseName = `mh-improved-${databaseName}`;

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

/**
 * Get an item from the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to get the item from.
 * @param {string} id           The id of the item to get.
 *
 * @return {Promise} Promise that resolves with the item.
 */
const dbGet = async (databaseName, id) => {
  const db = await database(databaseName);
  if (! db) {
    return;
  }

  const transaction = db.transaction(databaseName, 'readonly');
  const objectStore = transaction.objectStore(databaseName);
  const request = objectStore.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      db.close();
      resolve(event.target.result);
    };

    // Reject (rather than throw) on transaction-level failures so callers can
    // handle them. Throwing inside an IndexedDB event handler escapes to the
    // event loop as an unhandled exception instead of rejecting this promise.
    request.onerror = (event) => reject(event.target.error);
    transaction.onerror = (event) => reject(event.target.error);
    transaction.onabort = (event) => reject(event.target.error);
  });
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
  const db = await database(databaseName);
  if (! db) {
    return;
  }

  const transaction = db.transaction(databaseName, 'readwrite');
  const objectStore = transaction.objectStore(databaseName);

  data = {
    data,
    id: data.id || Date.now()
  };

  const request = objectStore.put(data);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => db.close();
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
  const db = await database(databaseName);
  if (! db) {
    return;
  }

  const transaction = db.transaction(databaseName, 'readwrite');
  const objectStore = transaction.objectStore(databaseName);

  const request = objectStore.delete(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => db.close();
  });
};

/**
 * Get all items from the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to get the items from.
 *
 * @return {Promise} Promise that resolves with the items.
 */
const dbGetAll = async (databaseName) => {
  const db = await database(databaseName);
  if (! db) {
    return [];
  }

  const transaction = db.transaction(databaseName, 'readonly');
  const objectStore = transaction.objectStore(databaseName);

  const request = objectStore.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => db.close();
  });
};

/**
 * Get the count of items in the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to get the count from.
 *
 * @return {Promise<number>} Promise that resolves with the count of items.
 */
const dbGetCount = async (databaseName) => {
  const db = await database(databaseName);
  if (! db) {
    return 0;
  }

  const transaction = db.transaction(databaseName, 'readonly');
  const objectStore = transaction.objectStore(databaseName);
  const request = objectStore.count();

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => db.close();
  });
};

/**
 * Delete all items from the given IndexedDB database.
 *
 * @param {string} databaseName The name of the database to delete the items from.
 *
 * @return {Promise} Promise that resolves with the result of the delete.
 */
const dbDeleteAll = async (databaseName) => {
  const db = await database(databaseName);
  if (! db) {
    return;
  }

  const transaction = db.transaction(databaseName, 'readwrite');
  const objectStore = transaction.objectStore(databaseName);

  const request = objectStore.clear();

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => db.close();
  });
};

export {
  database,
  databaseDelete,
  dbGet,
  dbSet,
  dbDelete,
  dbGetAll,
  dbGetCount,
  dbDeleteAll
};
