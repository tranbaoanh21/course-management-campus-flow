# CampusFlow — Phase 10 Personal Data Export

**Status:** Implementation complete — waiting for local API and browser regression

## 1. Mục tiêu

Cho phép sinh viên tự tải một bản backup dễ đọc của toàn bộ dữ liệu CampusFlow thuộc tài khoản hiện tại.

## 2. Phạm vi

- Export profile công khai: ID, name, email và ngày tạo tài khoản.
- Export toàn bộ Course → Project → Task theo cấu trúc lồng nhau.
- Kèm summary số Course, Project và Task.
- Định danh format và version để có thể phát triển import sau này.
- Tạo và tải file JSON trực tiếp trong Account Settings.
- Loading, error và success feedback.
- Không chứa password hash, cookie hoặc session data.
- Ownership dựa trên user trong session.

## 3. API

`GET /api/export`

- Endpoint chỉ đọc dữ liệu, không thay đổi MySQL.
- Các query Course, Project và Task đều giới hạn bằng `user_id` hiện tại.
- Response có `format: campusflow-export` và `version: 1`.

## 4. Quyết định thiết kế

Server dựng JSON tree để client chỉ cần tải response thành file. File có tên `campusflow-backup-YYYY-MM-DD.json` và dùng JSON format dễ xem, dễ kiểm tra, phù hợp cho bước import trong tương lai.

Phase này không thêm dependency, schema hoặc migration. Import/restore chưa thuộc scope vì đó là thao tác ghi dữ liệu cần quy tắc conflict và validation riêng.

## 5. Tiêu chí hoàn thành

- Export summary và cây dữ liệu khớp MySQL.
- File tải xuống mở được dưới dạng JSON hợp lệ.
- Dữ liệu nhạy cảm không xuất hiện trong response/file.
- User mới nhận export rỗng hợp lệ.
- User không export được dữ liệu của tài khoản khác.
