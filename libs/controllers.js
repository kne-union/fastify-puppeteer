const fp = require('fastify-plugin');
const { decode } = require('plantuml-encoder');
const { pdfFile, photoFile, zipFile, filename, encodedContent } = require('./schema/response');

const PDF_TAG = '无头浏览器-PDF生成';
const PHOTO_TAG = '无头浏览器-网页截图';
const CACHE_HINT = '相同参数的结果会缓存在本地目录，命中缓存时直接返回已生成的文件';

module.exports = fp(async (fastify, options) => {
  const { services } = fastify.puppeteer;
  const { photoSchema, pdfSchema } = services;
  fastify.post(
    `${options.prefix}/parseHtmlToPdf`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PDF_TAG],
        summary: 'html生成pdf文件流',
        description: `用无头浏览器加载 HTML 内容并生成PDF；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            options: pdfSchema,
            content: { type: 'string', description: '要渲染的 HTML 内容' },
            filename
          }
        },
        response: pdfFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPdf({ html: request.body.content, options: request.body.options });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );
  fastify.get(
    `${options.prefix}/parseHtmlToPdf`,
    {
      schema: {
        tags: [PDF_TAG],
        summary: 'html生成pdf文件流',
        description: `GET 方式把 HTML 渲染为 PDF，content 需先用 plantuml-encoder 压缩编码；${CACHE_HINT}。注意：该路由未做参数校验，也未挂 authenticate 鉴权`,
        query: {
          type: 'object',
          properties: {
            options: { description: 'PDF 生成参数，结构同 POST /parseHtmlToPdf 的 options（按 querystring 嵌套格式传递）；该路由不校验也不填充默认值' },
            content: { description: `要渲染${encodedContent}` },
            filename
          }
        },
        response: pdfFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPdf({ html: decode(request.query.content), options: request.query.options });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.post(
    `${options.prefix}/parseHtmlToPdfBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PDF_TAG],
        summary: '批量将html生成pdf的zip文件流',
        description: `把多段 HTML 分别渲染为PDF并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: pdfSchema,
            contentList: {
              type: 'array',
              description: '要渲染的 HTML 内容列表，每一项生成一个文件',
              items: {
                type: 'string'
              }
            },
            filename
          }
        },
        response: zipFile('PDF')
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPdfBatch({
        htmlList: request.body.contentList,
        options: request.body.options
      });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.get(
    `${options.prefix}/parseHtmlToPdfBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PDF_TAG],
        summary: '批量将html生成pdf的zip文件流',
        description: `把多段 HTML 分别渲染为PDF并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys；GET 方式的 HTML 内容需先用 plantuml-encoder 压缩编码；${CACHE_HINT}`,
        query: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: pdfSchema,
            contentList: {
              type: 'array',
              description: `要渲染的 HTML 内容列表，每一项都是需先用 plantuml-encoder 的 encode 压缩编码的 HTML`,
              items: {
                type: 'string'
              }
            },
            filename
          }
        },
        response: zipFile('PDF')
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPdfBatch({
        htmlList: request.query.contentList.map(item => decode(item)),
        options: request.query.options
      });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.post(
    `${options.prefix}/parseHtmlToPhotoBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: '批量将html生成png的zip文件流',
        description: `把多段 HTML 分别渲染为图片并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: photoSchema,
            contentList: {
              type: 'array',
              description: '要渲染的 HTML 内容列表，每一项生成一个文件',
              items: {
                type: 'string'
              }
            },
            filename
          }
        },
        response: zipFile('图片')
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPhotoBatch({
        htmlList: request.body.contentList,
        options: request.body.options
      });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.get(
    `${options.prefix}/parseHtmlToPhotoBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: '批量将html生成png的zip文件流',
        description: `把多段 HTML 分别渲染为图片并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys；GET 方式的 HTML 内容需先用 plantuml-encoder 压缩编码；${CACHE_HINT}`,
        query: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: photoSchema,
            contentList: {
              type: 'array',
              description: `要渲染的 HTML 内容列表，每一项都是需先用 plantuml-encoder 的 encode 压缩编码的 HTML`,
              items: {
                type: 'string'
              }
            },
            filename
          }
        },
        response: zipFile('图片')
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPhotoBatch({
        htmlList: request.query.contentList.map(item => decode(item)),
        options: request.query.options
      });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.post(
    `${options.prefix}/parseHtmlToPhoto`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: 'html生成png文件流',
        description: `用无头浏览器加载 HTML 内容并生成图片；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            options: photoSchema,
            content: { type: 'string', description: '要渲染的 HTML 内容' },
            filename
          }
        },
        response: photoFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPhoto({
        html: request.body.content,
        options: request.body.options
      });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.get(
    `${options.prefix}/parseHtmlToPhoto`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: 'html生成png文件流',
        description: `用无头浏览器加载 HTML 内容并生成图片；GET 方式的 HTML 内容需先用 plantuml-encoder 压缩编码；${CACHE_HINT}`,
        query: {
          type: 'object',
          required: ['content'],
          properties: {
            options: photoSchema,
            content: { type: 'string', description: `要渲染${encodedContent}` },
            filename
          }
        },
        response: photoFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseHtmlToPhoto({
        html: decode(request.query.content),
        options: request.query.options
      });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.post(
    `${options.prefix}/parseUrlToPdf`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PDF_TAG],
        summary: 'url生成pdf文件流',
        description: `用无头浏览器打开网页地址（等待网络空闲）后生成PDF；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            options: pdfSchema,
            url: { type: 'string', description: '要打开的网页地址' },
            filename
          }
        },
        response: pdfFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPdf({ url: request.body.url, options: request.body.options });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.get(
    `${options.prefix}/parseUrlToPdf`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PDF_TAG],
        summary: 'url生成pdf文件流',
        description: `用无头浏览器打开网页地址（等待网络空闲）后生成PDF；${CACHE_HINT}`,
        query: {
          type: 'object',
          required: ['url'],
          properties: {
            options: pdfSchema,
            url: { type: 'string', description: '要打开的网页地址' },
            filename
          }
        },
        response: pdfFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPdf({ url: request.query.url, options: request.query.options });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.post(
    `${options.prefix}/parseUrlToPdfBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PDF_TAG],
        summary: 'url批量生成pdf的zip文件流',
        description: `逐个打开网页地址生成PDF并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: pdfSchema,
            urlList: { type: 'array', items: { type: 'string' }, description: '要打开的网页地址列表，每一项生成一个文件' },
            filename
          }
        },
        response: zipFile('PDF')
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPdfBatch({
        urlList: request.body.urlList,
        options: request.body.options
      });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.get(
    `${options.prefix}/parseUrlToPdfBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PDF_TAG],
        summary: 'url批量生成pdf的zip文件流',
        description: `逐个打开网页地址生成PDF并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys；${CACHE_HINT}`,
        query: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: pdfSchema,
            urlList: { type: 'array', items: { type: 'string' }, description: '要打开的网页地址列表，每一项生成一个文件' },
            filename
          }
        },
        response: zipFile('PDF')
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPdfBatch({
        urlList: request.query.urlList,
        options: request.query.options
      });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.post(
    `${options.prefix}/parseUrlToPhoto`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: 'url生成png文件流',
        description: `用无头浏览器打开网页地址（等待网络空闲）后生成图片；传 selector 时只截取该元素区域；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            options: photoSchema,
            url: { type: 'string', description: '要打开的网页地址' },
            selector: { type: 'string', description: 'CSS 选择器；传入时等待该元素出现并只截取其区域，不传截取整个页面' },
            filename
          }
        },
        response: photoFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPhoto({
        url: request.body.url,
        selector: request.body.selector,
        options: request.body.options
      });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.get(
    `${options.prefix}/parseUrlToPhoto`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: 'url生成png文件流',
        description: `用无头浏览器打开网页地址（等待网络空闲）后生成图片；传 selector 时只截取该元素区域；${CACHE_HINT}`,
        query: {
          type: 'object',
          required: ['url'],
          properties: {
            options: photoSchema,
            url: { type: 'string', description: '要打开的网页地址' },
            selector: { type: 'string', description: 'CSS 选择器；传入时等待该元素出现并只截取其区域，不传截取整个页面' },
            filename
          }
        },
        response: photoFile
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPhoto({
        url: request.query.url,
        selector: request.query.selector,
        options: request.query.options
      });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.post(
    `${options.prefix}/parseUrlToPhotoBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: 'url批量生成png的zip文件流',
        description: `逐个打开网页地址生成图片并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys。注意：当前实现实际调用的是 url 生成 PDF，压缩包内为 PDF 文件且 selector 不生效；${CACHE_HINT}`,
        body: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: photoSchema,
            urlList: { type: 'array', items: { type: 'string' }, description: '要打开的网页地址列表，每一项生成一个文件' },
            selector: { type: 'string', description: 'CSS 选择器，只截取该元素区域（当前实现未生效，见接口说明）' },
            filename
          }
        },
        response: zipFile('图片')
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPhotoBatch({
        urlList: request.body.urlList,
        selector: request.body.selector,
        options: request.body.options
      });
      request.body.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.body.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );

  fastify.get(
    `${options.prefix}/parseUrlToPhotoBatch`,
    {
      onRequest: options.authenticate,
      schema: {
        tags: [PHOTO_TAG],
        summary: 'url批量生成png的zip文件流',
        description: `逐个打开网页地址生成图片并打包为 zip 返回，数量不能超过插件配置 maxCacheKeys。注意：当前实现实际调用的是 url 生成 PDF，压缩包内为 PDF 文件且 selector 不生效；${CACHE_HINT}`,
        query: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: photoSchema,
            urlList: { type: 'array', items: { type: 'string' }, description: '要打开的网页地址列表，每一项生成一个文件' },
            selector: { type: 'string', description: 'CSS 选择器，只截取该元素区域（当前实现未生效，见接口说明）' },
            filename
          }
        },
        response: zipFile('图片')
      }
    },
    async (request, reply) => {
      const filename = await services.parseUrlToPhotoBatch({
        urlList: request.query.urlList,
        selector: request.query.selector,
        options: request.query.options
      });
      request.query.filename && reply.header('Content-Disposition', `attachment; filename=${encodeURIComponent(request.query.filename)}`);
      return reply.sendFile(filename, { root: options.root });
    }
  );
});
