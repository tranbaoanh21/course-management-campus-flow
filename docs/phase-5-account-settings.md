# CampusFlow — Phase 5 Account Settings

**Status:** Implementation complete — waiting for local API and browser regression

## 1. Mục tiêu

Cho phép user tự quản lý thông tin hiển thị và password mà không cần truy cập trực tiếp database.

## 2. Phạm vi

- Xem name và email của tài khoản hiện tại.
- Đổi display name.
- Kiểm tra current password trước khi đổi password.
- Password mới từ 12 đến 128 ký tự và phải khác password hiện tại.
- Hash password mới bằng `scrypt`.
- Thu hồi mọi session cũ và rotate session hiện tại sau khi đổi password.
- Loading, validation, error và success feedback trên React.

Email chỉ hiển thị read-only trong phase này. Đổi email cần email verification nên được để lại cho phase sau.

## 3. API

- `PATCH /api/auth/profile`: cập nhật display name và đồng bộ user snapshot trong session.
- `PATCH /api/auth/password`: xác minh current password, lưu password hash mới và thu hồi session cũ.

Cả hai endpoint đều yêu cầu authentication và trả `Cache-Control: no-store`.

## 4. Chưa thuộc phase này

- Đổi email.
- Email verification.
- Forgot/reset password.
- Xóa tài khoản.
- OAuth hoặc MFA.

## 5. Tiêu chí hoàn thành

- Name mới xuất hiện ngay trên UI và vẫn đúng sau refresh.
- Current password sai không thay đổi database.
- Password mới không xuất hiện trong response hoặc log.
- Sau khi đổi password, current session vẫn hoạt động với session ID mới.
- Các session khác của user bị thu hồi.
- Password cũ không đăng nhập được; password mới đăng nhập thành công.
