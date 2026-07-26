# CampusFlow — Phase 2 Authentication & Data Ownership

**Status:** Complete

## 1. Mục tiêu

Phase 2 thêm tài khoản cá nhân và bảo vệ dữ liệu của từng người dùng. Sau phase này, CampusFlow không còn xem toàn bộ dữ liệu là của một người dùng chung.

Luồng mục tiêu:

```text
React form
→ Auth API
→ kiểm tra password/session
→ HttpOnly session cookie
→ middleware xác định user
→ query MySQL theo user sở hữu
```

## 2. Phạm vi chức năng

### Tài khoản

- Đăng ký bằng name, email và password.
- Đăng nhập bằng email và password.
- Kiểm tra session hiện tại khi tải ứng dụng.
- Đăng xuất và hủy session ở server.
- Hiển thị loading/error state cho các auth request.

### Quyền sở hữu dữ liệu

- Mỗi course thuộc đúng một user.
- User chỉ được đọc, tạo, sửa hoặc xóa course của chính mình.
- Quyền truy cập project và task được suy ra qua course sở hữu.
- API không tin `user_id` do frontend gửi; `user_id` luôn lấy từ session đã xác thực.
- Truy cập resource không thuộc user trả `404` để không tiết lộ resource có tồn tại hay không.

## 3. Authentication strategy

Phase 2 sử dụng `express-session` với custom MySQL store:

- `express-session` tạo, ký và quản lý session cookie sau khi register/login thành công.
- Browser lưu session ID trong cookie; cookie không chứa password hoặc dữ liệu user.
- Custom store dùng `mysql2` để lưu session data phía server và hash session ID trước khi ghi database.
- React không đọc session ID và không lưu token trong `localStorage`/`sessionStorage`.
- Mọi frontend API request gửi cookie bằng `credentials: 'include'`.

Cookie local development:

```text
HttpOnly; SameSite=Lax; Path=/
```

Production bổ sung `Secure` và bắt buộc HTTPS. CORS chỉ cho phép `CLIENT_ORIGIN` và bật credentials.

## 4. Password rules

- Không bao giờ lưu plain-text password.
- Hash password bằng hàm password derivation chậm với salt ngẫu nhiên riêng cho mỗi user.
- Phase 2 ưu tiên `scrypt` bất đồng bộ từ `node:crypto`, không dùng SHA-256 trực tiếp.
- Salt tối thiểu 16 random bytes.
- So sánh hash bằng `timingSafeEqual`.
- Password từ 12 đến 128 ký tự.
- Cho phép khoảng trắng, Unicode và ký tự đặc biệt; không bắt buộc quy tắc kiểu “phải có một chữ hoa và một số”.
- Không trim hoặc log password.

## 5. Database changes

### `users`

| Field           | Ý nghĩa                              |
| --------------- | ------------------------------------ |
| `id`            | Primary key                          |
| `name`          | Tên hiển thị                         |
| `email`         | Email đã normalize, unique           |
| `password_hash` | Hash có chứa thông tin salt/workload |
| `created_at`    | Thời điểm tạo tài khoản              |

### `sessions`

Session middleware quản lý cookie và lifecycle; custom MySQL store chỉ chịu trách nhiệm lưu/đọc session bằng `mysql2`.

- Database lưu SHA-256 hash của session ID, không lưu session ID thật từ cookie.
- Session liên kết với user để có thể revoke khi user bị xóa.
- Session data lưu dạng JSON.
- Mỗi session có thời điểm hết hạn và index phục vụ cleanup.

### `courses`

Thêm `user_id` bắt buộc, foreign key tới `users.id`, có index và `ON DELETE CASCADE`.

Project và task không cần thêm `user_id`; ownership được kiểm tra bằng join:

```text
task → project → course → user
```

## 6. API contract

| Method | Endpoint             | Chức năng                   | Public |
| ------ | -------------------- | --------------------------- | ------ |
| POST   | `/api/auth/register` | Tạo user và session         | Có     |
| POST   | `/api/auth/login`    | Xác thực và tạo session     | Có     |
| POST   | `/api/auth/logout`   | Hủy session                 | Không  |
| GET    | `/api/auth/me`       | Lấy user của session        | Không  |
| CRUD   | Course/Project/Task  | Dữ liệu thuộc user hiện tại | Không  |

Response auth chỉ trả:

```json
{
  "data": {
    "id": 1,
    "name": "Bao Anh",
    "email": "student@hcmut.edu.vn"
  }
}
```

Không endpoint nào trả `password_hash` hoặc session ID trong JSON.

## 7. Validation và lỗi

- Email được trim và chuyển lowercase trước khi lưu/tìm kiếm.
- Email sai định dạng, name rỗng và password sai độ dài trả `400` với field errors.
- Email đã đăng ký trả `409 Conflict`.
- Login sai email hoặc password đều trả cùng một thông báo chung.
- Request thiếu/expired session trả `401 Unauthorized`.
- User đã đăng nhập nhưng không sở hữu resource nhận `404 Not Found`.
- Database error và chi tiết password/session không được gửi cho client.

## 8. Security boundaries

- Backend validation và authorization ở mọi protected endpoint.
- Không chỉ ẩn button ở React; frontend không phải security boundary.
- Session mới được tạo sau khi authentication thành công.
- Logout phải hủy session phía server, không chỉ xóa state React.
- Response auth/session dùng `Cache-Control: no-store`.
- State-changing request phải có origin hợp lệ; `SameSite=Lax` là lớp bảo vệ CSRF bổ sung, không phải lý do bỏ kiểm tra server.
- Phase này chưa gồm email verification, reset password, OAuth, MFA hoặc role/admin.

## 9. Frontend flow

- `AuthProvider` gọi `/api/auth/me` khi ứng dụng khởi động.
- Chưa xác định session: hiển thị auth loading screen.
- Chưa đăng nhập: hiển thị Register/Login UI.
- Đã đăng nhập: hiển thị CampusFlow workspace.
- Logout thành công: xóa user state và quay lại Login UI.
- `apiClient` gửi `credentials: 'include'` cho mọi request.

## 10. Migration của dữ liệu Phase 1

Đã chọn **reset dữ liệu development**. Migration Phase 2 drop dữ liệu Course/Project/Task cũ và tạo lại schema có ownership.

Checkpoint migration đã hoàn thành trong môi trường development hiện tại. Với môi trường mới, chạy `database/schema.sql`; chỉ dùng reset migration khi nâng cấp database Phase 1 và chấp nhận xóa dữ liệu cũ.

## 11. Thứ tự triển khai

1. [x] Xác nhận requirements và cách xử lý dữ liệu cũ.
2. [x] Thiết kế ERD/migration cho `users`, sessions và `courses.user_id`.
3. [x] Thiết kế Auth API contract.
4. [x] Cài session middleware đã chọn.
5. [x] Implement password hashing và Auth API.
6. [x] Implement `requireAuth` và ownership queries.
7. [x] Implement Auth Context và Login/Register UI.
8. [x] Cập nhật Postman và automated tests.
9. [x] Chạy regression toàn bộ Course/Project/Task với hai user khác nhau.

## 12. Tiêu chí hoàn thành

- Register, login, session restore và logout hoạt động.
- Password không xuất hiện dạng plain text trong database, response hoặc log.
- Refresh trang vẫn giữ đăng nhập khi session còn hạn.
- Hai user không đọc hoặc thay đổi được dữ liệu của nhau.
- Toàn bộ endpoint nghiệp vụ yêu cầu authentication.
- Dữ liệu cũ được migrate hoặc reset theo phương án đã xác nhận.
- Auth API, ownership và regression tests đều pass.

## 13. Security references

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Node.js Crypto documentation](https://nodejs.org/api/crypto.html)
- [MDN secure cookie configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies)
