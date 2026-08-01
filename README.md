# CampusFlow

CampusFlow is a full-stack web application for managing student courses, projects, tasks, deadlines, and progress. It includes account-based data ownership, a progress dashboard, and a cross-project personal task planner, with application data and sessions persisted in MySQL.

## Features

- Create, list, edit, and delete courses.
- Create, list, edit, and delete projects inside a course.
- Create, list, edit, update status, and delete tasks inside a project.
- Search tasks by title and filter them by status or overdue state.
- Mark unfinished tasks with a due date before today as overdue.
- Validate required fields on both the frontend and backend.
- Show loading, error, empty, confirmation, and success-feedback states in the UI.
- Cascade deletes from course to project to task through MySQL foreign keys.
- Run version-controlled Postman regression tests and backend validation unit tests.
- Register, log in, restore a session after refresh, and log out.
- Store passwords as salted `scrypt` hashes and sessions in MySQL.
- Restrict every course, project, and task to its authenticated owner.
- View workspace totals, completion progress, overdue work, and upcoming deadlines on a personal dashboard.
- Browse every owned task in a paginated personal planner with search, filters, sorting, and quick status updates.
- Update the account display name and securely change passwords while revoking older sessions.
- Review deadlines in a monthly calendar with status filters and a selected-day agenda.
- Track each project's completion percentage, overdue work, and progress status directly from its tasks.
- Open a Course overview with its Project/Task totals, completion, overdue count, and next deadline.
- Search owned Courses, Projects, and Tasks from one debounced global search and open their workspace context.

## Stack

- Frontend: React 19, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL with `mysql2`
- API testing: Postman
- Automated testing: Node.js built-in test runner
- Code quality: ESLint and Prettier

## Repository structure

```text
campus-flow/
├── client/       React frontend
├── server/       Express REST API
├── database/     MySQL schema and sample data
├── docs/         Requirements, ERD, API contract, tests, and Postman files
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 24 LTS and npm
- MySQL Server and MySQL Workbench
- Postman for API testing

The required Node major version is recorded in `.nvmrc`.

## Local setup

### 1. Select the Node version

From the repository root:

```bash
nvm use
```

### 2. Create the database

For a new database, open and run `database/schema.sql` in MySQL Workbench. If upgrading a Phase 1 development database, run `database/migrations/001_reset_for_phase_2_auth.sql` instead. The migration intentionally resets existing Course/Project/Task data before adding authentication and ownership.

Optionally run `database/seed.sql` after registering a user and configuring the seed email inside the script. The seed script does not delete existing records and avoids duplicating its own samples.

### 3. Configure and run the backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Update `server/.env` with the local MySQL credentials before starting the API. The default API address is `http://localhost:3000`.

### 4. Configure and run the frontend

In another terminal, from the repository root:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

Backend variables in `server/.env`:

```text
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=campus_flow
SESSION_SECRET=replace_with_a_long_random_secret
```

Frontend variable in `client/.env`:

```text
VITE_API_URL=http://localhost:3000/api
```

Real `.env` files are ignored by Git. Commit only `.env.example` files without secrets.

## API and Postman

The base API URL is `http://localhost:3000/api`. The complete contract is in `docs/api.md`.

Import these files into Postman:

- `docs/postman/CampusFlow.postman_collection.json`
- `docs/postman/CampusFlow.local.postman_environment.json`

Select the `CampusFlow Local` environment, set a local `auth_password`, and run the collection folders in numeric order. Folder `11 - Ownership` verifies isolation with a second account. Folder `99 - Cleanup` removes the Course/Project/Task records created by the collection; test accounts remain.

## Quality checks

Install the shared development dependencies once at the repository root, then run:

```bash
npm install
npm run lint
npm run format:check
npm run test:server
```

Use `npm run format` to apply Prettier formatting. Backend validation tests use the Node.js built-in test runner and do not require MySQL. Manual acceptance scenarios are documented in `docs/test-cases.md`.

## Documentation

- `docs/requirements.md` — Phase 1 product requirements
- `docs/phase-1.5.md` — product-polish scope and completion status
- `docs/phase-2-auth.md` — authentication and data-ownership design
- `docs/phase-3-dashboard.md` — dashboard and deadline-overview scope
- `docs/phase-4-planner.md` — global task planner scope
- `docs/phase-5-account-settings.md` — profile and password-security scope
- `docs/phase-6-calendar.md` — monthly deadline calendar scope
- `docs/phase-7-project-progress.md` — project progress tracking scope
- `docs/phase-8-course-overview.md` — per-course overview scope
- `docs/phase-9-global-search.md` — global workspace search scope
- `docs/erd.mmd` — Mermaid entity relationship diagram
- `docs/api.md` — REST API contract
- `docs/test-cases.md` — manual acceptance checklist
- `docs/postman/README.md` — Postman workflow

## Project status

Phase 1 MVP through Phase 6 Calendar & Monthly Agenda are complete. Phase 7 Project Progress Tracking, Phase 8 Course Overview, and Phase 9 Global Search are implemented and waiting for local regression testing. Collaboration, file uploads, realtime features, Docker, and deployment are intentionally deferred to later phases.
