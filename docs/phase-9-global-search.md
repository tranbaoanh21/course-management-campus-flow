# CampusFlow — Phase 9 Global Search

**Status:** Implementation complete — waiting for local API and browser regression

## 1. Mục tiêu

Giúp sinh viên tìm nhanh dữ liệu trong toàn workspace mà không cần nhớ Course hoặc Project đang chứa công việc đó.

## 2. Phạm vi

- Tìm Course theo name.
- Tìm Project và Task theo title.
- Nhóm kết quả theo loại resource.
- Hiển thị Course/Project context và trạng thái Task.
- Mở Course hoặc Project chứa kết quả ngay trong workspace.
- Debounce 300 ms để tránh gọi API sau mỗi phím bấm quá nhanh.
- Loading, error, empty và responsive modal states.
- Validation query 2–100 ký tự trên backend.
- Ownership dựa trên user trong session.

## 3. API

`GET /api/search?q=<query>`

- Search là literal substring, không cho ký tự `%` hoặc `_` thay đổi ý nghĩa thành SQL wildcard.
- Giới hạn 5 Course, 5 Project và 8 Task để response gọn.
- Task quá hạn được ưu tiên trước trong nhóm Task.
- API không trả resource thuộc user khác.

## 4. Quyết định thiết kế

Phase này dùng `LOCATE` trên dữ liệu hiện có để giữ implementation dễ học và không cần migration. Với quy mô dữ liệu lớn hơn, có thể bổ sung search index hoặc một search service ở phase hạ tầng sau.

Không có dependency, table, column hoặc migration mới.

## 5. Tiêu chí hoàn thành

- Từ khóa hợp lệ trả đúng ba nhóm kết quả.
- Click kết quả mở đúng Course và Project context.
- Search không gọi API khi dưới 2 ký tự.
- Query lỗi trả field error rõ ràng.
- User không tìm thấy dữ liệu của tài khoản khác.
