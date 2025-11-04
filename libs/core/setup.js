const puppeteer = require('puppeteer');
const createDeferred = require('@kne/create-deferred');

module.exports = async options => {
  options = Object.assign({ maxTaskSize: 100, pageViewport: {}, puppeteerOptions: {} }, options);
  const browser = await puppeteer.launch(options.puppeteerOptions);
  const deferred = createDeferred(options.maxTaskSize);
  return {
    task: async callback => {
      return await deferred(async () => {
        const page = await browser.newPage();
        await page.setViewport(Object.assign({}, options.pageViewport, { width: options.pageWidth, height: options.pageHeight }));
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
