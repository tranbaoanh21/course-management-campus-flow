# CampusFlow Postman workspace

These files provide version-controlled API requests and tests for the implemented Phase 1 endpoints.

## Import

1. Open the Postman desktop application.
2. Select **Import**.
3. Import `CampusFlow.postman_collection.json`.
4. Import `CampusFlow.local.postman_environment.json`.
5. Select the **CampusFlow Local** environment.

If a manually-created CampusFlow collection already exists, archive or delete it after confirming this imported collection works.

## Run

Start the Express server and MySQL before sending requests.

Run the folders in numeric order:

1. `00 - Health`
2. `01 - Courses`
3. `02 - Projects`
4. `03 - Tasks`
5. `99 - Cleanup`

The create requests automatically store `course_id`, `project_id`, and `task_id` in the active environment. Cleanup deletes only the records referenced by those variables.

You can also run the entire collection with Collection Runner. The final Cleanup folder removes the test project and course created during the run.

## Updating

When an endpoint changes:

1. Update `docs/api.md`.
2. Update the request and tests in Postman.
3. Export the collection as **Collection v2.1**.
4. Replace the collection JSON in this directory.

Do not store passwords, API keys, tokens, or other secrets in exported Postman environments.
