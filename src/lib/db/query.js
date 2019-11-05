'use strict';

const db = require('./postgres');

const countsByDateType =
  'SELECT date_time::DATE AS date, dataset, count(*)::INTEGER FROM lev_audit WHERE date_time > $(from)';
const countsByType = 'SELECT dataset, count(*)::INTEGER FROM lev_audit WHERE date_time > $(from)';
const countsByUser =
  'SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER FROM lev_audit WHERE date_time > $(from)';
const until = 'AND date_time < $(to)';
const groupFilter = ' AND groups::TEXT ILIKE $(group)';
const noDateGroupFilter = ' WHERE groups::TEXT ILIKE $(group)';
const groupByDateType = ' GROUP BY date_time::date, dataset ORDER BY date_time::date';
const groupByType = ' GROUP BY dataset';
const groupByDateTypeUser = ' GROUP BY date_time::date, dataset, username ORDER BY date_time::date';
const groupByTypeGroup = 'GROUP BY name, dataset';
const totalCount = 'SELECT count(*) FROM lev_audit';
const dailyCount = 'SELECT count(*) FROM lev_audit WHERE date_time::DATE = current_date';

const buildCountsByGroup = (from, to, includeNoGroup = true) => `
SELECT name, dataset, SUM(count)::INTEGER AS count
FROM (
  SELECT UNNEST(groups) AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE date_time > $(from) ${to ? until : ''}
    ${groupByTypeGroup} ${includeNoGroup ? `
  UNION
  SELECT 'No group' AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE groups='{}' AND date_time > $(from) ${to ? until : ''}` : ''}
    ${groupByTypeGroup}
) AS counts
${groupByTypeGroup}
ORDER BY name~'^/Team' desc, name`;

const filterObject = (obj) => Object.fromEntries(Object.entries(obj).filter(e => e[1]));

module.exports = {
  usageByDateType: (from, to) => db.manyOrNone(
    `${countsByDateType} ${to ? until : ''} ${groupByDateType}`,
      filterObject({ from: from, to: to }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for datatypes by day between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByType: (from, to) => db.manyOrNone(
    `${countsByType} ${to ? until : ''} ${groupByType}`,
      filterObject({ from: from, to: to }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for datatypes between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByGroup: (from, to) => db.manyOrNone(buildCountsByGroup(from, to),
      filterObject({ from: from, to: to }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for groups between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByUser: (from, to) => db.manyOrNone(
    `${countsByUser} ${to ? until : ''} ${groupByDateTypeUser}`,
      filterObject({ from: from, to: to }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for users between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  allTimeSearches: (group) => db.manyOrNone(
    `${group ? totalCount + noDateGroupFilter : totalCount}`,
    filterObject({ group: group && `%${group}%` }))
    .catch(e => {
      global.logger.error(
          `Problem retrieving a count for total all time searches ${group ? 'for group ' + group : ''}`, e);
      throw new Error('Could not fetch data');
    }),

  dailySearches: (group) => db.manyOrNone(
  `${group ? dailyCount + groupFilter : dailyCount}`,
    filterObject({ group: group && `%${group}%` }))
  .catch(e => {
    global.logger.error(
        `Problem retrieving a count for searches today ${group ? 'from group ' + group : 'with no group selected'}`, e);
    throw new Error('Could not fetch data');
  })
};
