# CampusFlow — Phase 6 Calendar & Monthly Agenda

**Status:** Complete

## 1. Mục tiêu

Cho phép sinh viên nhìn deadline theo tháng và tập trung vào task của một ngày cụ thể.

## 2. Phạm vi

- Calendar grid 6 tuần, bắt đầu từ thứ Hai.
- Điều hướng tháng trước, tháng sau và quay về hôm nay.
- Hiển thị task theo due date.
- Lọc task theo status hoặc quá hạn.
- Selected-day agenda hiển thị Course, Project và trạng thái.
- Click task context để mở Course tương ứng.
- Loading, error, retry và empty state.
- Mobile navigation riêng, calendar có horizontal scroll khi cần.

## 3. API

`GET /api/calendar?month=YYYY-MM`

- `month` không truyền sẽ dùng tháng hiện tại của server.
- Chỉ chấp nhận tháng từ `2000-01` đến `2100-12`.
- Query dùng range từ ngày đầu tháng đến trước ngày đầu tháng tiếp theo.
- Toàn bộ task được giới hạn bởi `courses.user_id` từ session.

## 4. Chưa thuộc phase này

- Drag-and-drop để đổi due date.
- Week/day time-slot view.
- Recurring task.
- Đồng bộ Google Calendar.
- Reminder và notification.

## 5. Tiêu chí hoàn thành

- Calendar hiển thị task đúng ngày và đúng tháng.
- Chuyển tháng không làm lộ hoặc giữ nhầm dữ liệu tháng trước.
- Filter áp dụng đồng thời cho grid và selected-day agenda.
- User chỉ thấy task thuộc Course của chính mình.
- Month query không hợp lệ trả `400` với field error.
