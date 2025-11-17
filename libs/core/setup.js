const puppeteer = require('puppeteer');
const createDeferred = require('@kne/create-deferred');

module.exports = async options => {
  options = Object.assign({ maxTaskSize: 100, pageViewport: {}, puppeteerOptions: {} }, options);
  const browser = await puppeteer.launch(options.puppeteerOptions);
  const deferred = createDeferred(options.maxTaskSize);
  return {
    task: async (callback, pageOptions) => {
      pageOptions = Object.assign(
        {},
        {
          timezone: 'Asia/Shanghai',
          viewport: {}
        },
        pageOptions
      );
      return await deferred(async () => {
        const page = await browser.newPage();
        console.log('puppeteer task start');
        await page.emulateTimezone(pageOptions.timezone);
        await page.setViewport(Object.assign({}, options.pageViewport, Object.assign({}, { width: options.pageWidth, height: options.pageHeight }, pageOptions.viewport)));
        const output = await (async () => {
          try {
            return {
              success: true,
              result: await callback({ page })
            };
          } catch (e) {
            console.error(e);
            return { success: false, error: e };
          }
        })();

        await page.close();
        console.log('puppeteer task complete');
        return output;
      });
    },
    close: async () => {
      console.log('puppeteer browser close');
      await browser.close();
    }
  };
};
