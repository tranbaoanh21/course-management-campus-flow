USE campus_flow;

START TRANSACTION;

-- Courses
INSERT INTO courses (name)
SELECT 'Database Systems'
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE name = 'Database Systems'
);

INSERT INTO courses (name)
SELECT 'Software Engineering'
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE name = 'Software Engineering'
);

SET @database_course_id = (
    SELECT id FROM courses WHERE name = 'Database Systems' ORDER BY id LIMIT 1
);

SET @software_course_id = (
    SELECT id FROM courses WHERE name = 'Software Engineering' ORDER BY id LIMIT 1
);

-- Projects
INSERT INTO projects (course_id, title, description, due_date)
SELECT
    @database_course_id,
    'Database Assignment',
    'Design and implement the CampusFlow relational database.',
    '2030-08-15'
WHERE NOT EXISTS (
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
WHERE NOT EXISTS (
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
    'Define the Course, Project, and Task relationships.',
    'done',
    '2020-01-01'
WHERE NOT EXISTS (
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
WHERE NOT EXISTS (
    SELECT 1
    FROM tasks
    WHERE project_id = @database_project_id
      AND title = 'Write sample queries'
);

INSERT INTO tasks (project_id, title, description, status, due_date)
SELECT
    @campus_flow_project_id,
    'Review MVP requirements',
    'This intentionally old unfinished task demonstrates the overdue state.',
    'in-progress',
    '2020-01-02'
WHERE NOT EXISTS (
    SELECT 1
    FROM tasks
    WHERE project_id = @campus_flow_project_id
      AND title = 'Review MVP requirements'
);

INSERT INTO tasks (project_id, title, description, status, due_date)
SELECT
    @campus_flow_project_id,
    'Test REST API',
    'Run the version-controlled Postman collection.',
    'todo',
    '2030-09-20'
WHERE NOT EXISTS (
    SELECT 1
    FROM tasks
    WHERE project_id = @campus_flow_project_id
      AND title = 'Test REST API'
);

COMMIT;

SELECT * FROM courses ORDER BY id;
SELECT * FROM projects ORDER BY course_id, due_date, id;
SELECT
    id,
    project_id,
    title,
    description,
    status,
    due_date,
    (due_date < CURDATE() AND status <> 'done') AS is_overdue
FROM tasks
ORDER BY project_id, due_date, id;
