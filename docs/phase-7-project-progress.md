# CampusFlow — Phase 7 Project Progress Tracking

**Status:** Implementation complete — waiting for local API and browser regression

## 1. Mục tiêu

Giúp sinh viên đánh giá nhanh Project nào chưa bắt đầu, đang tiến hành, có rủi ro hoặc đã hoàn thành dựa trên dữ liệu Task thật.

## 2. Phạm vi

- Hiển thị số Task đã hoàn thành trên tổng số Task.
- Tính và hiển thị phần trăm cùng progress bar.
- Hiển thị số Task quá hạn.
- Phân loại `not-started`, `active`, `at-risk` và `completed`.
- Lọc danh sách Project theo trạng thái tiến độ.
- Tự tải lại tiến độ sau khi tạo, sửa status hoặc xóa Task.
- Giữ data ownership theo user đang đăng nhập.

## 3. Cách tính

- `completion_percentage = round(completed_task_count / task_count * 100)`.
- Project không có Task có tiến độ `0%`.
- Tất cả Task đã `done` thì Project là `completed`.
- Project quá due date hoặc có Task quá hạn thì là `at-risk`.
- Project chưa có Task và chưa quá hạn thì là `not-started`.
- Các trường hợp còn lại là `active`.

Các count và trạng thái được aggregate từ bảng `tasks` trong query Project; không lưu bản sao phần trăm vào database nên không có dữ liệu tiến độ bị lệch.

## 4. API thay đổi

Các response của Project có thêm:

- `task_count`
- `completed_task_count`
- `overdue_task_count`
- `completion_percentage`
- `is_overdue`
- `progress_status`

Không có endpoint, dependency hoặc migration database mới.

## 5. Tiêu chí hoàn thành

- API trả đúng aggregate sau mỗi thay đổi Task.
- UI cập nhật Project card mà không cần refresh browser.
- Filter hiển thị đúng từng nhóm tiến độ.
- User không đọc được Project progress thuộc tài khoản khác.
- Loading, error và empty state hiện có vẫn hoạt động.
