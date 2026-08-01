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

function validateName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'Name is required.';
  }

  if (name.trim().length > 100) {
    return 'Name must not exceed 100 characters.';
  }

  return null;
}

function validateRegistrationInput({ name, email, password }) {
  const errors = {};
  const nameError = validateName(name);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (nameError) {
    errors.name = nameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

function validateProfileInput({ name }) {
  const nameError = validateName(name);

  return nameError ? { name: nameError } : {};
}

function validatePasswordChangeInput({ currentPassword, newPassword }) {
  const errors = {};

  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    errors.current_password = 'Current password is required.';
  }

  const newPasswordError = validatePassword(newPassword);

  if (newPasswordError) {
    errors.new_password = newPasswordError;
  } else if (currentPassword === newPassword) {
    errors.new_password = 'New password must be different from the current password.';
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
  validateName,
  validatePassword,
  validateRegistrationInput,
  validateLoginInput,
  validateProfileInput,
  validatePasswordChangeInput,
};
