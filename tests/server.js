const path = require('node:path');
const fp = require('fastify-plugin');

const fastify = require('fastify')({
  logger: true,
  querystringParser: str => require('qs').parse(str)
});

fastify.register(
  fp(async fastify => {
    fastify.register(require('@fastify/static'), {
      root: path.resolve('./')
    });
    fastify.register(require('../index'), {
      puppeteerOptions: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      }
    });
  })
);

fastify.listen({ port: 8044 }, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
