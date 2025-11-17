const fp = require('fastify-plugin');
const setup = require('./core/setup');
const createCache = require('./core/file-cache');
const compressing = require('compressing');
const path = require('node:path');
const createDeferred = require('@kne/create-deferred');

const pdfSchema = {
  type: 'object',
  properties: {
    scale: {
      type: 'number',
      description: '缩放比例（0.1-2.0）',
      default: 1.0,
      minimum: 0.1,
      maximum: 2.0
    },
    displayHeaderFooter: {
      type: 'boolean',
      description: '显示页眉页脚（需配合 headerTemplate/footerTemplate）',
      default: false
    },
    headerTemplate: {
      type: 'string',
      description: 'HTML 格式的页眉模板（需启用 displayHeaderFooter）',
      default: ''
    },
    footerTemplate: {
      type: 'string',
      description: 'HTML 格式的页脚模板（需启用 displayHeaderFooter）',
      default: ''
    },
    printBackground: {
      type: 'boolean',
      description: '打印背景图形和 CSS 颜色',
      default: true
    },
    landscape: {
      type: 'boolean',
      description: '横向布局',
      default: false
    },
    pageRanges: {
      type: 'string',
      description: "页面范围（如 '1-5, 8, 11-13'）",
      default: ''
    },
    format: {
      type: 'string',
      description: "纸张格式（如 'A4', 'Letter'）",
      enum: ['Letter', 'Legal', 'Tabloid', 'Ledger', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
      default: 'A4'
    },
    width: {
      oneOf: [{ type: 'number' }, { type: 'string' }],
      description: "自定义宽度（如 '8.5in', '200px', 200）"
    },
    height: {
      oneOf: [{ type: 'number' }, { type: 'string' }],
      description: "自定义高度（如 '11in', '300px', 300）"
    },
    margin: {
      type: 'object',
      properties: {
        top: {
          oneOf: [{ type: 'number' }, { type: 'string' }],
          description: "上边距（如 '1in', '20px'）",
          default: '0.4in'
        },
        right: {
          oneOf: [{ type: 'number' }, { type: 'string' }],
          description: '右边距',
          default: '0.4in'
        },
        bottom: {
          oneOf: [{ type: 'number' }, { type: 'string' }],
          description: '下边距',
          default: '0.4in'
        },
        left: {
          oneOf: [{ type: 'number' }, { type: 'string' }],
          description: '左边距',
          default: '0.4in'
        }
      },
      additionalProperties: false
    },
    preferCSSPageSize: {
      type: 'boolean',
      description: '优先使用 CSS 定义的 @page 尺寸',
      default: false
    },
    omitBackground: {
      type: 'boolean',
      description: '隐藏默认白色背景（需配合 printBackground: true）',
      default: false
    },
    timeout: {
      type: 'number',
      description: '超时时间（毫秒）',
      default: 30000
    },
    tagged: {
      type: 'boolean',
      description: '生成带标签的 PDF（增强可访问性）',
      default: false
    },
    waitForMaxTime: { type: 'number' },
    waitForVisible: { type: 'boolean' },
    waitForSelector: {
      oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }]
    },
    timezone: {
      type: 'string',
      description: '时区',
      default: 'Asia/Shanghai'
    },
    viewport: {
      type: 'object',
      properties: {
        width: {
          type: 'number',
          description: '视口宽度',
          default: 1366
        },
        height: {
          type: 'number',
          description: '视口高度',
          default: 768
        }
      }
    }
  },
  additionalProperties: false
};

const photoSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['png', 'jpeg', 'webp'],
      description: '截图图片格式',
      default: 'png'
    },
    quality: {
      type: 'integer',
      description: '图片质量（仅适用于 jpeg 和 webp），取值 0-100',
      minimum: 0,
      maximum: 100
    },
    fullPage: {
      type: 'boolean',
      description: '是否截取完整页面（包括滚动部分）',
      default: true
    },
    clip: {
      type: 'object',
      description: '指定裁剪区域',
      properties: {
        x: {
          type: 'number',
          description: '裁剪区域左上角 x 坐标'
        },
        y: {
          type: 'number',
          description: '裁剪区域左上角 y 坐标'
        },
        width: {
          type: 'number',
          description: '裁剪区域宽度'
        },
        height: {
          type: 'number',
          description: '裁剪区域高度'
        }
      },
      additionalProperties: false
    },
    omitBackground: {
      type: 'boolean',
      description: '是否隐藏默认白色背景（使背景透明），仅适用于 png 格式'
    },
    encoding: {
      type: 'string',
      enum: ['binary', 'base64'],
      description: '返回数据的编码格式'
    },
    captureBeyondViewport: {
      type: 'boolean',
      description: '是否捕获视口外的内容（仅当 fullPage 为 true 时有效）'
    },
    waitForMaxTime: { type: 'number' },
    waitForVisible: { type: 'boolean' },
    waitForSelector: {
      oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }]
    },
    timezone: {
      type: 'string',
      description: '时区',
      default: 'Asia/Shanghai'
    },
    viewport: {
      type: 'object',
      properties: {
        width: {
          type: 'number',
          description: '视口宽度',
          default: 1366
        },
        height: {
          type: 'number',
          description: '视口高度',
          default: 768
        }
      }
    }
  },
  additionalProperties: false
};

module.exports = fp(async (fastify, options) => {
  const { maxCacheKeys, maxConcurrent, root } = options;
  const cache = await createCache(options);
  const puppeteerPage = await setup(options);

  const deferred = createDeferred(maxConcurrent);

  const memoCache = (cacheName, callback) => async props => {
    const { force, ...inputProps } = Object.assign({}, props, { cacheName });
    const currentCache = await cache.getCache(inputProps);
    if (currentCache && !force) {
      return currentCache;
    }
    const output = await callback(props);
    if (!output.success) {
      throw output.error;
    }
    return await cache.setCache(inputProps, output.result);
  };

  const batchTask = async (list, callback) => {
    if (list.length > maxCacheKeys) {
      throw new Error('批量操作数量超过上限');
    }
    const zipStream = new compressing.zip.Stream();
    const files = [];

    for (let target of list) {
      await deferred(async () => {
        files.push(await callback(target));
      });
    }
    files.forEach(filename => {
      zipStream.addEntry(path.resolve(root, filename));
    });
    return { result: zipStream, success: true };
  };

  const parseHtmlToPdf = memoCache('parseHtmlToPdf', async ({ html, options }) => {
    return await puppeteerPage.task(
      async ({ page }) => {
        await page.setContent(html);
        return await page.pdf(
          Object.assign(
            {},
            {
              waitUntil: 'networkidle0',
              displayHeaderFooter: true,
              printBackground: true,
              format: 'A4'
            },
            options
          )
        );
      },
      { timezone: options?.timezone, viewport: options?.viewport }
    );
  });

  const parseHtmlToPdfBatch = memoCache('parseHtmlToPdfBatch', async ({ htmlList, options }) => {
    return await batchTask(htmlList, async target => {
      return await parseHtmlToPdf({ html: target, options });
    });
  });

  const parseHtmlToPhoto = memoCache('parseHtmlToPhoto', async ({ html, options }) => {
    return await puppeteerPage.task(
      async ({ page }) => {
        await page.setContent(html);
        return await page.screenshot(Object.assign({}, { waitUntil: 'networkidle0', type: 'png' }, options));
      },
      { timezone: options?.timezone, viewport: options?.viewport }
    );
  });

  const parseHtmlToPhotoBatch = memoCache('parseHtmlToPhotoBatch', async ({ htmlList, options }) => {
    return await batchTask(htmlList, async target => {
      return await parseHtmlToPhoto({ html: target, options });
    });
  });

  const parseUrlToPdf = memoCache('parseUrlToPdf', async ({ url, options = {} }) => {
    return await puppeteerPage.task(
      async ({ page }) => {
        await page.goto(url, {
          waitUntil: 'networkidle0'
        });
        await Promise.all(
          (options.waitForSelectors || []).map(waitForSelector => {
            return page.waitForSelector(waitForSelector, {
              visible: options.waitForVisible || false,
              timeout: options.waitForMaxTime || 10000
            });
          })
        );
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
      },
      { timezone: options?.timezone, viewport: options?.viewport }
    );
  });

  const parseUrlToPdfBatch = memoCache('parseUrlToPdfBatch', async ({ urlList, options }) => {
    return await batchTask(urlList, async target => {
      return await parseUrlToPdf({ url: target, options });
    });
  });

  const parseUrlToPhoto = memoCache('parseUrlToPhoto', async ({ url, selector, options = {} }) => {
    return await puppeteerPage.task(
      async ({ page }) => {
        await page.goto(url, {
          waitUntil: 'networkidle0'
        });
        await Promise.all(
          (options.waitForSelectors || []).map(waitForSelector => {
            return page.waitForSelector(waitForSelector, {
              visible: options.waitForVisible || false,
              timeout: options.waitForMaxTime || 10000
            });
          })
        );
        if (selector) {
          await page.locator(selector).wait();
          const element = await page.$(selector);
          const boundingBox = await element.boundingBox();
          return await page.screenshot(Object.assign({}, { type: 'png' }, options, { clip: boundingBox, fullPage: false }));
        }
        return await page.screenshot(Object.assign({}, { type: 'png' }, options));
      },
      { timezone: options?.timezone, viewport: options?.viewport }
    );
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
    pdfSchema,
    photoSchema,
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
