# CampusFlow — Phase 10.5 Visual Identity & UX Refactor

**Status:** First visual slice implemented — waiting for desktop and mobile review

## 1. Mục tiêu

Loại bỏ cảm giác generic SaaS/AI-generated và xây một visual identity phù hợp với academic workspace dành cho sinh viên.

Phase này giữ nguyên API, database và business logic.

## 2. Audit ban đầu

Source frontend trước refactor có nhiều pattern lặp:

- 53 lần `rounded-xl`.
- 19 lần `rounded-2xl`.
- 47 lần `border-slate-200`.
- 15 lần dùng `bg-indigo-600`.
- 20 shadow utilities.
- Nhiều uppercase eyebrow label và metric card có hình thức giống nhau.

Kết quả là các màn hình có cùng nhịp card, thiếu hierarchy riêng theo loại dữ liệu và chưa thể hiện rõ bối cảnh học tập.

## 3. Art direction

Ba thuộc tính chính:

- Tập trung.
- Học thuật.
- Điềm tĩnh.

Nguyên tắc:

- Warm paper canvas thay cho nền dashboard lạnh.
- Forest green là accent chính; màu đỏ chỉ dành cho cảnh báo.
- Editorial serif dùng có chọn lọc cho page title và số liệu lớn.
- Divider, alignment và typography thay cho card/shadow dư thừa.
- Radius nhỏ, chỉ dùng khi có ý nghĩa phân lớp.
- Microcopy ưu tiên tiếng Việt nhất quán.

## 4. First slice

Đã refactor:

- Global color/design tokens trong `client/src/index.css`.
- Header, desktop/mobile navigation và Course page heading.
- Course sidebar, create/edit states và selected-course treatment.
- Dashboard header, workspace summary, priority list và progress panel.
- Global Search launcher trong application header.

## 5. Bước tiếp theo sau khi duyệt

- Course Overview.
- Project Manager.
- Task Manager và Personal Planner.
- Calendar.
- Authentication.
- Account Settings, Modal, Confirm Dialog và Toast.
- Responsive screenshot review ở 390 px, 768 px và 1440 px.

Không nhân rộng art direction sang toàn bộ UI cho đến khi first slice được duyệt trực quan.
