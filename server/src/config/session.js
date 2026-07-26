const session = require('express-session');

const { pool } = require('./db');
const { MySQLSessionStore } = require('./MySQLSessionStore');

const SESSION_COOKIE_NAME = 'campusflow.sid';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const isProduction = process.env.NODE_ENV === 'production';

function createSessionMiddleware() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters.');
  }

  return session({
    name: SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    store: new MySQLSessionStore(pool, SESSION_MAX_AGE_MS),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: 'destroy',
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: SESSION_MAX_AGE_MS,
    },
  });
}

module.exports = {
  SESSION_COOKIE_NAME,
  createSessionMiddleware,
};
