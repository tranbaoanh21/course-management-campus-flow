const VALID_STATUSES = ['todo', 'in-progress', 'done'];

function parsePositiveInteger(value) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateCourseName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'Name is required.';
  }

  if (name.trim().length > 150) {
    return 'Name must not exceed 150 characters.';
  }

  return null;
}

function validateProjectInput({ title, description, dueDate }) {
  const errors = {};

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.title = 'Title is required.';
  } else if (title.trim().length > 200) {
    errors.title = 'Title must not exceed 200 characters.';
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.description = 'Description must be a string or null.';
  }

  if (!isValidDateString(dueDate)) {
    errors.due_date = 'Due date must be a valid date in YYYY-MM-DD format.';
  }

  return errors;
}

function validateTaskInput({ title, description, status, dueDate }) {
  const errors = validateProjectInput({ title, description, dueDate });

  if (!VALID_STATUSES.includes(status)) {
    errors.status = 'Status must be todo, in-progress, or done.';
  }

  return errors;
}

module.exports = {
  VALID_STATUSES,
  parsePositiveInteger,
  isValidDateString,
  validateCourseName,
  validateProjectInput,
  validateTaskInput,
};
