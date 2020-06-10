'use strict';

const moment = require('moment');
const { cumulativeUsage } = require('./db/query');

const processHistory = data => ({ data: data.map(({ month, count }) => ({ month: moment(month).unix(), count })) });
const history = () => cumulativeUsage().then(processHistory);

module.exports = { history, processHistory };
