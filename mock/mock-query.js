const daily = require('./daily-counts');
const totals = require('./dataset-totals');
const groups = require('./group-data');
const dailySearches = require('./daily-total-searches');
const allTime = require('./all-time-searches');

module.exports = {
  usageByDateType: () => Promise.resolve(daily),
  usageByType: () => Promise.resolve(totals),
  usageByGroup: () => Promise.resolve(groups),
  searchTotals: () => Promise.resolve(allTime),
  // eslint-disable-next-line no-dupe-keys
  searchTotals: () => Promise.resolve(dailySearches),
  searchTimePeriodByGroup: () => Promise.resolve(dailySearches)
};
