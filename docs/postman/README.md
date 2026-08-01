# CampusFlow Postman workspace

These files provide version-controlled API requests and tests for CampusFlow authentication, owned CRUD endpoints, dashboard overview, the personal planner, account settings, and the monthly calendar.

## Import

1. Open the Postman desktop application.
2. Select **Import**.
3. Import `CampusFlow.postman_collection.json`.
4. Import `CampusFlow.local.postman_environment.json`.
5. Select the **CampusFlow Local** environment.

If a manually-created CampusFlow collection already exists, archive or delete it after confirming this imported collection works.

## Run

Start the Express server and MySQL before sending requests.

Before running, edit the active **CampusFlow Local** environment and set a local current value for `auth_password`. Use at least 12 characters. Do not export that current value back into the repository.

Run the folders in numeric order:

1. `00 - Health`
2. `01 - Authentication`
3. `02 - Courses`
4. `03 - Projects`
5. `04 - Tasks`
6. `05 - Planner`
7. `06 - Dashboard`
8. `07 - Calendar`
9. `08 - Ownership`
10. `09 - Account Settings`
11. `99 - Cleanup`

The auth requests generate a unique local email, save the created user ID, and rely on Postman's cookie jar for the HttpOnly session cookie. The create requests automatically store `course_id`, `project_id`, and `task_id` in the active environment. Ownership creates a second user and verifies that the first user's resources stay private. Account Settings generates `auth_new_password`, rotates the owner session, and signs back in before Cleanup. Cleanup deletes only the owner records referenced by those variables; test users remain in the local database.

You can also run the entire collection with Collection Runner. The final Cleanup folder removes the test project and course created during the run.

## Updating

When an endpoint changes:

1. Update `docs/api.md`.
2. Update the request and tests in Postman.
3. Export the collection as **Collection v2.1**.
4. Replace the collection JSON in this directory.

Do not store passwords, API keys, tokens, or other secrets in exported Postman environments.
