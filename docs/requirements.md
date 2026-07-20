# CampusFlow — Yêu cầu Phase 1 MVP

## 1. Tổng quan

CampusFlow là ứng dụng web giúp sinh viên quản lý môn học (course), đồ án hoặc dự án môn học (project), công việc cần làm (task), hạn hoàn thành và tiến độ.

Trong Phase 1, ứng dụng tập trung vào luồng dữ liệu đầy đủ:

`React frontend → Express REST API → MySQL → Express trả JSON → React cập nhật UI`

Dữ liệu phải được lưu trong MySQL. Dữ liệu chỉ lưu tạm bằng state của React không được xem là hoàn thành yêu cầu.

## 2. Mục tiêu Phase 1

- Xây dựng một MVP full-stack có thể chạy trên máy cá nhân.
- Thực hành tổ chức frontend, backend và database thành các phần riêng biệt.
- Thực hành thiết kế REST API và xử lý dữ liệu quan hệ.
- Hoàn thành luồng quản lý course, project và task từ giao diện đến database.
- Có validation và trạng thái loading/error cơ bản để ứng dụng dễ sử dụng và dễ kiểm thử.

## 3. Người dùng mục tiêu

Phase 1 có một loại người dùng: sinh viên sử dụng ứng dụng trên máy cá nhân để quản lý việc học.

Phase này chưa có tài khoản, đăng nhập hoặc phân quyền. Toàn bộ dữ liệu trong ứng dụng được xem là thuộc cùng một người dùng.

## 4. Phạm vi chức năng

### 4.1. Quản lý course

Người dùng có thể:

- Tạo course mới.
- Xem danh sách course.
- Xóa course.

Thông tin bắt buộc của course:

- Tên course.

Quy tắc:

- Không được tạo course nếu tên bị thiếu hoặc chỉ gồm khoảng trắng.
- Khi xóa course, tất cả project thuộc course đó và tất cả task thuộc các project đó cũng bị xóa.

### 4.2. Quản lý project

Người dùng có thể:

- Tạo project thuộc một course đã tồn tại.
- Xem danh sách project của một course.
- Xóa project.

Thông tin của project:

- Course sở hữu project — bắt buộc.
- Title — bắt buộc.
- Description — không bắt buộc.
- Due date — bắt buộc.

Quy tắc:

- Không được tạo project nếu course không tồn tại.
- Không được tạo project nếu title bị thiếu hoặc chỉ gồm khoảng trắng.
- Không được tạo project nếu thiếu due date hoặc due date không hợp lệ.
- Khi xóa project, tất cả task thuộc project đó cũng bị xóa.

### 4.3. Quản lý task

Người dùng có thể:

- Tạo task thuộc một project đã tồn tại.
- Xem danh sách task của một project.
- Cập nhật status của task.
- Xóa task.
- Nhận biết task quá hạn trên giao diện.

Thông tin của task:

- Project sở hữu task — bắt buộc.
- Title — bắt buộc.
- Description — không bắt buộc.
- Status — bắt buộc, chỉ nhận một trong ba giá trị: `todo`, `in-progress`, `done`.
- Due date — bắt buộc.

Quy tắc:

- Không được tạo task nếu project không tồn tại.
- Không được tạo task nếu title bị thiếu hoặc chỉ gồm khoảng trắng.
- Không được tạo task nếu status nằm ngoài ba giá trị được hỗ trợ.
- Không được tạo task nếu thiếu due date hoặc due date không hợp lệ.
- Task được xem là quá hạn khi due date trước ngày hiện tại và status khác `done`.
- Task có due date là ngày hiện tại không được xem là quá hạn.

## 5. Validation và xử lý lỗi

- Frontend kiểm tra các trường bắt buộc trước khi gửi request để phản hồi nhanh cho người dùng.
- Backend vẫn phải tự validation mọi dữ liệu đầu vào; không được tin rằng dữ liệu từ frontend luôn hợp lệ.
- API trả JSON cho cả trường hợp thành công và thất bại.
- API sử dụng HTTP status code phù hợp với kết quả xử lý.
- Giao diện hiển thị thông báo dễ hiểu khi validation thất bại hoặc API gặp lỗi.
- Lỗi database hoặc lỗi nội bộ không được làm backend dừng ngoài ý muốn và không để lộ thông tin nhạy cảm cho frontend.

## 6. Trạng thái giao diện khi gọi API

Với các thao tác đọc hoặc thay đổi dữ liệu, giao diện cần:

- Hiển thị trạng thái loading trong lúc chờ phản hồi.
- Hạn chế gửi lặp cùng một thao tác trong lúc request đang xử lý.
- Hiển thị error state khi request thất bại.
- Cập nhật dữ liệu hiển thị sau khi thao tác thành công.
- Hiển thị trạng thái rỗng khi chưa có course, project hoặc task tương ứng.

## 7. Yêu cầu dữ liệu

Ba thực thể chính của Phase 1:

- Một course có thể có nhiều project.
- Một project chỉ thuộc một course.
- Một project có thể có nhiều task.
- Một task chỉ thuộc một project.
- Quan hệ xóa dây chuyền phải được đảm bảo ở database để tránh dữ liệu project hoặc task không còn đối tượng cha.

Thiết kế bảng, khóa chính, khóa ngoại và kiểu dữ liệu chi tiết sẽ được xác định ở bước ERD và database schema tiếp theo.

## 8. Công nghệ trong Phase 1

- Frontend: React, Vite, Tailwind CSS.
- Backend: Node.js, Express.
- Database: MySQL.
- Node database client: `mysql2`.
- Database GUI: MySQL Workbench.
- API testing: Postman hoặc Insomnia.
- Version control: Git và GitHub.

## 9. Ngoài phạm vi Phase 1

Phase 1 chưa bao gồm:

- Đăng ký, đăng nhập và phân quyền.
- Admin dashboard.
- Thành viên nhóm và giao task cho từng người.
- Chat, comment, notification hoặc realtime.
- Upload file.
- AI.
- Redux, Next.js hoặc TypeScript.
- Prisma hoặc PostgreSQL.
- Docker và deployment.
- Ứng dụng mobile.

Các chức năng trên chỉ được xem xét ở phase sau và không phải điều kiện hoàn thành MVP hiện tại.

## 10. Tiêu chí hoàn thành MVP

Phase 1 được xem là hoàn thành khi có thể kiểm thử thành công các luồng sau:

1. Tạo một course và thấy course đó trong danh sách sau khi tải lại dữ liệu.
2. Tạo một project thuộc course, gồm title và due date, rồi xem project theo course.
3. Tạo một task thuộc project với status hợp lệ và xem task theo project.
4. Cập nhật status của task và nhận lại dữ liệu đã cập nhật.
5. Task có due date trước hôm nay và chưa `done` được đánh dấu quá hạn; task `done` không bị đánh dấu quá hạn.
6. Xóa task và task không còn trong MySQL.
7. Xóa project và các task liên quan cũng bị xóa.
8. Xóa course và các project, task liên quan cũng bị xóa.
9. Dữ liệu bắt buộc bị thiếu hoặc không hợp lệ bị từ chối với thông báo phù hợp.
10. Giao diện có loading, error và empty state cho các luồng chính.
11. Dữ liệu vẫn tồn tại sau khi tải lại trang vì được lưu trong MySQL.

## 11. Điều kiện chưa quyết định ở bước này

Các chi tiết sau sẽ được chốt ở tài liệu tương ứng, sau khi requirement được xác nhận:

- Tên bảng, tên cột và kiểu dữ liệu: ERD và `database/schema.sql`.
- Endpoint, request body, response body và HTTP status cụ thể: `docs/api.md`.
- Bố cục màn hình và component React: bước thiết kế frontend.
