'use strict';

const defaultsFalse = v => String(v || '').match(/(true|yes|on)/i) !== null;
const defaultsTrue = v => String(v || '').match(/(false|no|off)/i) === null;

/* eslint-disable no-process-env */
module.exports = {
  name: require('../package').name,
  postgres: {
    mock: defaultsFalse(process.env.MOCK),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || '5432',
    database: process.env.POSTGRES_DB || 'lev',
    ssl: defaultsTrue(process.env.POSTGRES_SSL)
  },
  http: {
    host: process.env.LISTEN_HOST || '0.0.0.0',
    port: process.env.LISTEN_PORT || 4000
  }
};
/* eslint-enable no-process-env */
