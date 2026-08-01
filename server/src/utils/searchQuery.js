const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_LENGTH = 100;

function parseSearchQuery(rawQuery) {
  if (typeof rawQuery !== 'string') {
    return {
      error: 'Search query is required.',
    };
  }

  const query = rawQuery.trim();

  if (query.length < MIN_SEARCH_LENGTH) {
    return {
      error: `Search query must contain at least ${MIN_SEARCH_LENGTH} characters.`,
    };
  }

  if (query.length > MAX_SEARCH_LENGTH) {
    return {
      error: `Search query must not exceed ${MAX_SEARCH_LENGTH} characters.`,
    };
  }

  return { query };
}

module.exports = {
  parseSearchQuery,
};
