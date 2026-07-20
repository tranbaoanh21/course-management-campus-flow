# CampusFlow

CampusFlow is a full-stack web application for managing student courses, projects, tasks, deadlines, and progress. Phase 1 is a working MVP with data persisted in MySQL.

## Features

- Create, list, and delete courses.
- Create, list, and delete projects inside a course.
- Create, list, update status, and delete tasks inside a project.
- Mark unfinished tasks with a due date before today as overdue.
- Validate required fields on both the frontend and backend.
- Show loading, error, and empty states in the UI.
- Cascade deletes from course to project to task through MySQL foreign keys.

## Stack

- Frontend: React 19, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL with `mysql2`
- API testing: Postman
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

Open and run `database/schema.sql` in MySQL Workbench. Optionally run `database/seed.sql` afterward to add sample data. The seed script does not delete existing records and avoids duplicating its own samples.

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

Select the `CampusFlow Local` environment and run the collection folders in numeric order. Folder `99 - Cleanup` removes the records created by the collection.

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
- `docs/erd.mmd` — Mermaid entity relationship diagram
- `docs/api.md` — REST API contract
- `docs/test-cases.md` — manual acceptance checklist
- `docs/postman/README.md` — Postman workflow

## Phase 1 status

The core Phase 1 MVP is complete. Authentication, collaboration, file uploads, realtime features, Docker, and deployment are intentionally deferred to later phases.
