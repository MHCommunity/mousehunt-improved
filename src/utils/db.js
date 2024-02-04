const database = async (databaseName) => {
  const request = window.indexedDB.open('mh-improved', 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objectStore = db.createObjectStore(databaseName, { keyPath: 'id' });
    objectStore.createIndex('id', 'id', { unique: true });
  };

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

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
  });
};

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
  });
};

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
  });
};

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
  });
};

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
  });
};

export {
  dbGet,
  dbSet,
  dbDelete,
  dbGetAll,
  dbDeleteAll
};
