USE campus_flow;

-- Register through the CampusFlow UI/API first, then replace this value with
-- that account's normalized email before running the seed.
SET @seed_user_email = 'student@hcmut.edu.vn';

SET @seed_user_id = (
    SELECT id
    FROM users
    WHERE email = LOWER(TRIM(@seed_user_email))
    LIMIT 1
);

START TRANSACTION;

-- Courses
INSERT INTO courses (user_id, name)
SELECT @seed_user_id, 'Database Systems'
WHERE @seed_user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM courses
      WHERE user_id = @seed_user_id
        AND name = 'Database Systems'
  );

INSERT INTO courses (user_id, name)
SELECT @seed_user_id, 'Software Engineering'
WHERE @seed_user_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM courses
      WHERE user_id = @seed_user_id
        AND name = 'Software Engineering'
  );

SET @database_course_id = (
    SELECT id
    FROM courses
    WHERE user_id = @seed_user_id
      AND name = 'Database Systems'
    ORDER BY id
    LIMIT 1
);

SET @software_course_id = (
    SELECT id
    FROM courses
    WHERE user_id = @seed_user_id
      AND name = 'Software Engineering'
    ORDER BY id
    LIMIT 1
);

-- Projects
INSERT INTO projects (course_id, title, description, due_date)
SELECT
    @database_course_id,
    'Database Assignment',
    'Design and implement the CampusFlow relational database.',
    '2030-08-15'
WHERE @database_course_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM projects
      WHERE course_id = @database_course_id
        AND title = 'Database Assignment'
  );

INSERT INTO projects (course_id, title, description, due_date)
SELECT
    @software_course_id,
    'CampusFlow MVP',
    'Build the first full-stack version of CampusFlow.',
    '2030-09-30'
WHERE @software_course_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM projects
      WHERE course_id = @software_course_id
        AND title = 'CampusFlow MVP'
  );

SET @database_project_id = (
    SELECT id
    FROM projects
    WHERE course_id = @database_course_id
      AND title = 'Database Assignment'
    ORDER BY id
    LIMIT 1
);

SET @campus_flow_project_id = (
    SELECT id
    FROM projects
    WHERE course_id = @software_course_id
      AND title = 'CampusFlow MVP'
    ORDER BY id
    LIMIT 1
);

-- Tasks
INSERT INTO tasks (project_id, title, description, status, due_date)
SELECT
    @database_project_id,
    'Create ERD',
    'Define the User, Course, Project, and Task relationships.',
    'done',
    '2020-01-01'
WHERE @database_project_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM tasks
      WHERE project_id = @database_project_id
        AND title = 'Create ERD'
  );

INSERT INTO tasks (project_id, title, description, status, due_date)
SELECT
    @database_project_id,
    'Write sample queries',
    NULL,
    'todo',
    '2030-08-10'
WHERE @database_project_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM tasks
      WHERE project_id = @database_project_id
        AND title = 'Write sample queries'
  );

INSERT INTO tasks (project_id, title, description, status, due_date)
SELECT
    @campus_flow_project_id,
    'Review authentication requirements',
    'This intentionally old unfinished task demonstrates the overdue state.',
    'in-progress',
    '2020-01-02'
WHERE @campus_flow_project_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM tasks
      WHERE project_id = @campus_flow_project_id
        AND title = 'Review authentication requirements'
  );

INSERT INTO tasks (project_id, title, description, status, due_date)
SELECT
    @campus_flow_project_id,
    'Test protected REST API',
    'Run the version-controlled Postman collection with an authenticated session.',
    'todo',
    '2030-09-20'
WHERE @campus_flow_project_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM tasks
      WHERE project_id = @campus_flow_project_id
        AND title = 'Test protected REST API'
  );

COMMIT;

SELECT id, name, email, created_at
FROM users
WHERE id = @seed_user_id;

SELECT *
FROM courses
WHERE user_id = @seed_user_id
ORDER BY id;

SELECT projects.*
FROM projects
JOIN courses ON courses.id = projects.course_id
WHERE courses.user_id = @seed_user_id
ORDER BY projects.course_id, projects.due_date, projects.id;

SELECT
    tasks.id,
    tasks.project_id,
    tasks.title,
    tasks.description,
    tasks.status,
    tasks.due_date,
    (tasks.due_date < CURDATE() AND tasks.status <> 'done') AS is_overdue
FROM tasks
JOIN projects ON projects.id = tasks.project_id
JOIN courses ON courses.id = projects.course_id
WHERE courses.user_id = @seed_user_id
ORDER BY tasks.project_id, tasks.due_date, tasks.id;
