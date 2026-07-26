const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validateEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return 'Email is required.';
  }

  if (normalizedEmail.length > 255 || !EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Email must be a valid email address.';
  }

  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password is required.';
  }

  if (password.length < 12 || password.length > 128) {
    return 'Password must be between 12 and 128 characters.';
  }

  return null;
}

function validateRegistrationInput({ name, email, password }) {
  const errors = {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Name is required.';
  } else if (name.trim().length > 100) {
    errors.name = 'Name must not exceed 100 characters.';
  }

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

function validateLoginInput({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);

  if (emailError) {
    errors.email = emailError;
  }

  if (typeof password !== 'string' || password.length === 0) {
    errors.password = 'Password is required.';
  }

  return errors;
}

module.exports = {
  normalizeEmail,
  validateEmail,
  validatePassword,
  validateRegistrationInput,
  validateLoginInput,
};
