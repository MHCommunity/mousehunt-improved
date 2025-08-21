import { cacheSetExpiration, dbDelete, dbGetAll } from '@utils';

export default {
  version: '0.85.1',
  update: async () => {
    const caches = await dbGetAll('cache');
    for (const entry of caches) {
      const key = entry.id;
      if (
        key.startsWith('smashable-') ||
        key.startsWith('expiration-smashable-') ||
        key.startsWith('item-') ||
        key.startsWith('expiration-item-') ||
        key.startsWith('mouse-') ||
        key.startsWith('expiration-mouse-') ||
        key.startsWith('map-') ||
        key.startsWith('expiration-map-')
      ) {
        try {
          await dbDelete('cache', key);
        } catch {
          if (! key.startsWith('expiration-')) {
            await cacheSetExpiration(key, Date.now() - 1000);
          }
        }
      }
    }
  }
};
