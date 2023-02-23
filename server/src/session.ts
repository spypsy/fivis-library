import session from 'express-session';
import * as sqlite3 from 'sqlite3';
import sqliteStoreFactory from 'express-session-sqlite';

const SqliteStore = sqliteStoreFactory(session);

export default session({
  secret: 'wookiee doggo',
  resave: true,
  saveUninitialized: true,
  store: new SqliteStore({
    // Database library to use. Any library is fine as long as the API is compatible
    // with sqlite3, such as sqlite3-offline
    driver: sqlite3.Database,
    // for in-memory database
    // path: ':memory:'
    path: 'data/sqlite.db',
    // Session TTL in milliseconds
    ttl: 24 * 60 * 60 * 1000,
    // (optional) Session id prefix. Default is no prefix.
    prefix: 'sess:',
    // (optional) Adjusts the cleanup timer in milliseconds for deleting expired session rows.
    // Default is 5 minutes.
    cleanupInterval: 300000,
  }),
});
