
module.exports = {
  usageByDateType: {
    fromDateOnlySQL: `SELECT date_time::DATE AS date, dataset, count(*)::INTEGER
FROM lev_audit
WHERE date_time >= $(from)
GROUP BY date, dataset
ORDER BY date`,
    allParametersSQL: `SELECT date_time::DATE AS date, dataset, count(*)::INTEGER
FROM lev_audit
WHERE date_time >= $(from) AND date_time < $(to) AND groups::TEXT ILIKE '%' || $(group) || '%'
GROUP BY date, dataset
ORDER BY date`
  },

  usageByType: {
    fromDateSQL: `SELECT dataset, count(*)::INTEGER
FROM lev_audit
WHERE date_time >= $(from)
GROUP BY dataset`,
    fromToSQL: `SELECT dataset, count(*)::INTEGER
FROM lev_audit
WHERE date_time >= $(from) AND date_time < $(to)
GROUP BY dataset`
  },

  usageByGroup: {
    fromDateSQL: `SELECT name, dataset, SUM(count)::INTEGER AS count
FROM (
  SELECT UNNEST(groups) AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE date_time >= $(from)
    GROUP BY name, dataset
  UNION
  SELECT 'No group' AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE groups='{}' AND date_time >= $(from)
    GROUP BY name, dataset
) AS counts
GROUP BY name, dataset
ORDER BY name~'^/Team' desc, name`,
    fromToSQL: `SELECT name, dataset, SUM(count)::INTEGER AS count
FROM (
  SELECT UNNEST(groups) AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE date_time >= $(from) AND date_time < $(to)
    GROUP BY name, dataset
  UNION
  SELECT 'No group' AS name, dataset, COUNT(*)
    FROM lev_audit
    WHERE groups='{}' AND date_time >= $(from) AND date_time < $(to)
    GROUP BY name, dataset
) AS counts
GROUP BY name, dataset
ORDER BY name~'^/Team' desc, name`
  },

  usageByUser: {
    fromDateSQL: `SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER
FROM lev_audit
WHERE date_time >= $(from)
GROUP BY date, dataset, username
ORDER BY date`,
    fromToSQL: `SELECT date_time::DATE AS date, dataset, username, count(*)::INTEGER
FROM lev_audit
WHERE date_time >= $(from) AND date_time < $(to)
GROUP BY date, dataset, username
ORDER BY date`
  },

  searchTotals: {
    totalCountSQL: `SELECT count(*)::INTEGER FROM lev_audit`,
    todayCountSQL: `SELECT count(*)::INTEGER FROM lev_audit WHERE date_time >= $(from)`
  },

  searchTimePeriodByGroup: {
    fromToGroupSQL: `SELECT count(*)::INTEGER
FROM lev_audit
WHERE date_time >= $(from) AND date_time < $(to) AND groups::TEXT ILIKE '%' || $(group) || '%'`,
    gorupOnlySQL: `SELECT count(*)::INTEGER
FROM lev_audit
WHERE groups::TEXT ILIKE '%' || $(group) || '%'`
  },
  hourlyUsage: {
    // NOTE: the following query would take around 30 SECONDS to complete, so will 502
    // It may be possible to re-include this kind full data request once the the
    // underlying infrastructure can handle it, and we deem it useful!
//     noParameterSQL: `SELECT COUNT(*)::INTEGER, weekend::INTEGER, hour
// FROM (
//   SELECT TO_CHAR(date_time AT TIME ZONE 'europe/london', 'HH24')::INTEGER AS hour,
//     TO_CHAR(date_time AT TIME ZONE 'europe/london', 'DAY') LIKE 'S%' AS weekend
//   FROM lev_audit
//   WHERE groups::TEXT NOT ILIKE '%monitor%' AND client = 'lev-web'
// ) AS counts
// GROUP BY weekend, hour`,

    fromDateOnlySQL: `SELECT COUNT(*)::INTEGER, weekend::INTEGER, hour
FROM (
  SELECT TO_CHAR(date_time AT TIME ZONE 'europe/london', 'HH24')::INTEGER AS hour,
    TO_CHAR(date_time AT TIME ZONE 'europe/london', 'DAY') LIKE 'S%' AS weekend
  FROM lev_audit
  WHERE date_time >= $(from) AND groups::TEXT NOT LIKE '/Monitor%' AND client = 'lev-web'
) AS counts
GROUP BY weekend, hour`,

    allParametersSQL: `SELECT COUNT(*)::INTEGER, weekend::INTEGER, hour
FROM (
  SELECT TO_CHAR(date_time AT TIME ZONE 'europe/london', 'HH24')::INTEGER AS hour,
    TO_CHAR(date_time AT TIME ZONE 'europe/london', 'DAY') LIKE 'S%' AS weekend
  FROM lev_audit
  WHERE date_time >= $(from) AND date_time < $(to) AND groups::TEXT ILIKE '%' || $(group) || '%'
) AS counts
GROUP BY weekend, hour`
  }
};