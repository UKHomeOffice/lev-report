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

const dateError = RequestError => (value, message) => {
  const date = dateChecker(value);
  if (date === 'Invalid date') {
    throw new RequestError(message);
  }
  return date;
};

const home = (validate = dateChecker) => (query = {}) => new Promise((resolve) => {
  const fromDate = validate(query.from, 'Must provide "from" date parameter, and optionally a "to" date');
  const searchGroup = query.currentGroup;
  return resolve(model(
    (fromDate ? fromDate : moment.tz('Europe/London').startOf('month').format()),
    validate(query.to, `Make sure the date format is "${dateFormat}" (time is ignored)`),
    searchGroup === 'No group' ? '{}' : searchGroup,
    searchGroup,
    query.withoutGroups
  ));
});

module.exports = {
  dateChecker,
  promiseResponder,
  dashboard: dashboardModel,
  home: home(),
  homeError: RequestError => home(dateError(RequestError))
};
