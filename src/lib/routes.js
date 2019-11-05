'use strict';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const moment = require('moment');
const model = require('./model');
const report = require('lev-react-components').LevReport;

module.exports = server => {
  server.get('/readiness', (req, res) => {
    res.send('OK');
  });

  server.get('/data', (req, res, next) => { // eslint-disable-line consistent-return
    const fromDate = req.query && moment(req.query.from, dateFormat);
    const toDate = req.query && req.query.to && moment(req.query.to, dateFormat);

    if (fromDate && fromDate.isValid()) {
      if (!toDate || toDate.isValid()) {
        const from = fromDate.format(dateFormat);
        const to = toDate && toDate.format(dateFormat);
        return model(from, to)
          .then(data => JSON.stringify(data, null, 2))
          .then(res.end.bind(res))
          .catch(err => {
            server.log.error(err);
            next(new server.errors.InternalServerError(err));
          });
      }

      next(new server.errors.BadRequestError(`Make sure the date format is '${dateFormat}' (time is optional)`));
    } else {
      next(new server.errors.BadRequestError('Must provide a \'from\' date parameter, and optionally a \'to\' date'));
    }
  });

  server.get('/*', (req, res) => {
    let fromDate = req.query && req.query.from && moment(req.query.from, dateFormat) || moment().startOf('month');
    fromDate = (fromDate.isValid() ? fromDate : moment()).format(dateFormat);
    const toDate = req.query && req.query.to && moment(req.query.to, dateFormat);
    const currentGroup = req.query.currentGroup;

    model(fromDate, toDate, currentGroup)
      .then(props => res.render(report, props))
      .catch(err => {
        server.log.error(err);
        res.render(report);
      });
  });
};
