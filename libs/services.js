const fp = require('fastify-plugin');
const setup = require('./core/setup');
const createCache = require('./core/file-cache');
const compressing = require('compressing');
const path = require('path');

module.exports = fp(async (fastify, options) => {
  const { maxCacheKeys, root } = options;
  const cache = await createCache(options);
  const puppeteerPage = await setup(options);

  const memoCache = (cacheName, callback) => async props => {
    const currentCache = await cache.getCache(Object.assign({}, props, { cacheName }));
    if (currentCache) {
      return currentCache;
    }
    const output = await callback(props);
    if (!output.success) {
      throw output.error;
    }
    return await cache.setCache(props, output.result);
  };

  const batchTask = async (list, callback) => {
    if (list.length > maxCacheKeys) {
      throw new Error('批量操作数量超过上限');
    }
    const zipStream = new compressing.zip.Stream();
    const files = [];
    for (let target of list) {
      files.push(await callback(target));
    }
    files.forEach(filename => {
      zipStream.addEntry(path.resolve(root, filename));
    });
    return { result: zipStream, success: true };
  };

  const parseHtmlToPdf = memoCache('parseHtmlToPdf', async ({ html, options }) => {
    return await puppeteerPage.task(async ({ page }) => {
      await page.setContent(html);
      return await page.pdf(
        Object.assign(
          {},
          {
            waitUntil: 'networkidle2',
            displayHeaderFooter: true,
            printBackground: true,
            format: 'A4'
          },
          options
        )
      );
    });
  });

  const parseHtmlToPdfBatch = memoCache('parseHtmlToPdfBatch', async ({ htmlList, options }) => {
    return await batchTask(htmlList, async target => {
      return await parseHtmlToPdf({ html: target, options });
    });
  });

  const parseHtmlToPhoto = memoCache('parseHtmlToPhoto', async ({ html, options }) => {
    return await puppeteerPage.task(async ({ page }) => {
      await page.setContent(html);
      return await page.screenshot(Object.assign({}, { waitUntil: 'networkidle2', type: 'png' }, options));
    });
  });

  const parseHtmlToPhotoBatch = memoCache('parseHtmlToPhotoBatch', async ({ htmlList, options }) => {
    return await batchTask(htmlList, async target => {
      return await parseHtmlToPhoto({ html: target, options });
    });
  });

  const parseUrlToPdf = memoCache('parseUrlToPdf', async ({ url, options }) => {
    return await puppeteerPage.task(async ({ page }) => {
      await page.goto(url, {
        waitUntil: 'networkidle2'
      });
      return await page.pdf(
        Object.assign(
          {},
          {
            displayHeaderFooter: true,
            printBackground: true,
            format: 'A4'
          },
          options
        )
      );
    });
  });

  const parseUrlToPdfBatch = memoCache('parseUrlToPdfBatch', async ({ urlList, options }) => {
    return await batchTask(urlList, async target => {
      return await parseUrlToPdf({ url: target, options });
    });
  });

  const parseUrlToPhoto = memoCache('parseUrlToPhoto', async ({ url, selector, options }) => {
    return await puppeteerPage.task(async ({ page }) => {
      await page.goto(url, {
        waitUntil: 'networkidle2'
      });
      if (selector) {
        await page.locator(selector).wait();
        const element = await page.$(selector);
        const boundingBox = await element.boundingBox();
        return await page.screenshot(Object.assign({}, { type: 'png', clip: boundingBox }, options));
      }
      return await page.screenshot(Object.assign({}, { type: 'png' }, options));
    });
  });

  const parseUrlToPhotoBatch = memoCache('parseUrlToPhotoBatch', async ({ urlList, selector, options }) => {
    return await batchTask(urlList, async target => {
      return await parseUrlToPdf({ url: target, selector, options });
    });
  });

  const getFilePath = filename => {
    return path.resolve(root, filename);
  };

  Object.assign(fastify.puppeteer.services, {
    puppeteerPage,
    getFilePath,
    parseHtmlToPdf,
    parseHtmlToPdfBatch,
    parseUrlToPdf,
    parseUrlToPdfBatch,
    parseHtmlToPhoto,
    parseHtmlToPhotoBatch,
    parseUrlToPhoto,
    parseUrlToPhotoBatch
  });
});
