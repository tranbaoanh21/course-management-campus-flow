# CampusFlow — Phase 1.5 Product Polish

**Status:** Completed

## Mục tiêu

Phase 1.5 phát triển MVP thành một portfolio project hoàn thiện hơn mà không thay đổi stack và chưa thêm authentication. Trọng tâm là các thao tác người dùng còn thiếu, trải nghiệm giao diện và khả năng kiểm thử.

## Phạm vi

### 1. Chỉnh sửa dữ liệu

- [x] Đổi tên course.
- [x] Chỉnh sửa title, description và due date của project.
- [x] Chỉnh sửa title, description, status và due date của task.
- [x] Backend validation mọi dữ liệu cập nhật.

### 2. Tìm kiếm và lọc task

- [x] Tìm task theo title.
- [x] Lọc theo `todo`, `in-progress`, `done` và trạng thái quá hạn.
- [x] Cho phép quay về chế độ hiển thị tất cả.

### 3. Hoàn thiện UX

- [x] Thay confirmation của trình duyệt bằng dialog trong ứng dụng.
- [x] Thông báo rõ khi tạo, cập nhật hoặc xóa thành công.
- [x] Giữ giao diện responsive và hỗ trợ thao tác bàn phím cơ bản.

### 4. Kiểm thử

- [x] Cập nhật API contract và Postman collection cho endpoint mới.
- [x] Thêm automated tests cho validation rules bằng Node.js test runner.
- [x] Chạy regression tests cho các API quan trọng bằng Postman collection.

## Ngoài phạm vi

- Authentication và phân quyền.
- Team collaboration và task assignment.
- Realtime, notification và upload file.
- Docker và deployment.
- Thay đổi database hoặc frontend framework.

## Tiêu chí hoàn thành

Phase 1.5 hoàn thành khi người dùng có thể tạo, đọc, chỉnh sửa, xóa và tìm/lọc dữ liệu chính; các thao tác có feedback phù hợp; API mới có validation và regression tests.
