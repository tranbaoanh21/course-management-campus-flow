# CampusFlow — Phase 4 Personal Planner

**Status:** Complete

## 1. Mục tiêu

Cho phép sinh viên xem và xử lý task xuyên suốt mọi Course/Project trong một màn hình, thay vì phải mở từng Project.

## 2. Phạm vi

- Danh sách toàn bộ Task thuộc user hiện tại.
- Tìm kiếm theo title.
- Lọc theo status hoặc quá hạn.
- Sắp xếp theo due date gần nhất, xa nhất hoặc task mới nhất.
- Phân trang ở backend, mặc định 20 và tối đa 50 record mỗi request.
- Đổi status nhanh từ Personal Planner.
- Mở Course chứa Task từ danh sách.
- Loading, error, retry, empty state và reset filter.

## 3. API

`GET /api/tasks` hỗ trợ query:

- `search`: tối đa 200 ký tự.
- `status`: `todo`, `in-progress` hoặc `done`.
- `overdue=true`: chỉ lấy task quá hạn chưa hoàn thành.
- `sort`: `due-asc`, `due-desc` hoặc `newest`.
- `page`: số nguyên dương, mặc định `1`.
- `limit`: từ `1` đến `50`, mặc định `20`.

API lấy ownership từ session và trả metadata `pagination`.

## 4. Chưa thuộc phase này

- Calendar view và drag-and-drop.
- Bulk update nhiều Task.
- Task assignment cho thành viên khác.
- Saved filters.
- Notification hoặc reminder.

## 5. Tiêu chí hoàn thành

- User chỉ thấy Task của chính mình.
- Filter, search, sort và pagination trả kết quả đúng.
- Query không hợp lệ trả `400` với field errors.
- Đổi status cập nhật MySQL và làm mới danh sách.
- Planner hoạt động trên desktop và mobile.
