const VALID_NODE_ENVIRONMENTS = ['development', 'test', 'production'];
const VALID_SAME_SITE_VALUES = ['lax', 'strict', 'none'];

function readRequiredString(source, key, { allowEmpty = false } = {}) {
  const value = source[key];

  if (typeof value !== 'string' || (!allowEmpty && value.trim() === '')) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function readPort(source, key, defaultValue) {
  const rawValue = source[key] || String(defaultValue);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${key} must be an integer between 1 and 65535.`);
  }

  return value;
}

function readBoolean(source, key, defaultValue = false) {
  const rawValue = source[key];

  if (rawValue === undefined || rawValue === '') {
    return defaultValue;
  }

  if (rawValue === 'true') {
    return true;
  }

  if (rawValue === 'false') {
    return false;
  }

  throw new Error(`${key} must be true or false.`);
}

function readClientOrigin(source, isProduction) {
  const value = readRequiredString(source, 'CLIENT_ORIGIN');
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error('CLIENT_ORIGIN must be a valid URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('CLIENT_ORIGIN must use http or https.');
  }

  if (isProduction && url.protocol !== 'https:') {
    throw new Error('CLIENT_ORIGIN must use https in production.');
  }

  return url.origin;
}

function loadEnvironment(source = process.env) {
  const nodeEnv = source.NODE_ENV || 'development';

  if (!VALID_NODE_ENVIRONMENTS.includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be one of: ${VALID_NODE_ENVIRONMENTS.join(', ')}.`);
  }

  const isProduction = nodeEnv === 'production';
  const sessionSecret = readRequiredString(source, 'SESSION_SECRET');

  if (sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters.');
  }

  const sameSite = source.SESSION_COOKIE_SAME_SITE || 'lax';

  if (!VALID_SAME_SITE_VALUES.includes(sameSite)) {
    throw new Error(
      `SESSION_COOKIE_SAME_SITE must be one of: ${VALID_SAME_SITE_VALUES.join(', ')}.`,
    );
  }

  if (sameSite === 'none' && !isProduction) {
    throw new Error('SESSION_COOKIE_SAME_SITE=none requires NODE_ENV=production.');
  }

  const databasePassword = readRequiredString(source, 'DB_PASSWORD', {
    allowEmpty: !isProduction,
  });

  return {
    nodeEnv,
    isProduction,
    port: readPort(source, 'PORT', 3000),
    clientOrigin: readClientOrigin(source, isProduction),
    session: {
      secret: sessionSecret,
      sameSite,
      secure: isProduction,
    },
    database: {
      host: readRequiredString(source, 'DB_HOST'),
      port: readPort(source, 'DB_PORT', 3306),
      user: readRequiredString(source, 'DB_USER'),
      password: databasePassword,
      name: readRequiredString(source, 'DB_NAME'),
      ssl: readBoolean(source, 'DB_SSL', false),
      sslRejectUnauthorized: readBoolean(source, 'DB_SSL_REJECT_UNAUTHORIZED', true),
    },
  };
}

let cachedEnvironment;

function getEnvironment() {
  if (!cachedEnvironment) {
    cachedEnvironment = loadEnvironment();
  }

  return cachedEnvironment;
}

module.exports = {
  getEnvironment,
  loadEnvironment,
};
