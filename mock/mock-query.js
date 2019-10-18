const daily = require('./daily-counts');
const totals = require('./dataset-totals');
const groups = require('./group-data');
const dailySearches = require('./daily-total-searches');

module.exports = {
  usageByDateType: () => Promise.resolve(daily),
  usageByType: () => Promise.resolve(totals),
  usageByGroup: () => Promise.resolve(groups),
  // searchesToday: () => Promise.resolve(dailySearches.searches)
};
