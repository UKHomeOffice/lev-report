'use strict';

global.Promise = require('bluebird');
const config = require('./config');

const restify = require('lev-restify');
const server = restify.createServer(config.name);
server.errors = restify.errors;
global.logger = server.log;

server.get('/favicon.ico', (req, res, next) => res.redirect({
  pathname: '/public/images/crown-favicon.ico',
  query: {},
  permanent: true,
  overrideQuery: true
}, next));
server.get('/public/*', restify.plugins.serveStaticFiles('./public'));

const reactRenderer = require('lev-react-renderer');
server.use(reactRenderer);
const routes = require('./lib/routes');
routes(server);

server.listen(config.http.port, config.http.host, () => {
  global.logger.info('%s listening at %s', server.name, server.url);
});


// gracefully handle shutdowns -----------------------

const closeGracefully = (signal) => {
  setTimeout(() => {
    global.logger.warn('Forcefully shutting down from sig:', signal);
    process.exit(0); // eslint-disable-line no-process-exit
  }, 500);

  server.close(() => process.exit(0)); // eslint-disable-line no-process-exit
};

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal =>
  process.on(signal, () => closeGracefully(signal))
);
