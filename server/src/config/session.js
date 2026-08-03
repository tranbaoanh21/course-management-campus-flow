const session = require('express-session');

const { pool } = require('./db');
const { getEnvironment } = require('./environment');
const { MySQLSessionStore } = require('./MySQLSessionStore');

const SESSION_COOKIE_NAME = 'campusflow.sid';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionCookieOptions({ includeMaxAge = true } = {}) {
  const { session: sessionEnvironment } = getEnvironment();
  const options = {
    httpOnly: true,
    sameSite: sessionEnvironment.sameSite,
    secure: sessionEnvironment.secure,
    path: '/',
  };

  if (includeMaxAge) {
    options.maxAge = SESSION_MAX_AGE_MS;
  }

  return options;
}

function createSessionMiddleware() {
  const { session: sessionEnvironment } = getEnvironment();

  return session({
    name: SESSION_COOKIE_NAME,
    secret: sessionEnvironment.secret,
    store: new MySQLSessionStore(pool, SESSION_MAX_AGE_MS),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: 'destroy',
    cookie: getSessionCookieOptions(),
  });
}

module.exports = {
  SESSION_COOKIE_NAME,
  createSessionMiddleware,
  getSessionCookieOptions,
};
