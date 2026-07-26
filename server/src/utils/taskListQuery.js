const { VALID_STATUSES } = require('./validation');

const VALID_SORTS = ['due-asc', 'due-desc', 'newest'];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function parseQueryInteger(value, defaultValue, maximum) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 1 || parsedValue > maximum) {
    return null;
  }

  return parsedValue;
}

function parseTaskListQuery(query) {
  const errors = {};
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = query.status || '';
  const overdue = query.overdue || '';
  const sort = query.sort || 'due-asc';
  const page = parseQueryInteger(query.page, 1, Number.MAX_SAFE_INTEGER);
  const limit = parseQueryInteger(query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  if (query.search !== undefined && typeof query.search !== 'string') {
    errors.search = 'Search must be a string.';
  } else if (search.length > 200) {
    errors.search = 'Search must not exceed 200 characters.';
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.status = 'Status must be todo, in-progress, or done.';
  }

  if (overdue && overdue !== 'true') {
    errors.overdue = 'Overdue must be true when provided.';
  }

  if (!VALID_SORTS.includes(sort)) {
    errors.sort = 'Sort must be due-asc, due-desc, or newest.';
  }

  if (!page) {
    errors.page = 'Page must be a positive integer.';
  }

  if (!limit) {
    errors.limit = `Limit must be an integer between 1 and ${MAX_PAGE_SIZE}.`;
  }

  return {
    errors,
    filters: {
      search,
      status,
      overdue: overdue === 'true',
      sort,
      page: page || 1,
      limit: limit || DEFAULT_PAGE_SIZE,
    },
  };
}

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  VALID_SORTS,
  parseTaskListQuery,
};
