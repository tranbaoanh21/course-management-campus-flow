const test = require('node:test');
const assert = require('node:assert/strict');

const { parseSearchQuery } = require('../src/utils/searchQuery');

test('parseSearchQuery trims a valid query', () => {
  assert.deepEqual(parseSearchQuery('  database  '), { query: 'database' });
});

test('parseSearchQuery requires at least two characters', () => {
  assert.equal(parseSearchQuery().error, 'Search query is required.');
  assert.equal(parseSearchQuery(' a ').error, 'Search query must contain at least 2 characters.');
});

test('parseSearchQuery rejects queries longer than one hundred characters', () => {
  assert.equal(
    parseSearchQuery('a'.repeat(101)).error,
    'Search query must not exceed 100 characters.',
  );
});
