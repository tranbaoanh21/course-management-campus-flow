const test = require('node:test');
const assert = require('node:assert/strict');

const { parseTaskListQuery } = require('../src/utils/taskListQuery');

test('parseTaskListQuery provides safe defaults', () => {
  assert.deepEqual(parseTaskListQuery({}), {
    errors: {},
    filters: {
      search: '',
      status: '',
      overdue: false,
      sort: 'due-asc',
      page: 1,
      limit: 20,
    },
  });
});

test('parseTaskListQuery accepts supported filters and pagination', () => {
  assert.deepEqual(
    parseTaskListQuery({
      search: '  database  ',
      status: 'in-progress',
      overdue: 'true',
      sort: 'newest',
      page: '2',
      limit: '10',
    }),
    {
      errors: {},
      filters: {
        search: 'database',
        status: 'in-progress',
        overdue: true,
        sort: 'newest',
        page: 2,
        limit: 10,
      },
    },
  );
});

test('parseTaskListQuery reports every invalid query field', () => {
  const { errors } = parseTaskListQuery({
    status: 'blocked',
    overdue: 'false',
    sort: 'title',
    page: '0',
    limit: '100',
  });

  assert.deepEqual(Object.keys(errors).sort(), ['limit', 'overdue', 'page', 'sort', 'status']);
});
