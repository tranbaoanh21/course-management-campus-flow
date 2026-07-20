# CampusFlow — REST API Contract (Phase 1)

## 1. Quy ước chung

- Base URL khi chạy local: `http://localhost:3000/api`.
- Request và response sử dụng JSON.
- Request có body phải gửi header `Content-Type: application/json`.
- Tên field trong JSON dùng `snake_case` để nhất quán với database.
- ID là số nguyên dương.
- Ngày dùng định dạng `YYYY-MM-DD`, ví dụ `2026-08-15`.
- `description` là field không bắt buộc và có thể là `null`.
- API không trả thông tin lỗi nội bộ hoặc thông tin kết nối database cho client.

### Response thành công

Response đọc hoặc tạo dữ liệu có field `data`:

```json
{
  "data": {}
}
```

Response xóa dữ liệu có field `message`:

```json
{
  "message": "Course deleted successfully."
}
```

### Response thất bại

```json
{
  "message": "Validation failed.",
  "errors": {
    "name": "Name is required."
  }
}
```

Field `errors` chỉ xuất hiện khi có lỗi validation theo từng field.

## 2. HTTP status code

| Status                      | Ý nghĩa                                            |
| --------------------------- | -------------------------------------------------- |
| `200 OK`                    | Đọc, cập nhật hoặc xóa thành công                  |
| `201 Created`               | Tạo dữ liệu thành công                             |
| `400 Bad Request`           | ID, JSON body hoặc dữ liệu đầu vào không hợp lệ    |
| `404 Not Found`             | Không tìm thấy course, project, task hoặc endpoint |
| `500 Internal Server Error` | Lỗi ngoài dự kiến ở server hoặc database           |

## 3. Danh sách endpoint

| Method   | Endpoint                           | Chức năng                |
| -------- | ---------------------------------- | ------------------------ |
| `GET`    | `/api/health`                      | Kiểm tra API và database |
| `GET`    | `/api/courses`                     | Lấy danh sách course     |
| `POST`   | `/api/courses`                     | Tạo course               |
| `PATCH`  | `/api/courses/:course_id`          | Đổi tên course           |
| `DELETE` | `/api/courses/:course_id`          | Xóa course               |
| `GET`    | `/api/courses/:course_id/projects` | Lấy project theo course  |
| `POST`   | `/api/courses/:course_id/projects` | Tạo project trong course |
| `PATCH`  | `/api/projects/:project_id`        | Chỉnh sửa project        |
| `DELETE` | `/api/projects/:project_id`        | Xóa project              |
| `GET`    | `/api/projects/:project_id/tasks`  | Lấy task theo project    |
| `POST`   | `/api/projects/:project_id/tasks`  | Tạo task trong project   |
| `PATCH`  | `/api/tasks/:task_id`              | Chỉnh sửa task           |
| `PATCH`  | `/api/tasks/:task_id/status`       | Cập nhật status của task |
| `DELETE` | `/api/tasks/:task_id`              | Xóa task                 |

## 4. Health check

### `GET /api/health`

Kiểm tra Express API có hoạt động và có kết nối được MySQL hay không.

#### Response `200 OK`

```json
{
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

#### Response `500 Internal Server Error`

```json
{
  "message": "Database connection failed."
}
```

## 5. Course API

### `GET /api/courses`

Lấy tất cả course.

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "Database Systems"
    }
  ]
}
```

Nếu chưa có course, `data` là mảng rỗng:

```json
{
  "data": []
}
```

### `POST /api/courses`

Tạo course mới.

#### Request body

```json
{
  "name": "Database Systems"
}
```

#### Validation

- `name` là bắt buộc.
- `name` phải là chuỗi.
- Sau khi loại bỏ khoảng trắng ở đầu và cuối, `name` không được rỗng.
- `name` không dài quá 150 ký tự.

#### Response `201 Created`

```json
{
  "data": {
    "id": 1,
    "name": "Database Systems"
  }
}
```

#### Response `400 Bad Request`

```json
{
  "message": "Validation failed.",
  "errors": {
    "name": "Name is required."
  }
}
```

### `DELETE /api/courses/:course_id`

Xóa course. MySQL đồng thời xóa các project và task liên quan bằng `ON DELETE CASCADE`.

#### Response `200 OK`

```json
{
  "message": "Course deleted successfully."
}
```

#### Response `404 Not Found`

```json
{
  "message": "Course not found."
}
```

### `PATCH /api/courses/:course_id`

Đổi tên một course đã tồn tại. Các project và task bên trong không thay đổi.

#### Request body

```json
{
  "name": "Advanced Database Systems"
}
```

Validation của `name` giống endpoint tạo course.

#### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "name": "Advanced Database Systems"
  }
}
```

#### Response `404 Not Found`

```json
{
  "message": "Course not found."
}
```

## 6. Project API

### `GET /api/courses/:course_id/projects`

Lấy tất cả project thuộc một course.

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Database Assignment",
      "description": "Design and implement a relational database.",
      "due_date": "2026-08-15"
    }
  ]
}
```

Nếu course tồn tại nhưng chưa có project, `data` là mảng rỗng.

#### Response `404 Not Found`

```json
{
  "message": "Course not found."
}
```

### `POST /api/courses/:course_id/projects`

Tạo project trong một course đã tồn tại.

#### Request body

```json
{
  "title": "Database Assignment",
  "description": "Design and implement a relational database.",
  "due_date": "2026-08-15"
}
```

#### Validation

- `course_id` phải là số nguyên dương và course phải tồn tại.
- `title` là bắt buộc, phải là chuỗi không rỗng sau khi trim và không dài quá 200 ký tự.
- `description` không bắt buộc; nếu có thì phải là chuỗi hoặc `null`.
- `due_date` là bắt buộc và phải là ngày hợp lệ theo định dạng `YYYY-MM-DD`.

#### Response `201 Created`

```json
{
  "data": {
    "id": 1,
    "course_id": 1,
    "title": "Database Assignment",
    "description": "Design and implement a relational database.",
    "due_date": "2026-08-15"
  }
}
```

#### Response `404 Not Found`

```json
{
  "message": "Course not found."
}
```

### `DELETE /api/projects/:project_id`

Xóa project. MySQL đồng thời xóa các task liên quan bằng `ON DELETE CASCADE`.

#### Response `200 OK`

```json
{
  "message": "Project deleted successfully."
}
```

#### Response `404 Not Found`

```json
{
  "message": "Project not found."
}
```

### `PATCH /api/projects/:project_id`

Chỉnh sửa title, description và due date của project. Course sở hữu project không thay đổi.

#### Request body

```json
{
  "title": "Updated Database Assignment",
  "description": "Updated project description.",
  "due_date": "2026-09-01"
}
```

Validation của các field giống endpoint tạo project.

#### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "course_id": 1,
    "title": "Updated Database Assignment",
    "description": "Updated project description.",
    "due_date": "2026-09-01"
  }
}
```

#### Response `404 Not Found`

```json
{
  "message": "Project not found."
}
```

## 7. Task API

### `GET /api/projects/:project_id/tasks`

Lấy tất cả task thuộc một project.

`is_overdue` là field do backend tính khi đọc dữ liệu, không phải cột trong bảng `tasks`.

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Create ERD",
      "description": null,
      "status": "in-progress",
      "due_date": "2026-08-10",
      "is_overdue": false
    }
  ]
}
```

Nếu project tồn tại nhưng chưa có task, `data` là mảng rỗng.

#### Quy tắc `is_overdue`

```text
due_date < ngày hiện tại AND status != "done"
```

- Task đến hạn hôm nay không quá hạn.
- Task có status `done` không quá hạn.

#### Response `404 Not Found`

```json
{
  "message": "Project not found."
}
```

### `POST /api/projects/:project_id/tasks`

Tạo task trong một project đã tồn tại.

#### Request body

```json
{
  "title": "Create ERD",
  "description": null,
  "status": "todo",
  "due_date": "2026-08-10"
}
```

#### Validation

- `project_id` phải là số nguyên dương và project phải tồn tại.
- `title` là bắt buộc, phải là chuỗi không rỗng sau khi trim và không dài quá 200 ký tự.
- `description` không bắt buộc; nếu có thì phải là chuỗi hoặc `null`.
- `status` là bắt buộc và chỉ nhận `todo`, `in-progress` hoặc `done`.
- `due_date` là bắt buộc và phải là ngày hợp lệ theo định dạng `YYYY-MM-DD`.

#### Response `201 Created`

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Create ERD",
    "description": null,
    "status": "todo",
    "due_date": "2026-08-10",
    "is_overdue": false
  }
}
```

#### Response `404 Not Found`

```json
{
  "message": "Project not found."
}
```

### `PATCH /api/tasks/:task_id`

Chỉnh sửa title, description, status và due date của task. Project sở hữu task không thay đổi.

#### Request body

```json
{
  "title": "Update ERD",
  "description": "Add cardinality and foreign keys.",
  "status": "in-progress",
  "due_date": "2026-08-12"
}
```

Validation của các field giống endpoint tạo task.

#### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Update ERD",
    "description": "Add cardinality and foreign keys.",
    "status": "in-progress",
    "due_date": "2026-08-12",
    "is_overdue": false
  }
}
```

#### Response `404 Not Found`

```json
{
  "message": "Task not found."
}
```

### `PATCH /api/tasks/:task_id/status`

Chỉ cập nhật status của task, không thay đổi các field khác.

#### Request body

```json
{
  "status": "done"
}
```

#### Validation

- `task_id` phải là số nguyên dương.
- `status` là bắt buộc và chỉ nhận `todo`, `in-progress` hoặc `done`.

#### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Create ERD",
    "description": null,
    "status": "done",
    "due_date": "2026-08-10",
    "is_overdue": false
  }
}
```

#### Response `404 Not Found`

```json
{
  "message": "Task not found."
}
```

### `DELETE /api/tasks/:task_id`

Xóa một task.

#### Response `200 OK`

```json
{
  "message": "Task deleted successfully."
}
```

#### Response `404 Not Found`

```json
{
  "message": "Task not found."
}
```

## 8. Quy tắc xử lý endpoint và ID không hợp lệ

Nếu ID trên URL không phải số nguyên dương:

```json
{
  "message": "Invalid course ID."
}
```

Response là `400 Bad Request`. Thông báo thay đổi tương ứng thành `project ID` hoặc `task ID`.

Nếu client gọi endpoint không tồn tại:

```json
{
  "message": "Endpoint not found."
}
```

Response là `404 Not Found`.
