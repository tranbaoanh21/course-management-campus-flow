const test = require('node:test');
const assert = require('node:assert/strict');

const { getMonthRange, parseCalendarMonth } = require('../src/utils/calendarQuery');

test('parseCalendarMonth defaults to the current local month', () => {
  const result = parseCalendarMonth(undefined, new Date(2026, 7, 15));

  assert.deepEqual(result, {
    error: null,
    month: '2026-08',
  });
});

test('parseCalendarMonth accepts real YYYY-MM values', () => {
  assert.deepEqual(parseCalendarMonth('2026-12'), {
    error: null,
    month: '2026-12',
  });
});

test('parseCalendarMonth rejects invalid formats and calendar months', () => {
  assert.equal(parseCalendarMonth('2026-8').month, null);
  assert.equal(parseCalendarMonth('2026-13').month, null);
  assert.equal(parseCalendarMonth('1999-12').month, null);
});

test('getMonthRange handles regular months and year boundaries', () => {
  assert.deepEqual(getMonthRange('2026-08'), {
    startDate: '2026-08-01',
    endDate: '2026-09-01',
  });
  assert.deepEqual(getMonthRange('2026-12'), {
    startDate: '2026-12-01',
    endDate: '2027-01-01',
  });
});
