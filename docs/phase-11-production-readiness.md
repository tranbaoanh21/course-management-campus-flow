# CampusFlow — Phase 11 Production Readiness

**Status:** Internal hardening in progress — hosting architecture not selected

## Đã hoàn thành

- Validate environment variables trước khi server khởi động.
- Bắt buộc HTTPS origin và database password trong production.
- Cấu hình `SameSite` cookie qua environment.
- Hỗ trợ MySQL SSL qua environment.
- Tắt `X-Powered-By` và thêm các security response headers cơ bản.
- Giới hạn JSON request body ở 32 KB.
- Graceful shutdown cho HTTP server và MySQL pool.
- Unit tests cho production environment rules.
- Focus trap, focus restore, scroll lock và unique ARIA IDs cho Modal.

## Blocker trước deploy

1. Chọn kiến trúc same-origin hay frontend/backend tách domain để chốt cookie policy.
2. Chọn MySQL provider để chốt SSL và quy trình chạy schema.
3. Thêm rate limiting cho register/login.
4. Hoàn tất visual refactor và duyệt responsive bằng browser thật.
5. Thiết lập CI, production logs và smoke tests sau deploy.

## Không thuộc lần hardening này

- Docker.
- Realtime, notification hoặc file upload.
- Thay đổi API/database nghiệp vụ.
- Tự động deploy trước khi hosting được xác nhận.
