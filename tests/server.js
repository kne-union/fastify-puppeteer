const fastify = require('fastify')({
  logger: true, querystringParser: str => require('qs').parse(str)
});

fastify.register(require('../index'), {
  puppeteerOptions: {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  }
});

fastify.listen({ port: 3046 }, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
