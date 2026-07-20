# CampusFlow

CampusFlow is a full-stack student project for managing courses, projects, tasks, deadlines, and progress.

The repository is currently implementing the Phase 1 MVP.

## Current progress

- Phase 1 requirements, ERD, MySQL schema, and REST API contract completed.
- Express health check and MySQL connection completed.
- Course Management implemented end to end.
- Project Management implemented and ready for end-to-end verification.
- Task Management not started yet.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL with `mysql2`
- API testing: Postman

## Repository structure

```text
client/    React frontend
server/    Express REST API
database/  MySQL schema
docs/      Requirements, ERD, and API contract
```

## Local development

Use Node.js 24 LTS. The required version is recorded in `.nvmrc`.

### Database

Run `database/schema.sql` in MySQL Workbench.

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Update `server/.env` with your local MySQL credentials before starting the API.

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:3000` by default.

## Quality checks

From the repository root:

```bash
npm install
npm run lint
npm run format:check
```

Detailed product and API documentation is available in `docs/`.
