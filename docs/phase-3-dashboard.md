# CampusFlow — Phase 3 Dashboard & Deadline Overview

**Status:** Implementation complete — waiting for local API and browser regression

## 1. Mục tiêu

Biến màn hình đầu tiên sau khi đăng nhập thành dashboard hữu ích, giúp sinh viên thấy tiến độ và deadline quan trọng mà không phải mở từng course.

## 2. Phạm vi

- Tổng số Course, Project và Task của user hiện tại.
- Số Task theo `todo`, `in-progress`, `done` và quá hạn.
- Phần trăm Task đã hoàn thành.
- Tối đa 6 Task chưa hoàn thành, ưu tiên quá hạn rồi đến due date gần nhất.
- Loading, error, retry và empty state trên React.
- Click logo CampusFlow để quay lại dashboard từ workspace của một Course.

## 3. API

`GET /api/dashboard` yêu cầu authentication. Mọi thống kê và task đều được giới hạn bởi `courses.user_id` lấy từ session.

## 4. Chưa thuộc phase này

- Biểu đồ dùng thư viện ngoài.
- Calendar view.
- Nhắc deadline qua email hoặc notification.
- Tuỳ chỉnh widget dashboard.
- Dữ liệu realtime.

## 5. Tiêu chí hoàn thành

- Dashboard hiển thị đúng dữ liệu của user đang đăng nhập.
- User mới nhận các count bằng `0` và empty state.
- Task `done` không xuất hiện trong danh sách ưu tiên.
- Task quá hạn xuất hiện trước task chưa đến hạn.
- API, loading, error và responsive layout hoạt động đúng.
