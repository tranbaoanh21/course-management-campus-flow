# CampusFlow — Phase 8 Course Overview

**Status:** Implementation complete — waiting for local API and browser regression

## 1. Mục tiêu

Cung cấp bức tranh ngắn gọn về một Course trước khi sinh viên đi vào từng Project và Task.

## 2. Phạm vi

- Tổng số Project và Task trong Course.
- Số Task theo `todo`, `in-progress`, `done` và quá hạn.
- Phần trăm Task đã hoàn thành.
- Task chưa hoàn thành có due date sớm nhất.
- Loading skeleton, error state và retry.
- Responsive từ mobile đến desktop.
- Tự refresh sau khi Project hoặc Task thay đổi.
- Ownership được lấy từ session hiện tại.

## 3. API

`GET /api/courses/:course_id/overview`

- Aggregate trực tiếp từ `courses`, `projects` và `tasks` trong MySQL.
- Course không thuộc user hiện tại được xử lý như không tồn tại và trả `404`.
- Deadline kế tiếp chỉ xét Task có status khác `done`.

## 4. Quyết định thiết kế

Overview không lưu thêm count hoặc phần trăm trong database. API tính lại từ dữ liệu nguồn để tránh sai lệch khi Project/Task được tạo, cập nhật hoặc xóa.

Phase này không thêm dependency, table, column hay migration.

## 5. Tiêu chí hoàn thành

- Thống kê khớp dữ liệu thật trong MySQL.
- Deadline kế tiếp có đúng Project context và overdue state.
- UI refresh sau mọi Project/Task mutation.
- Empty, loading, error và responsive states hoạt động.
- User không đọc được overview của Course thuộc tài khoản khác.
