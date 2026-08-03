const { pool } = require('../config/db');
const { SESSION_COOKIE_NAME, getSessionCookieOptions } = require('../config/session');
const {
  normalizeEmail,
  validateRegistrationInput,
  validateLoginInput,
  validateProfileInput,
  validatePasswordChangeInput,
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

async function updateProfile(request, response) {
  const { name } = request.body;
  const errors = validateProfileInput({ name });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const trimmedName = name.trim();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute('UPDATE users SET name = ? WHERE id = ?', [
      trimmedName,
      request.user.id,
    ]);
    await connection.execute(
      `UPDATE sessions
       SET session_data = JSON_SET(session_data, '$.user.name', ?)
       WHERE user_id = ?`,
      [trimmedName, request.user.id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const user = {
    ...request.user,
    name: trimmedName,
  };
  request.session.user = user;
  await saveSession(request);

  return response.status(200).json({
    data: user,
  });
}

async function changePassword(request, response) {
  const { current_password: currentPassword, new_password: newPassword } = request.body;
  const errors = validatePasswordChangeInput({ currentPassword, newPassword });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [
    request.user.id,
  ]);
  const currentPasswordIsValid = users[0]
    ? await verifyPassword(currentPassword, users[0].password_hash)
    : false;

  if (!currentPasswordIsValid) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors: {
        current_password: 'Current password is incorrect.',
      },
    });
  }

  const passwordHash = await hashPassword(newPassword);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      request.user.id,
    ]);
    await connection.execute('DELETE FROM sessions WHERE user_id = ?', [request.user.id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  await startAuthenticatedSession(request, request.user);

  return response.status(200).json({
    message: 'Password changed successfully.',
  });
}

function logout(request, response, next) {
  request.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    response.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions({ includeMaxAge: false }));

    response.status(200).json({
      message: 'Logged out successfully.',
    });
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
};
