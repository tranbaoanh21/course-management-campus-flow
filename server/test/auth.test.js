const test = require('node:test');
const assert = require('node:assert/strict');

const { hashSessionId } = require('../src/config/MySQLSessionStore');
const {
  normalizeEmail,
  validateRegistrationInput,
  validateLoginInput,
  validateProfileInput,
  validatePasswordChangeInput,
} = require('../src/utils/authValidation');
const { hashPassword, verifyPassword } = require('../src/utils/password');

test('normalizeEmail trims and lowercases email addresses', () => {
  assert.equal(normalizeEmail('  Student@HCMUT.EDU.VN '), 'student@hcmut.edu.vn');
});

test('validateRegistrationInput accepts a valid account', () => {
  assert.deepEqual(
    validateRegistrationInput({
      name: 'Bao Anh',
      email: 'student@hcmut.edu.vn',
      password: 'a private passphrase',
    }),
    {},
  );
});

test('validateRegistrationInput returns all invalid account fields', () => {
  assert.deepEqual(
    validateRegistrationInput({
      name: ' ',
      email: 'not-an-email',
      password: 'too-short',
    }),
    {
      name: 'Name is required.',
      email: 'Email must be a valid email address.',
      password: 'Password must be between 12 and 128 characters.',
    },
  );
});

test('validateLoginInput requires both credentials', () => {
  assert.deepEqual(validateLoginInput({ email: '', password: '' }), {
    email: 'Email is required.',
    password: 'Password is required.',
  });
});

test('validateProfileInput enforces the display name rules', () => {
  assert.deepEqual(validateProfileInput({ name: '  Bao Anh  ' }), {});
  assert.deepEqual(validateProfileInput({ name: ' ' }), {
    name: 'Name is required.',
  });
});

test('validatePasswordChangeInput requires a different valid new password', () => {
  assert.deepEqual(
    validatePasswordChangeInput({
      currentPassword: 'current passphrase',
      newPassword: 'current passphrase',
    }),
    {
      new_password: 'New password must be different from the current password.',
    },
  );

  assert.deepEqual(validatePasswordChangeInput({ currentPassword: '', newPassword: 'short' }), {
    current_password: 'Current password is required.',
    new_password: 'Password must be between 12 and 128 characters.',
  });
});

test('password hashing creates salted hashes and verifies the original password', async () => {
  const password = 'a long private passphrase';
  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);

  assert.notEqual(firstHash, secondHash);
  assert.equal(firstHash.includes(password), false);
  assert.equal(await verifyPassword(password, firstHash), true);
  assert.equal(await verifyPassword('wrong password', firstHash), false);
  assert.equal(await verifyPassword(password, 'invalid-hash'), false);
});

test('hashSessionId creates a stable SHA-256 value without exposing the session ID', () => {
  const sessionId = 'private-session-id';
  const sessionHash = hashSessionId(sessionId);

  assert.equal(sessionHash.length, 64);
  assert.equal(sessionHash, hashSessionId(sessionId));
  assert.equal(sessionHash.includes(sessionId), false);
});
