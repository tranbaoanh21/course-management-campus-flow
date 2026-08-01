const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeProjectProgress } = require('../src/utils/projectProgress');

function projectWith(overrides = {}) {
  return {
    id: 1,
    task_count: 0,
    completed_task_count: 0,
    overdue_task_count: 0,
    is_overdue: 0,
    ...overrides,
  };
}

test('normalizeProjectProgress marks an empty future project as not started', () => {
  const project = normalizeProjectProgress(projectWith());

  assert.equal(project.progress_status, 'not-started');
  assert.equal(project.completion_percentage, 0);
});

test('normalizeProjectProgress calculates active and completed progress', () => {
  const activeProject = normalizeProjectProgress(
    projectWith({ task_count: 4, completed_task_count: 1 }),
  );
  const completedProject = normalizeProjectProgress(
    projectWith({ task_count: '3', completed_task_count: '3' }),
  );

  assert.equal(activeProject.progress_status, 'active');
  assert.equal(activeProject.completion_percentage, 25);
  assert.equal(completedProject.progress_status, 'completed');
  assert.equal(completedProject.completion_percentage, 100);
});

test('normalizeProjectProgress marks overdue work as at risk', () => {
  const taskRisk = normalizeProjectProgress(
    projectWith({ task_count: 2, completed_task_count: 1, overdue_task_count: 1 }),
  );
  const dueDateRisk = normalizeProjectProgress(projectWith({ is_overdue: 1 }));

  assert.equal(taskRisk.progress_status, 'at-risk');
  assert.equal(dueDateRisk.progress_status, 'at-risk');
});
