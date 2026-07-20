const test = require('node:test');
const assert = require('node:assert/strict');

const {
  VALID_STATUSES,
  parsePositiveInteger,
  isValidDateString,
  validateCourseName,
  validateProjectInput,
  validateTaskInput,
} = require('../src/utils/validation');

test('parsePositiveInteger accepts positive integer IDs', () => {
  assert.equal(parsePositiveInteger(1), 1);
  assert.equal(parsePositiveInteger('42'), 42);
});

test('parsePositiveInteger rejects invalid IDs', () => {
  for (const value of [0, -1, 1.5, 'abc', '', null, undefined]) {
    assert.equal(parsePositiveInteger(value), null);
  }
});

test('isValidDateString accepts real calendar dates in YYYY-MM-DD format', () => {
  assert.equal(isValidDateString('2028-02-29'), true);
  assert.equal(isValidDateString('2026-12-31'), true);
});

test('isValidDateString rejects impossible dates and other formats', () => {
  for (const value of ['2026-02-29', '2026-13-01', '20-01-01', '2026/01/01', '', null]) {
    assert.equal(isValidDateString(value), false);
  }
});

test('validateCourseName enforces required and maximum length rules', () => {
  assert.equal(validateCourseName(' Database Systems '), null);
  assert.equal(validateCourseName('a'.repeat(150)), null);
  assert.equal(validateCourseName('   '), 'Name is required.');
  assert.equal(validateCourseName('a'.repeat(151)), 'Name must not exceed 150 characters.');
});

test('validateProjectInput accepts valid optional descriptions', () => {
  const baseInput = {
    title: 'CampusFlow MVP',
    dueDate: '2026-12-31',
  };

  assert.deepEqual(validateProjectInput({ ...baseInput, description: undefined }), {});
  assert.deepEqual(validateProjectInput({ ...baseInput, description: null }), {});
  assert.deepEqual(validateProjectInput({ ...baseInput, description: 'Student project' }), {});
});

test('validateProjectInput returns errors for every invalid field', () => {
  assert.deepEqual(
    validateProjectInput({
      title: ' ',
      description: 42,
      dueDate: 'not-a-date',
    }),
    {
      title: 'Title is required.',
      description: 'Description must be a string or null.',
      due_date: 'Due date must be a valid date in YYYY-MM-DD format.',
    },
  );
});

test('validateTaskInput accepts all supported statuses', () => {
  for (const status of VALID_STATUSES) {
    assert.deepEqual(
      validateTaskInput({
        title: 'Create ERD',
        description: null,
        status,
        dueDate: '2026-12-31',
      }),
      {},
    );
  }
});

test('validateTaskInput rejects unsupported status with other invalid fields', () => {
  assert.deepEqual(
    validateTaskInput({
      title: '',
      description: false,
      status: 'blocked',
      dueDate: '',
    }),
    {
      title: 'Title is required.',
      description: 'Description must be a string or null.',
      due_date: 'Due date must be a valid date in YYYY-MM-DD format.',
      status: 'Status must be todo, in-progress, or done.',
    },
  );
});
