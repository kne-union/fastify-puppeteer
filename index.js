const fp = require('fastify-plugin');
const path = require('path');
const packageJson = require('./package.json');
const merge = require('lodash/merge');

module.exports = fp(
  async (fastify, options) => {
    options = merge(
      {
        root: path.resolve(process.cwd(), '.puppeteer_cache'),
        prefix: `/api/v${packageJson.version.split('.')[0]}/puppeteer`,
        maxCacheKeys: 1000,
        maxTaskSize: 100,
        puppeteerOptions: {},
        authenticate: []
      },
      options
    );

    fastify.register(
      require('@fastify/static'),
      Object.assign({}, options.static, {
        root: options.root,
        index: false,
        list: false
      })
    );

    fastify.register(require('@kne/fastify-namespace'), {
      name: 'puppeteer',
      options,
      modules: [
        ['services', path.resolve(__dirname, './libs/services.js')],
        ['controllers', path.resolve(__dirname, './libs/controllers.js')]
      ]
    });
  },
  {
    name: 'fastify-puppeteer'
  }
);
