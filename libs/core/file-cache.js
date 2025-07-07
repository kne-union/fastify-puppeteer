const { LRUCache } = require('lru-cache');
const path = require('path');
const fs = require('fs-extra');
const merge = require('lodash/merge');
const fileType = require('file-type');
const objectHash = require('object-hash');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = async options => {
  options = merge(
    {},
    {
      maxCacheKeys: 1000,
      root: path.resolve(process.cwd(), '.puppeteer_cache')
    },
    options
  );
  await fs.emptyDir(options.root);
  const cache = new LRUCache({
    max: options.maxCacheKeys,
    dispose: async value => {
      await fs.remove(path.resolve(options.root, value));
    }
  });
  console.log('init cache dir');
  return {
    setCache: async (object, file) => {
      const hash = objectHash(object);
      const md5 = crypto.createHash('md5').update(file).digest('hex');
      if (Buffer.isBuffer(file)) {
        const { ext } = await fileType.fromBuffer(file);
        const filename = md5 + '.' + ext;
        const filePath = path.resolve(options.root, filename);
        await fs.writeFile(filePath, file);
        cache.set(hash, filename);
        return filename;
      } else {
        const filename = md5 + '.zip';
        const filePath = path.resolve(options.root, filename);
        await new Promise((resolve, reject) => {
          file.pipe(fs.createWriteStream(filePath)).on('error', reject).on('finish', resolve);
        });

        cache.set(hash, filename);
        return filename;
      }
    },
    getCache: async object => {
      const filename = cache.get(objectHash(object));
      if (!filename) {
        return null;
      }
      if (!(await fs.exists(path.resolve(options.root, filename)))) {
        return null;
      }

      return filename;
    }
  };
};
