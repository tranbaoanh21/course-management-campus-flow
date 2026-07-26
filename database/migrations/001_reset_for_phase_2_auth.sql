-- WARNING: This development migration permanently deletes all current
-- CampusFlow users, sessions, courses, projects, and tasks.
-- Run only at the Phase 2 database checkpoint after the Auth backend is ready.

CREATE DATABASE IF NOT EXISTS campus_flow
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE campus_flow;

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_name_not_empty
        CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT chk_users_email_not_empty
        CHECK (CHAR_LENGTH(TRIM(email)) > 0),

    UNIQUE INDEX uq_users_email (email)
) ENGINE = InnoDB;

CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,

    CONSTRAINT chk_courses_name_not_empty
        CHECK (CHAR_LENGTH(TRIM(name)) > 0),
    CONSTRAINT fk_courses_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    INDEX idx_courses_user_id (user_id)
) ENGINE = InnoDB;

CREATE TABLE projects (
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

CREATE TABLE tasks (
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

CREATE TABLE sessions (
    session_id_hash CHAR(64) PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    session_data JSON NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_expires_at (expires_at)
) ENGINE = InnoDB;

SHOW TABLES;
