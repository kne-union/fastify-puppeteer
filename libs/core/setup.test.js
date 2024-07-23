const setup = require('./setup');
(async () => {
  const puppeteerPage = await setup({
    puppeteerOptions: {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
  });

  const output = await puppeteerPage.task(async ({ page }) => {
    await page.setContent('<h1>哈哈哈</h1>');
    return await page.pdf();
  });

  console.log(output);

  await puppeteerPage.close();
})();
