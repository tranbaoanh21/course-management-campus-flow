const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeCourseOverview } = require('../src/utils/courseOverview');

test('normalizeCourseOverview handles a course without projects or tasks', () => {
  const overview = normalizeCourseOverview({
    id: 1,
    name: 'Database Systems',
    projects: 0,
    tasks: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
    overdue: 0,
  });

  assert.deepEqual(overview.counts, { projects: 0, tasks: 0 });
  assert.equal(overview.completion_percentage, 0);
  assert.equal(overview.next_deadline, null);
});

test('normalizeCourseOverview converts MySQL aggregates and calculates completion', () => {
  const overview = normalizeCourseOverview({
    id: 2,
    name: 'Software Engineering',
    projects: '3',
    tasks: '5',
    todo: '2',
    in_progress: '1',
    done: '2',
    overdue: '1',
  });

  assert.deepEqual(overview.counts, { projects: 3, tasks: 5 });
  assert.deepEqual(overview.task_status, {
    todo: 2,
    in_progress: 1,
    done: 2,
    overdue: 1,
  });
  assert.equal(overview.completion_percentage, 40);
});

test('normalizeCourseOverview normalizes the next deadline overdue flag', () => {
  const overview = normalizeCourseOverview(
    {
      id: 3,
      name: 'Web Development',
      projects: 1,
      tasks: 1,
      todo: 1,
      in_progress: 0,
      done: 0,
      overdue: 1,
    },
    {
      id: 8,
      title: 'Build the API',
      is_overdue: 1,
    },
  );

  assert.equal(overview.next_deadline.is_overdue, true);
  assert.equal(overview.next_deadline.title, 'Build the API');
});
