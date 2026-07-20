CREATE DATABASE IF NOT EXISTS campus_flow
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE campus_flow;

CREATE TABLE IF NOT EXISTS courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,

    CONSTRAINT chk_courses_name_not_empty
        CHECK (CHAR_LENGTH(TRIM(name)) > 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    due_date DATE NOT NULL,

    CONSTRAINT chk_projects_title_not_empty
        CHECK (CHAR_LENGTH(TRIM(title)) > 0),
    CONSTRAINT fk_projects_course
        FOREIGN KEY (course_id)
        REFERENCES courses (id)
        ON DELETE CASCADE,

    INDEX idx_projects_course_id (course_id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    status ENUM('todo', 'in-progress', 'done') NOT NULL,
    due_date DATE NOT NULL,

    CONSTRAINT chk_tasks_title_not_empty
        CHECK (CHAR_LENGTH(TRIM(title)) > 0),
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
        REFERENCES projects (id)
        ON DELETE CASCADE,

    INDEX idx_tasks_project_id (project_id)
) ENGINE = InnoDB;
