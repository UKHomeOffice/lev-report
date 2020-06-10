'use strict';

const { promiseResponder, dashboard, history, home, homeError } = require('./route-helpers');
const { History, LevDashboard, LevReport } = require('lev-react-components');

const routes = server => {
  server.get('/readiness', (req, res) => res.send('OK'));

  server.get('/data', promiseResponder(homeError(server.errors.BadRequestError)));

  server.get('/dashboard', promiseResponder(dashboard, LevDashboard));

  server.get('/dashboard/data', promiseResponder(dashboard));

  server.get('/history', promiseResponder(history, History));

  server.get('/*', promiseResponder(home, LevReport));
};

module.exports = routes;
