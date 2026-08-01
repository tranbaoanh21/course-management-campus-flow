const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

function formatMonth(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getCurrentMonth(now = new Date()) {
  return formatMonth(now.getFullYear(), now.getMonth() + 1);
}

function parseCalendarMonth(value, now = new Date()) {
  if (value === undefined) {
    return {
      error: null,
      month: getCurrentMonth(now),
    };
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) {
    return {
      error: 'Month must use YYYY-MM format.',
      month: null,
    };
  }

  const [year, month] = value.split('-').map(Number);

  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) {
    return {
      error: `Month must be between ${MIN_YEAR}-01 and ${MAX_YEAR}-12.`,
      month: null,
    };
  }

  return {
    error: null,
    month: formatMonth(year, month),
  };
}

function getMonthRange(monthValue) {
  const [year, month] = monthValue.split('-').map(Number);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    startDate: `${monthValue}-01`,
    endDate: `${formatMonth(nextYear, nextMonth)}-01`,
  };
}

module.exports = {
  MAX_YEAR,
  MIN_YEAR,
  getCurrentMonth,
  getMonthRange,
  parseCalendarMonth,
};
