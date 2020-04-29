'use strict';

const dateFormat = 'YYYY-MM-DD';
const moment = require('moment-timezone');
const model = require('./model');
const dashboardModel = require('./dashboard-model');

const promiseResponder = (promise, Component) => (req, res, next) => promise(req.query)
  .then(data => Component ? res.render(Component, data) : res.send(data))
  .catch(err => {
    req.log.error(err);
    return next(err);
  });

const dateChecker = (d) => !!d && moment.tz(d, dateFormat, true, 'Europe/London').format();

const home = (query, ErrorReporter) => new Promise((resolve) => {
  const fromDate = dateChecker(query && query.from);
  if (ErrorReporter && fromDate === 'Invalid date') {
    throw new ErrorReporter('Must provide "from" date parameter, and optionally a "to" date');
  }
  const toDate = dateChecker(query && query.to);
  if (ErrorReporter && toDate === 'Invalid date') {
    throw new ErrorReporter(`Make sure the date format is "${dateFormat}" (time is ignored)`);
  }
  const searchGroup = query && query.currentGroup;

  return resolve(model(
    (fromDate ? fromDate : moment.tz('Europe/London').startOf('month').format()),
    toDate,
    searchGroup === 'No group' ? '{}' : searchGroup,
    searchGroup,
    query && query.withoutGroups
  ));
});

module.exports = {
  dateChecker,
  promiseResponder,
  dashboard: dashboardModel,
  home,
  homeError: ErrorReporter => req => home(req, ErrorReporter)
};
