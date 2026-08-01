# CampusFlow — REST API Contract (Phase 1–5)

## 1. Quy ước chung

- Base URL khi chạy local: `http://localhost:3000/api`.
- Request và response sử dụng JSON.
- Request có body phải gửi header `Content-Type: application/json`.
- Tên field trong JSON dùng `snake_case` để nhất quán với database.
- ID là số nguyên dương.
- Ngày dùng định dạng `YYYY-MM-DD`, ví dụ `2026-08-15`.
- `description` là field không bắt buộc và có thể là `null`.
- API không trả thông tin lỗi nội bộ hoặc thông tin kết nối database cho client.
- Phase 2 dùng server-side session qua cookie; client gửi `credentials: 'include'`.
- `/api/health`, register và login là public. Các endpoint còn lại yêu cầu session hợp lệ.
- API lấy `user_id` từ session, không nhận quyền sở hữu do client gửi.

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
| `401 Unauthorized`          | Thiếu, hết hạn hoặc sai session/login credentials  |
| `404 Not Found`             | Không tìm thấy course, project, task hoặc endpoint |
| `409 Conflict`              | Email đăng ký đã tồn tại                           |
| `500 Internal Server Error` | Lỗi ngoài dự kiến ở server hoặc database           |

## 3. Danh sách endpoint

| Method   | Endpoint                           | Chức năng                | Auth     |
| -------- | ---------------------------------- | ------------------------ | -------- |
| `GET`    | `/api/health`                      | Kiểm tra API và database | Public   |
| `POST`   | `/api/auth/register`               | Đăng ký và tạo session   | Public   |
| `POST`   | `/api/auth/login`                  | Đăng nhập và tạo session | Public   |
| `GET`    | `/api/auth/me`                     | Lấy user hiện tại        | Required |
| `PATCH`  | `/api/auth/profile`                | Đổi tên hiển thị         | Required |
| `PATCH`  | `/api/auth/password`               | Đổi password             | Required |
| `POST`   | `/api/auth/logout`                 | Hủy session              | Required |
| `GET`    | `/api/dashboard`                   | Tổng quan và deadline    | Required |
| `GET`    | `/api/courses`                     | Lấy danh sách course     | Required |
| `POST`   | `/api/courses`                     | Tạo course               | Required |
| `PATCH`  | `/api/courses/:course_id`          | Đổi tên course           | Required |
| `DELETE` | `/api/courses/:course_id`          | Xóa course               | Required |
| `GET`    | `/api/courses/:course_id/projects` | Lấy project theo course  | Required |
| `POST`   | `/api/courses/:course_id/projects` | Tạo project trong course | Required |
| `PATCH`  | `/api/projects/:project_id`        | Chỉnh sửa project        | Required |
| `DELETE` | `/api/projects/:project_id`        | Xóa project              | Required |
| `GET`    | `/api/tasks`                       | Danh sách task toàn cục  | Required |
| `GET`    | `/api/projects/:project_id/tasks`  | Lấy task theo project    | Required |
| `POST`   | `/api/projects/:project_id/tasks`  | Tạo task trong project   | Required |
| `PATCH`  | `/api/tasks/:task_id`              | Chỉnh sửa task           | Required |
| `PATCH`  | `/api/tasks/:task_id/status`       | Cập nhật status của task | Required |
| `DELETE` | `/api/tasks/:task_id`              | Xóa task                 | Required |

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

## 5. Dashboard API

### `GET /api/dashboard`

Trả thống kê toàn workspace và tối đa 6 task chưa hoàn thành cần ưu tiên. Dữ liệu chỉ thuộc user hiện tại.

#### Response `200 OK`

```json
{
  "data": {
    "counts": {
      "courses": 3,
      "projects": 5,
      "tasks": 12
    },
    "task_status": {
      "todo": 4,
      "in_progress": 3,
      "done": 5,
      "overdue": 2
    },
    "completion_percentage": 42,
    "priority_tasks": [
      {
        "id": 7,
        "project_id": 2,
        "title": "Hoàn thành ERD",
        "status": "in-progress",
        "due_date": "2026-08-15",
        "project_title": "Database Assignment",
        "course_id": 1,
        "course_name": "Database Systems",
        "is_overdue": false
      }
    ]
  }
}
```

`completion_percentage` được làm tròn từ `done / tổng task`. Nếu chưa có task, giá trị là `0`.

## 6. Course API

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

## 7. Project API

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

## 8. Task API

### `GET /api/tasks`

Lấy Task thuộc tất cả Course của user hiện tại. Endpoint hỗ trợ search, filter, sort và pagination phía server.

#### Query parameters

| Query     | Mặc định   | Giá trị hợp lệ                     |
| --------- | ---------- | ---------------------------------- |
| `search`  | Chuỗi rỗng | Title chứa chuỗi, tối đa 200 ký tự |
| `status`  | Không lọc  | `todo`, `in-progress`, `done`      |
| `overdue` | Không lọc  | `true`                             |
| `sort`    | `due-asc`  | `due-asc`, `due-desc`, `newest`    |
| `page`    | `1`        | Số nguyên dương                    |
| `limit`   | `20`       | Số nguyên từ `1` đến `50`          |

#### Response `200 OK`

```json
{
  "data": [
    {
      "id": 7,
      "project_id": 2,
      "title": "Hoàn thành ERD",
      "description": null,
      "status": "in-progress",
      "due_date": "2026-08-15",
      "project_title": "Database Assignment",
      "course_id": 1,
      "course_name": "Database Systems",
      "is_overdue": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

Query không hợp lệ trả `400 Validation failed` và field tương ứng trong `errors`.

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

## 9. Quy tắc xử lý endpoint và ID không hợp lệ

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

## 10. Authentication API

Auth responses gửi header `Cache-Control: no-store`. Register/login thành công tạo server-side session và gửi cookie bằng `Set-Cookie`.

Cookie không được trả trong JSON và không thể đọc bằng JavaScript vì có `HttpOnly`.

### `POST /api/auth/register`

Tạo user mới và đăng nhập ngay bằng một session mới.

#### Request body

```json
{
  "name": "Bao Anh",
  "email": "student@hcmut.edu.vn",
  "password": "a long private passphrase"
}
```

#### Validation

- `name` là chuỗi bắt buộc, trim trước khi lưu và không dài quá 100 ký tự.
- `email` là chuỗi bắt buộc, đúng định dạng cơ bản và không dài quá 255 ký tự.
- Email được trim và lowercase trước khi kiểm tra/lưu.
- `password` là chuỗi từ 12 đến 128 ký tự.
- Password không được trim hoặc ghi log.

#### Response `201 Created`

```json
{
  "data": {
    "id": 1,
    "name": "Bao Anh",
    "email": "student@hcmut.edu.vn"
  }
}
```

#### Response `400 Bad Request`

```json
{
  "message": "Validation failed.",
  "errors": {
    "email": "Email must be valid.",
    "password": "Password must be between 12 and 128 characters."
  }
}
```

#### Response `409 Conflict`

```json
{
  "message": "Email is already registered.",
  "errors": {
    "email": "Email is already registered."
  }
}
```

### `POST /api/auth/login`

Xác thực email/password và tạo session mới. Login sai email và sai password dùng cùng thông báo để hạn chế dò tài khoản.

#### Request body

```json
{
  "email": "student@hcmut.edu.vn",
  "password": "a long private passphrase"
}
```

#### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "name": "Bao Anh",
    "email": "student@hcmut.edu.vn"
  }
}
```

#### Response `401 Unauthorized`

```json
{
  "message": "Invalid email or password."
}
```

### `GET /api/auth/me`

Lấy public profile của user thuộc session hiện tại. Endpoint này được frontend gọi khi ứng dụng khởi động.

#### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "name": "Bao Anh",
    "email": "student@hcmut.edu.vn"
  }
}
```

#### Response `401 Unauthorized`

```json
{
  "message": "Authentication required."
}
```

### `PATCH /api/auth/profile`

Cập nhật display name của user hiện tại. Email không thể thay đổi trong phase này.

#### Request body

```json
{
  "name": "Bao Anh"
}
```

#### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "name": "Bao Anh",
    "email": "student@hcmut.edu.vn"
  }
}
```

Name được trim, bắt buộc và không dài quá 100 ký tự.

### `PATCH /api/auth/password`

Đổi password của user hiện tại. Thành công sẽ thu hồi các session cũ và rotate current session.

#### Request body

```json
{
  "current_password": "current private passphrase",
  "new_password": "new private passphrase"
}
```

#### Response `200 OK`

```json
{
  "message": "Password changed successfully."
}
```

Current password sai trả `400` với `errors.current_password`. Password mới phải từ 12 đến 128 ký tự và khác current password.

### `POST /api/auth/logout`

Hủy session ở server và clear cookie ở browser.

#### Response `200 OK`

```json
{
  "message": "Logged out successfully."
}
```

### Protected resource rules

- Request không có session hợp lệ trả `401 Authentication required.`
- Query Course luôn dùng `request.user.id` làm owner.
- Query Project/Task join qua Course để kiểm tra ownership.
- Resource tồn tại nhưng thuộc user khác vẫn trả `404`, không trả `403`.
- Client gửi `user_id` trong body không làm thay đổi owner và field đó bị bỏ qua.
