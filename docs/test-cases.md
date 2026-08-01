# CampusFlow — Phase 1–7 Test Cases

## 1. Mục đích

Tài liệu này là checklist nghiệm thu thủ công cho chức năng quản lý học tập, authentication và data ownership. Kiểm thử API bằng Postman, giao diện trên trình duyệt và dùng MySQL Workbench để xác nhận dữ liệu được lưu thật.

## 2. Điều kiện kiểm thử

- MySQL đang chạy và đã thực thi schema Phase 2.
- Express API chạy tại `http://localhost:3000`.
- React client chạy tại `http://localhost:5173`.
- Postman đang chọn environment `CampusFlow Local`.
- `server/.env` có `SESSION_SECRET` và thông tin kết nối MySQL hợp lệ.
- Khi cần sample data, đăng ký user trước rồi cấu hình email tương ứng trong `database/seed.sql`.

## 3. Course Management

| ID   | Trường hợp            | Thao tác                                       | Kết quả mong đợi                                                              |
| ---- | --------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| C-01 | Xem danh sách course  | Mở ứng dụng                                    | Hiển thị course từ MySQL hoặc empty state; có loading state trong lúc chờ API |
| C-02 | Tạo course hợp lệ     | Nhập tên và gửi form                           | Course xuất hiện trong UI; API trả `201`; có record mới trong bảng `courses`  |
| C-03 | Tên course rỗng       | Gửi form với tên rỗng hoặc chỉ có khoảng trắng | UI/API từ chối và hiển thị lỗi; không thêm record                             |
| C-04 | Xóa course            | Xóa một course và xác nhận                     | Course biến mất; API trả `200`; record bị xóa khỏi MySQL                      |
| C-05 | Xóa course dây chuyền | Xóa course đang có project và task             | Course, project và task liên quan đều bị xóa bởi `ON DELETE CASCADE`          |

## 4. Project Management

| ID   | Trường hợp              | Thao tác                                                | Kết quả mong đợi                                             |
| ---- | ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| P-01 | Chưa chọn course        | Mở ứng dụng nhưng chưa chọn course                      | Hiển thị hướng dẫn chọn course, không gọi danh sách project  |
| P-02 | Xem project theo course | Chọn **Xem projects**                                   | Chỉ hiển thị project thuộc course đã chọn                    |
| P-03 | Tạo project hợp lệ      | Nhập title, due date và gửi form                        | Project xuất hiện trong UI và bảng `projects`; API trả `201` |
| P-04 | Thiếu field bắt buộc    | Bỏ trống title hoặc due date                            | UI/API trả lỗi validation; không thêm record                 |
| P-05 | Course không tồn tại    | POST project với `course_id` không tồn tại bằng Postman | API trả `404` với `Course not found.`                        |
| P-06 | Xóa project             | Xóa một project và xác nhận                             | Project biến mất; task thuộc project cũng bị xóa             |

## 5. Task Management

| ID   | Trường hợp              | Thao tác                                        | Kết quả mong đợi                                                     |
| ---- | ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| T-01 | Chưa chọn project       | Chọn course nhưng chưa chọn project             | Hiển thị hướng dẫn chọn project                                      |
| T-02 | Xem task theo project   | Chọn **Xem tasks**                              | Chỉ hiển thị task thuộc project đã chọn                              |
| T-03 | Tạo task hợp lệ         | Nhập title, status, due date và gửi form        | Task xuất hiện trong UI và bảng `tasks`; API trả `201`               |
| T-04 | Thiếu field bắt buộc    | Bỏ trống title hoặc due date                    | UI/API trả lỗi validation; không thêm record                         |
| T-05 | Status không hợp lệ     | Gửi status `blocked` bằng Postman               | API trả `400`; `errors.status` mô tả ba status hợp lệ                |
| T-06 | Task quá hạn            | Tạo task có ngày trước hôm nay và status `todo` | Response có `is_overdue: true`; UI hiển thị nhãn **Quá hạn**         |
| T-07 | Task đến hạn hôm nay    | Tạo task có due date là hôm nay và chưa done    | Response có `is_overdue: false`                                      |
| T-08 | Hoàn thành task quá hạn | Đổi status của task quá hạn thành `done`        | API trả task đã cập nhật; `is_overdue: false`; nhãn quá hạn biến mất |
| T-09 | Cập nhật status         | Đổi lần lượt giữa `todo`, `in-progress`, `done` | Status mới hiển thị và được lưu trong MySQL                          |
| T-10 | Xóa task                | Xóa một task và xác nhận                        | Task biến mất khỏi UI và MySQL; API trả `200`                        |
| T-11 | Tìm task                | Nhập một phần title vào ô tìm kiếm              | Chỉ task có title phù hợp được hiển thị; dữ liệu gốc không thay đổi  |
| T-12 | Lọc theo status         | Chọn Cần làm, Đang làm hoặc Hoàn thành          | Chỉ task có status tương ứng được hiển thị                           |
| T-13 | Lọc quá hạn             | Chọn bộ lọc Quá hạn                             | Chỉ task có `is_overdue: true` được hiển thị                         |
| T-14 | Xóa bộ lọc              | Kết hợp search/filter rồi bấm Xóa bộ lọc        | Search và filter về mặc định; tất cả task hiển thị lại               |

## 6. Authentication

| ID   | Trường hợp              | Thao tác                                             | Kết quả mong đợi                                                      |
| ---- | ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| A-01 | Đăng ký hợp lệ          | Nhập name, email mới và password từ 12 ký tự         | API trả `201`; UI vào workspace; database chỉ lưu password hash       |
| A-02 | Form đăng ký sai        | Bỏ trống name, dùng email sai hoặc password quá ngắn | UI/API hiển thị lỗi theo field; không tạo user                        |
| A-03 | Email trùng             | Đăng ký lại email đã tồn tại                         | API trả `409`; UI hiển thị email đã được sử dụng                      |
| A-04 | Đăng nhập hợp lệ        | Nhập đúng email và password                          | API trả `200`; browser nhận HttpOnly session cookie; UI vào workspace |
| A-05 | Sai thông tin đăng nhập | Nhập sai email hoặc password                         | API trả `401` với cùng một thông báo chung                            |
| A-06 | Khôi phục session       | Đăng nhập rồi refresh trang                          | `/auth/me` trả user; workspace vẫn hiển thị                           |
| A-07 | Đăng xuất               | Bấm đăng xuất                                        | Session bị hủy ở server; UI trở về Login; `/auth/me` trả `401`        |
| A-08 | Endpoint được bảo vệ    | Gọi Course/Project/Task khi chưa đăng nhập           | API trả `401 Unauthorized`                                            |

## 7. Data ownership

| ID   | Trường hợp            | Thao tác                                                       | Kết quả mong đợi                                    |
| ---- | --------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| O-01 | Danh sách tách biệt   | Tạo course bằng user A, đăng nhập user B và gọi `GET /courses` | User B không thấy course của user A                 |
| O-02 | Course của user khác  | User B đọc, sửa hoặc xóa course của user A                     | API trả `404`; dữ liệu không đổi                    |
| O-03 | Project của user khác | User B đọc, sửa hoặc xóa project thuộc course của user A       | API trả `404`; dữ liệu không đổi                    |
| O-04 | Task của user khác    | User B đọc, đổi status hoặc xóa task của user A                | API trả `404`; dữ liệu không đổi                    |
| O-05 | Không tin `user_id`   | Gửi `user_id` khác trong request tạo resource                  | Backend bỏ qua field này và dùng user ID từ session |

## 8. Dashboard

| ID   | Trường hợp           | Thao tác                                        | Kết quả mong đợi                                                |
| ---- | -------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| D-01 | User chưa có dữ liệu | Đăng nhập bằng user mới                         | Các count bằng `0`, tiến độ `0%` và hiển thị empty state        |
| D-02 | Thống kê workspace   | Tạo Course, Project và Task rồi mở dashboard    | Count và số lượng theo status khớp dữ liệu trong MySQL          |
| D-03 | Task ưu tiên         | Có task quá hạn và task sắp đến hạn chưa `done` | Task quá hạn đứng trước, sau đó sắp xếp due date tăng dần       |
| D-04 | Bỏ task hoàn thành   | Đổi một priority task thành `done` rồi tải lại  | Task không còn trong danh sách ưu tiên; tiến độ hoàn thành tăng |
| D-05 | Ownership dashboard  | So sánh dashboard của hai user                  | Mỗi user chỉ nhận thống kê và task của chính mình               |
| D-06 | Quay lại dashboard   | Đang xem Course rồi click logo CampusFlow       | Course được bỏ chọn và dashboard được tải lại                   |

## 9. Personal Planner

| ID   | Trường hợp       | Thao tác                                             | Kết quả mong đợi                                    |
| ---- | ---------------- | ---------------------------------------------------- | --------------------------------------------------- |
| L-01 | Xem toàn bộ Task | Mở tab **Tất cả task**                               | Hiển thị Task từ mọi Course/Project của user        |
| L-02 | Search           | Tìm bằng một phần title                              | API/UI chỉ hiển thị title chứa chuỗi tìm kiếm       |
| L-03 | Filter           | Lọc lần lượt status và quá hạn                       | Danh sách và tổng record khớp filter                |
| L-04 | Sort             | Chọn due date gần/xa nhất hoặc task mới nhất         | Thứ tự Task thay đổi đúng                           |
| L-05 | Pagination       | Có hơn giới hạn record và chuyển trang               | API trả đúng page, total, total_pages; UI đổi trang |
| L-06 | Query sai        | Gửi status/sort/page/limit không hợp lệ bằng Postman | API trả `400` cùng field errors                     |
| L-07 | Đổi status nhanh | Đổi status trực tiếp trong Planner                   | MySQL cập nhật; danh sách và filter được tải lại    |
| L-08 | Ownership        | Đăng nhập user khác và gọi global Task API           | Không thấy Task của user đầu tiên                   |

## 10. Account Settings

| ID   | Trường hợp           | Thao tác                                          | Kết quả mong đợi                                        |
| ---- | -------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| S-01 | Mở settings          | Click tên/avatar trên header                      | Hiển thị name, email read-only và form đổi password     |
| S-02 | Đổi display name     | Nhập name hợp lệ và lưu                           | Header cập nhật ngay; refresh vẫn giữ name mới          |
| S-03 | Name không hợp lệ    | Gửi name rỗng hoặc dài quá 100 ký tự              | UI/API trả field error; database không đổi              |
| S-04 | Current password sai | Nhập current password không đúng                  | API trả `400`; password và session không đổi            |
| S-05 | Password mới sai     | Nhập password dưới 12 ký tự hoặc trùng current    | UI/API từ chối với lỗi `new_password`                   |
| S-06 | Đổi password hợp lệ  | Nhập current password đúng và password mới hợp lệ | Password hash thay đổi; current session vẫn hoạt động   |
| S-07 | Session revocation   | Đăng nhập cùng user ở browser khác trước khi đổi  | Session browser khác nhận `401` ở request tiếp theo     |
| S-08 | Login sau khi đổi    | Logout; thử password cũ rồi password mới          | Password cũ thất bại; password mới đăng nhập thành công |

## 11. Calendar & Monthly Agenda

| ID   | Trường hợp          | Thao tác                          | Kết quả mong đợi                                       |
| ---- | ------------------- | --------------------------------- | ------------------------------------------------------ |
| K-01 | Mở calendar         | Chọn tab **Lịch**                 | Hiển thị tháng hiện tại và task theo đúng due date     |
| K-02 | Chuyển tháng        | Bấm tháng trước hoặc tháng sau    | API tải tháng mới; grid và agenda không giữ dữ liệu cũ |
| K-03 | Quay về hôm nay     | Bấm **Hôm nay**                   | Calendar về tháng hiện tại và chọn ngày hôm nay        |
| K-04 | Selected-day agenda | Chọn ngày có nhiều task           | Panel bên phải hiển thị đúng task, Course và Project   |
| K-05 | Filter calendar     | Lọc status hoặc quá hạn           | Grid và agenda cùng chỉ hiển thị task phù hợp          |
| K-06 | Month không hợp lệ  | Gọi `/api/calendar?month=2026-13` | API trả `400` với `errors.month`                       |
| K-07 | Ownership calendar  | So sánh cùng tháng giữa hai user  | Mỗi user chỉ thấy deadline của chính mình              |
| K-08 | Calendar mobile     | Mở trên viewport mobile           | Navigation không tràn; calendar có thể cuộn ngang      |

## 12. Project Progress Tracking

| ID    | Trường hợp              | Thao tác                                                    | Kết quả mong đợi                                                            |
| ----- | ----------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| PP-01 | Project chưa có Task    | Tạo Project mới có due date trong tương lai                 | Hiển thị `0%`, `0/0 task` và nhãn **Chưa bắt đầu**                          |
| PP-02 | Project đang thực hiện  | Tạo nhiều Task và hoàn thành một phần                       | Progress bar và phần trăm khớp số Task `done` trên tổng Task                |
| PP-03 | Project có rủi ro       | Để Project hoặc Task chưa hoàn thành quá hạn                | Hiển thị nhãn **Có rủi ro** và số Task quá hạn                              |
| PP-04 | Project hoàn thành      | Đổi toàn bộ Task của Project sang `done`                    | Tiến độ thành `100%` và nhãn **Hoàn thành**                                 |
| PP-05 | Đồng bộ sau mutation    | Tạo, đổi status hoặc xóa Task trong Project đang chọn       | Project card tự tải lại số liệu tiến độ, không cần refresh trình duyệt      |
| PP-06 | Lọc theo tiến độ        | Chọn từng filter trong danh sách Project                    | Chỉ hiển thị Project có `progress_status` tương ứng                         |
| PP-07 | Ownership progress      | User khác gọi danh sách Project của Course không thuộc mình | API trả `404`; không lộ số liệu Task hay tiến độ của chủ sở hữu             |
| PP-08 | Dữ liệu progress từ API | Gọi GET Project sau khi thay đổi Task                       | Các count, phần trăm và trạng thái được tính lại từ dữ liệu hiện có ở MySQL |

## 13. API và chất lượng giao diện

| ID   | Trường hợp             | Thao tác                                   | Kết quả mong đợi                                                                             |
| ---- | ---------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Q-01 | API không chạy         | Dừng backend rồi tải lại UI                | UI hiển thị error state và có thể thử lại                                                    |
| Q-02 | JSON không hợp lệ      | Gửi body JSON sai cú pháp bằng Postman     | API trả `400` với `Invalid JSON body.`                                                       |
| Q-03 | ID không hợp lệ        | Gọi endpoint với ID `abc`, `0` hoặc số âm  | API trả `400` và thông báo ID không hợp lệ                                                   |
| Q-04 | Endpoint không tồn tại | Gọi `/api/unknown`                         | API trả `404` với `Endpoint not found.`                                                      |
| Q-05 | Chống gửi lặp          | Gửi form và quan sát lúc request đang chạy | Nút bị disable và hiển thị trạng thái đang xử lý                                             |
| Q-06 | Dữ liệu bền vững       | Tạo dữ liệu rồi tải lại trang              | Dữ liệu vẫn xuất hiện vì được đọc lại từ MySQL                                               |
| Q-07 | Postman regression     | Chạy collection theo thứ tự `00` đến `99`  | Tất cả test xanh, gồm auth và ownership; cleanup chỉ xóa dữ liệu nghiệp vụ do collection tạo |
| Q-08 | Hủy xác nhận xóa       | Bấm xóa rồi chọn Hủy                       | Dialog đóng và dữ liệu không thay đổi                                                        |
| Q-09 | Xác nhận xóa           | Bấm xóa rồi xác nhận trong dialog          | Nút hiện đang xử lý; dialog đóng sau khi API thành công                                      |
| Q-10 | Feedback thành công    | Tạo, sửa, đổi status hoặc xóa dữ liệu      | Toast thành công xuất hiện và tự đóng sau vài giây                                           |

## 14. Ghi nhận kết quả

Khi test một phiên bản trước khi merge hoặc release, ghi lại commit, ngày test và các test case thất bại trong issue hoặc pull request. Không chỉnh cột “Kết quả mong đợi” để che một lỗi đang tồn tại.
