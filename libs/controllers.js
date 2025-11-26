const fp = require('fastify-plugin');
const { decode } = require('plantuml-encoder');

module.exports = fp(async (fastify, options) => {
  const { services } = fastify.puppeteer;
  const { photoSchema, pdfSchema } = services;
  fastify.post(
    `${options.prefix}/parseHtmlToPdf`,
    {
      onRequest: options.authenticate,
      schema: {
        description: '接口说明',
        summary: 'html生成pdf文件流',
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            options: pdfSchema,
            content: { type: 'string' }
          }
        }
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
      description: '接口说明',
      summary: 'html生成pdf文件流',
      query: {
        type: 'object',
        required: ['content'],
        properties: {
          options: pdfSchema,
          content: { type: 'string' }
        }
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
        description: '接口说明',
        summary: '批量将html生成pdf的zip文件流',
        body: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: pdfSchema,
            contentList: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
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
        description: '接口说明',
        summary: '批量将html生成pdf的zip文件流',
        query: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: pdfSchema,
            contentList: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
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
        description: '接口说明',
        summary: '批量将html生成png的zip文件流',
        body: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: photoSchema,
            contentList: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
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
        description: '接口说明',
        summary: '批量将html生成png的zip文件流',
        query: {
          type: 'object',
          required: ['contentList'],
          properties: {
            options: photoSchema,
            contentList: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
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
        description: '接口说明',
        summary: 'html生成png文件流',
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            options: photoSchema,
            content: { type: 'string' }
          }
        }
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
        description: '接口说明',
        summary: 'html生成png文件流',
        query: {
          type: 'object',
          required: ['content'],
          properties: {
            options: photoSchema,
            content: { type: 'string' }
          }
        }
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
        description: '接口说明',
        summary: 'url生成pdf文件流',
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            options: pdfSchema,
            url: { type: 'string' }
          }
        }
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
        description: '接口说明',
        summary: 'url生成pdf文件流',
        query: {
          type: 'object',
          required: ['url'],
          properties: {
            options: pdfSchema,
            url: { type: 'string' }
          }
        }
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
        description: '接口说明',
        summary: 'url生成pdf文件流',
        body: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: pdfSchema,
            urlList: { type: 'array', items: { type: 'string' } }
          }
        }
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
        description: '接口说明',
        summary: 'url生成pdf文件流',
        query: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: pdfSchema,
            urlList: { type: 'array', items: { type: 'string' } }
          }
        }
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
        description: '接口说明',
        summary: 'url生成png文件流',
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            options: photoSchema,
            url: { type: 'string' },
            selector: { type: 'string' }
          }
        }
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
        description: '接口说明',
        summary: 'url生成png文件流',
        query: {
          type: 'object',
          required: ['url'],
          properties: {
            options: photoSchema,
            url: { type: 'string' },
            selector: { type: 'string' }
          }
        }
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
        description: '接口说明',
        summary: 'url生成png文件流',
        body: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: photoSchema,
            urlList: { type: 'array', items: { type: 'string' } },
            selector: { type: 'string' }
          }
        }
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
        description: '接口说明',
        summary: 'url生成png文件流',
        query: {
          type: 'object',
          required: ['urlList'],
          properties: {
            options: photoSchema,
            urlList: { type: 'array', items: { type: 'string' } },
            selector: { type: 'string' }
          }
        }
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
