'use strict';

const db = require('./postgres');
const moment = require('moment-timezone');

const totalCount = 'SELECT count(*)::INTEGER FROM lev_audit';
const fromDate = 'date_time >= $(from)';
const toDate = 'date_time < $(to)';
const searchGroup = 'groups::TEXT ILIKE \'%\' || $(group) || \'%\'';
const searchWithoutGroup = 'groups::TEXT NOT ILIKE \'%\' || $(withoutGroups) || \'%\'';
const searchWithoutGroups = 'NOT (groups && $(withoutGroups))';

const filterObject = (obj) => Object.fromEntries(Object.entries(obj).filter(e => e[1]));

const sqlBuilder = (obj, joiner) => {
  obj = filterObject(obj);
    return Object.entries(obj).map(([key, value]) =>
      `${key} ${Array.isArray(value) ? value.filter(e => e).join(' AND ') : value}`
    ).join(joiner || ' ');
};

module.exports = {
  usageByDateType: (from, to, group, withoutGroups) => db.manyOrNone(
    sqlBuilder({
      'SELECT': 'date_time::DATE AS date, dataset, count(*)::INTEGER',
      'FROM': 'lev_audit',
      'WHERE': [from && fromDate, to && toDate, group && searchGroup,
        withoutGroups && (Array.isArray(withoutGroups) && searchWithoutGroups || searchWithoutGroup)],
      'GROUP BY': 'date, dataset',
      'ORDER BY': 'date'
    }, '\n'),
    filterObject({ from, to, group, withoutGroups }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for datatypes by day between: 
      ${from} and ${to || 'now'} 'for' ${group || 'all groups'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByType: (from, to) => db.manyOrNone(
    sqlBuilder({
      'SELECT': 'dataset, count(*)::INTEGER',
      'FROM': 'lev_audit',
      'WHERE': [from && fromDate, to && toDate],
      'GROUP BY': 'dataset'
    }, '\n'),
    filterObject({ from: from, to: to }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for datatypes between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByGroup: (from, to) => db.manyOrNone(
    sqlBuilder({
      'SELECT': 'name, dataset, SUM(count)::INTEGER AS count',
      'FROM': '(',
      ' ': 'SELECT UNNEST(groups) AS name, dataset, COUNT(*)',
      '    FROM': 'lev_audit',
      '    WHERE': [from && fromDate, to && toDate],
      '    GROUP BY': 'name, dataset',
      '  UNION\n ': sqlBuilder({
      'SELECT': '\'No group\' AS name, dataset, COUNT(*)',
      '    FROM': 'lev_audit',
      '    WHERE': ['groups=\'{}\'', from && fromDate, to && toDate],
      '    GROUP BY': 'name, dataset'
      }, '\n'),
      ') AS': 'counts',
      'GROUP BY': 'name, dataset',
      'ORDER BY': 'name~\'^/Team\' desc, name'
    }, '\n'),
    filterObject({ from: from, to: to }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for groups between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  usageByUser: (from, to) => db.manyOrNone(
    sqlBuilder({
      'SELECT': 'date_time::DATE AS date, dataset, username, count(*)::INTEGER',
      'FROM': 'lev_audit',
      'WHERE': [from && fromDate, to && toDate],
      'GROUP BY': 'date, dataset, username',
      'ORDER BY': 'date'
    }, '\n'),
    filterObject({ from: from, to: to }))
    .catch(e => {
      global.logger.error(`Problem retrieving counts for users between: ${from} and ${to || 'now'}`, e);
      throw new Error('Could not fetch data');
    }),

  searchTotals: (isAllTimeCount) =>
    db.one(
      `${isAllTimeCount ? totalCount : `${totalCount} WHERE ${fromDate}`}`,
      isAllTimeCount ? [] : { from: moment.tz('Europe/London').startOf('day').format() },
      data => data.count)
      .catch(e => {
        global.logger.error(`Problem retrieving ${isAllTimeCount ? 'an all time count' : 'a count for today'}`, e);
        throw new Error('Could not fetch data');
    }),

  searchWithGroupFiltering: (from, to, group, withoutGroups) => db.one(
    sqlBuilder({
      'SELECT': 'count(*)::INTEGER',
      'FROM': 'lev_audit',
      'WHERE': [from && fromDate, to && toDate, group && searchGroup,
        withoutGroups && (Array.isArray(withoutGroups) && searchWithoutGroups || searchWithoutGroup)]
    }, '\n'),
    filterObject({ from, to, group, withoutGroups }),
    data => data.count
  )
    .catch(e => {
      global.logger.error(`Problem retrieving a search from "${from}" to "${to || 'now'}" for group "${group}"`, e);
      throw new Error('Could not fetch data');
    }),

  hourlyUsage: (from, to, group) => {
    if (!from) {
      throw Error('Must be used with "from" date!');
    }
    return db.manyOrNone(
      sqlBuilder({
        'SELECT': 'COUNT(*)::INTEGER, weekend::INTEGER, hour',
        'FROM': '(',
        '  SELECT': 'TO_CHAR(date_time AT TIME ZONE \'europe/london\', \'HH24\')::INTEGER AS hour,\n' +
          '    TO_CHAR(date_time AT TIME ZONE \'europe/london\', \'DAY\') LIKE \'S%\' AS weekend',
        '  FROM': 'lev_audit',
        '  WHERE': [fromDate, to && toDate,
            group ? searchGroup : 'groups::TEXT NOT LIKE \'/Monitor%\' AND client = \'lev-web\''],
        ')': 'AS counts',
        'GROUP BY': 'weekend, hour'
      }, '\n'),
      filterObject({ from, to, group }))
      .catch(e => {
        global.logger.error(
          `Problem retrieving hour counts between: ${from} and ${to || 'now'} for group "${group}"`, e);
        throw new Error('Could not fetch data');
      });
  },

  cumulativeUsage: () => db.manyOrNone(
      sqlBuilder({
        'SELECT': 'month, SUM(count) OVER (ORDER BY month)',
        'FROM': '(',
        '  SELECT': 'COUNT(c.*) AS count, months.month AS month',
        '  FROM': 'lev_audit AS c',
        '  JOIN': '(',
        '    SELECT': 'GENERATE_SERIES(DATE_TRUNC(\'month\', MIN(date_time)), ' +
                      'DATE_TRUNC(\'month\', NOW()), \'1 month\'::INTERVAL) AS month',
        '    FROM': 'lev_audit',
        '  )': 'AS months',
        '  ON': 'c.date_time < months.month AND c.date_time >= (months.month - \'1 month\'::INTERVAL)',
        '  GROUP BY': '2',
        ')': 'AS counts'
      }, '\n'), []
    )
    .catch(e => {
      global.logger.error('Problem retrieving cumulative usage data', e);
      throw new Error('Could not fetch data');
    })
};
