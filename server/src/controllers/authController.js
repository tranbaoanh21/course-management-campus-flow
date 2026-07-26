const { pool } = require('../config/db');
const { SESSION_COOKIE_NAME } = require('../config/session');
const {
  normalizeEmail,
  validateRegistrationInput,
  validateLoginInput,
} = require('../utils/authValidation');
const { hashPassword, verifyPassword } = require('../utils/password');

function regenerateSession(request) {
  return new Promise((resolve, reject) => {
    request.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function saveSession(request) {
  return new Promise((resolve, reject) => {
    request.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function startAuthenticatedSession(request, user) {
  await regenerateSession(request);
  request.session.user = user;
  await saveSession(request);
}

async function register(request, response) {
  const { name, email, password } = request.body;
  const errors = validateRegistrationInput({ name, email, password });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const normalizedEmail = normalizeEmail(email);
  const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [
    normalizedEmail,
  ]);

  if (existingUsers.length > 0) {
    return response.status(409).json({
      message: 'Email is already registered.',
      errors: {
        email: 'Email is already registered.',
      },
    });
  }

  const trimmedName = name.trim();
  const passwordHash = await hashPassword(password);

  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [trimmedName, normalizedEmail, passwordHash],
    );
    const user = {
      id: result.insertId,
      name: trimmedName,
      email: normalizedEmail,
    };

    await startAuthenticatedSession(request, user);

    return response.status(201).json({
      data: user,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({
        message: 'Email is already registered.',
        errors: {
          email: 'Email is already registered.',
        },
      });
    }

    throw error;
  }
}

async function login(request, response) {
  const { email, password } = request.body;
  const errors = validateLoginInput({ email, password });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const [users] = await pool.execute(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?',
    [normalizeEmail(email)],
  );
  const userRecord = users[0];
  const passwordIsValid = userRecord
    ? await verifyPassword(password, userRecord.password_hash)
    : false;

  if (!userRecord || !passwordIsValid) {
    return response.status(401).json({
      message: 'Invalid email or password.',
    });
  }

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
  };

  await startAuthenticatedSession(request, user);

  return response.status(200).json({
    data: user,
  });
}

function getCurrentUser(request, response) {
  return response.status(200).json({
    data: request.user,
  });
}

function logout(request, response, next) {
  request.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    response.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    response.status(200).json({
      message: 'Logged out successfully.',
    });
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
