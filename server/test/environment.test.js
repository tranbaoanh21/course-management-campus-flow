const test = require('node:test');
const assert = require('node:assert/strict');

const { loadEnvironment } = require('../src/config/environment');

function validEnvironment(overrides = {}) {
  return {
    NODE_ENV: 'development',
    PORT: '3000',
    CLIENT_ORIGIN: 'http://localhost:5173',
    SESSION_SECRET: 'a-secure-local-secret-with-32-characters',
    SESSION_COOKIE_SAME_SITE: 'lax',
    DB_HOST: '127.0.0.1',
    DB_PORT: '3306',
    DB_USER: 'root',
    DB_PASSWORD: 'password',
    DB_NAME: 'campus_flow',
    ...overrides,
  };
}

test('loadEnvironment parses a valid development configuration', () => {
  const environment = loadEnvironment(validEnvironment());

  assert.equal(environment.port, 3000);
  assert.equal(environment.clientOrigin, 'http://localhost:5173');
  assert.equal(environment.session.sameSite, 'lax');
  assert.equal(environment.session.secure, false);
  assert.equal(environment.database.ssl, false);
});

test('loadEnvironment requires HTTPS and a database password in production', () => {
  assert.throws(
    () => loadEnvironment(validEnvironment({ NODE_ENV: 'production' })),
    /CLIENT_ORIGIN must use https in production/,
  );
  assert.throws(
    () =>
      loadEnvironment(
        validEnvironment({
          NODE_ENV: 'production',
          CLIENT_ORIGIN: 'https://campusflow.example.com',
          DB_PASSWORD: '',
        }),
      ),
    /DB_PASSWORD is required/,
  );
});

test('loadEnvironment rejects invalid cookie and boolean settings', () => {
  assert.throws(
    () => loadEnvironment(validEnvironment({ SESSION_COOKIE_SAME_SITE: 'invalid' })),
    /SESSION_COOKIE_SAME_SITE/,
  );
  assert.throws(
    () => loadEnvironment(validEnvironment({ DB_SSL: 'yes' })),
    /DB_SSL must be true or false/,
  );
});

test('cross-site cookies require production secure mode', () => {
  assert.throws(
    () => loadEnvironment(validEnvironment({ SESSION_COOKIE_SAME_SITE: 'none' })),
    /requires NODE_ENV=production/,
  );

  const environment = loadEnvironment(
    validEnvironment({
      NODE_ENV: 'production',
      CLIENT_ORIGIN: 'https://campusflow.example.com',
      SESSION_COOKIE_SAME_SITE: 'none',
      DB_SSL: 'true',
    }),
  );

  assert.equal(environment.session.secure, true);
  assert.equal(environment.database.ssl, true);
});
