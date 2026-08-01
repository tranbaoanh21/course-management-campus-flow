const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDataExport } = require('../src/utils/dataExport');

test('buildDataExport creates an empty portable export', () => {
  const account = { id: 1, name: 'Student', email: 'student@example.com' };
  const exported = buildDataExport(account, [], [], [], '2026-08-01T00:00:00.000Z');

  assert.equal(exported.format, 'campusflow-export');
  assert.equal(exported.version, 1);
  assert.deepEqual(exported.summary, { courses: 0, projects: 0, tasks: 0 });
  assert.deepEqual(exported.courses, []);
  assert.deepEqual(exported.account, account);
});

test('buildDataExport nests projects and tasks under their parents', () => {
  const exported = buildDataExport(
    { id: 1, name: 'Student', email: 'student@example.com' },
    [{ id: 10, name: 'Database Systems' }],
    [
      {
        id: 20,
        course_id: 10,
        title: 'Schema Design',
        due_date: '2026-08-10',
      },
    ],
    [
      {
        id: 30,
        project_id: 20,
        title: 'Draw ERD',
        status: 'done',
        due_date: '2026-08-05',
      },
    ],
    '2026-08-01T00:00:00.000Z',
  );

  assert.deepEqual(exported.summary, { courses: 1, projects: 1, tasks: 1 });
  assert.equal(exported.courses[0].projects[0].title, 'Schema Design');
  assert.equal(exported.courses[0].projects[0].tasks[0].title, 'Draw ERD');
});

test('buildDataExport does not attach records with missing parents', () => {
  const exported = buildDataExport(
    { id: 1 },
    [{ id: 10, name: 'Database Systems' }],
    [{ id: 21, course_id: 999, title: 'Orphan project' }],
    [{ id: 31, project_id: 999, title: 'Orphan task' }],
  );

  assert.deepEqual(exported.courses[0].projects, []);
});
