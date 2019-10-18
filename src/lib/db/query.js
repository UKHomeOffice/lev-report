'use strict';

const db = require('./postgres');

const countsByDateType =
  'SELECT date_time::DATE AS date, dataset, count(*)::INTEGER FROM lev_audit WHERE date_time > $1';
const countsByType = 'SELECT dataset, count(*)::INTEGER FROM lev_audit WHERE date_time > $1';
const countsByUser =
  'SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER FROM lev_audit WHERE date_time > $1';
const until = 'AND date_time < $2';
const groupByDateType = ' GROUP BY date_time::date, dataset ORDER BY date_time::date';
const groupByType = ' GROUP BY dataset';
const groupByDateTypeUser = ' GROUP BY date_time::date, dataset, username ORDER BY date_time::date';
const groupByTypeGroup = 'GROUP BY name, dataset';
const totalCounts = 'SELECT count(*) FROM lev_audit';
const dailyCount = 'SELECT count(*) FROM lev_audit WHERE CAST(date_time AS DATE) = current_date';

const buildCountsByGroup = (from, to, includeNoGroup = true) => `
SELECT name, dataset, SUM(count)::INTEGER AS count
FROM (
  SELECT UNNEST(groups) AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE date_time > $1 ${to ? until : ''}
    ${groupByTypeGroup} ${includeNoGroup ? `
  UNION
  SELECT 'No group' AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE groups='{}' AND date_time > $1 ${to ? until : ''}` : ''}
    ${groupByTypeGroup}
) AS counts
${groupByTypeGroup}
ORDER BY name~'^/Team' desc, name`;

module.exports = {
  usageByDateType: (from, to) => db.manyOrNone(
    `${countsByDateType} ${to ? until : ''} ${groupByDateType}`,
    to ? [from, to] : from)
    .catch(e => {
      global.logger.error(`Problem retrieving counts for datatypes by day between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByType: (from, to) => db.manyOrNone(
    `${countsByType} ${to ? until : ''} ${groupByType}`,
    to ? [from, to] : from)
    .catch(e => {
      global.logger.error(`Problem retrieving counts for datatypes between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByGroup: (from, to) => db.manyOrNone(buildCountsByGroup(from, to), to ? [from, to] : from)
    .catch(e => {
      global.logger.error(`Problem retrieving counts for groups between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByUser: (from, to) => db.manyOrNone(
    `${countsByUser} ${to ? until : ''} ${groupByDateTypeUser}`,
    to ? [from, to] : from)
    .catch(e => {
      global.logger.error(`Problem retrieving counts for users between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  allTimeSearches: () => db.manyOrNone(
    `${totalCounts}`)
    .catch(e => {
      global.logger.error('Problem retrieving a count for total all time searches', e);
      throw new Error('Could not fetch data');
    }),

  dailySearches: () => db.manyOrNone(
  `${dailyCount}`)
  .catch(e => {
    global.logger.error('Problem retrieving a count for searches today', e);
    throw new Error('Could not fetch data');
  })
};
