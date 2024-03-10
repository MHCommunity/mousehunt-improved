/**
 * Initializes a new IndexedDB database with the given name.
 *
 * @param {string} databaseName The name of the database to be created.
 *
 * @return {Promise} Promise that resolves with the database.
 */
const database = async (databaseName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`mh-improved-${databaseName}`, 1);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (! db.objectStoreNames.contains(databaseName)) {
        db.createObjectStore(databaseName, { keyPath: 'id' });
      }
    };
  });
};

const databaseDelete = async (databaseName) => {
  databaseName = `mh-improved-${databaseName}`;

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

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

  const transaction = db.transaction(databaseName, 'readonly');

  transaction.onerror = (event) => {
    throw new Error(event.target.error);
  };

  const objectStore = transaction.objectStore(databaseName);
  const request = objectStore.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
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

  const transaction = db.transaction(databaseName, 'readwrite');
  const objectStore = transaction.objectStore(databaseName);

  const request = objectStore.put(data);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    }
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

  const transaction = db.transaction(databaseName, 'readwrite');
  const objectStore = transaction.objectStore(databaseName);

  const request = objectStore.delete(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    }
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

  const transaction = db.transaction(databaseName, 'readonly');
  const objectStore = transaction.objectStore(databaseName);

  const request = objectStore.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
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

  const transaction = db.transaction(databaseName, 'readwrite');
  const objectStore = transaction.objectStore(databaseName);

  const request = objectStore.clear();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export {
  database,
  databaseDelete,
  dbGet,
  dbSet,
  dbDelete,
  dbGetAll,
  dbDeleteAll
};
