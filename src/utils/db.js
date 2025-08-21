/**
 * Initializes a new IndexedDB database with the given name.
 *
 * @param {string} databaseName The name of the database to be created.
 * @param {number} version      The version of the database (default: 7).
 *
 * @return {Promise} Promise that resolves with the database.
 */
const database = async (databaseName, version = 7) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`mh-improved-${databaseName}`, version);

    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);

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
  const fullName = `mh-improved-${databaseName}`;

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(fullName);
    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

const waitRequest = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });

const waitTransaction = (tx) =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = (event) => reject(event.target.error || new Error('Transaction error'));
    tx.onabort = (event) => reject(event.target.error || new Error('Transaction aborted'));
  });

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
  try {
    const tx = db.transaction(databaseName, 'readonly');
    const objectStore = tx.objectStore(databaseName);
    const request = objectStore.get(id);
    const result = await waitRequest(request);
    return result;
  } finally {
    db.close();
  }
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
  try {
    const tx = db.transaction(databaseName, 'readwrite');
    const objectStore = tx.objectStore(databaseName);

    const payload = {
      data,
      id: data.id || Date.now(),
    };

    const request = objectStore.put(payload);
    const result = await waitRequest(request);
    await waitTransaction(tx);
    return result;
  } finally {
    db.close();
  }
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
  try {
    const tx = db.transaction(databaseName, 'readwrite');
    const objectStore = tx.objectStore(databaseName);
    const request = objectStore.delete(id);
    const result = await waitRequest(request);
    await waitTransaction(tx);
    return result;
  } finally {
    db.close();
  }
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
  try {
    const tx = db.transaction(databaseName, 'readonly');
    const objectStore = tx.objectStore(databaseName);
    const request = objectStore.getAll();
    const result = await waitRequest(request);
    return result;
  } finally {
    db.close();
  }
};

const dbGetCount = async (databaseName) => {
  const db = await database(databaseName);
  try {
    const tx = db.transaction(databaseName, 'readonly');
    const objectStore = tx.objectStore(databaseName);
    const request = objectStore.count();
    const result = await waitRequest(request);
    return result;
  } finally {
    db.close();
  }
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
  try {
    const tx = db.transaction(databaseName, 'readwrite');
    const objectStore = tx.objectStore(databaseName);
    const request = objectStore.clear();
    const result = await waitRequest(request);
    await waitTransaction(tx);
    return result;
  } finally {
    db.close();
  }
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
