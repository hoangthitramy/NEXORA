# EXITCONTROL – Hệ thống Kiểm soát Bàn giao khi Nghỉ việc

Hệ thống ứng dụng web chuyên nghiệp hỗ trợ doanh nghiệp quản lý tập trung quy trình nhân sự nghỉ việc, tự động sinh danh mục bàn giao, theo dõi tiến độ, kiểm soát thu hồi tài sản, tài khoản hệ thống và tích hợp AI phân tích rủi ro.

---

## 1. Cấu hình công nghệ

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Zustand, Lucide Icons, Axios.
- **Backend**: Node.js (ES Modules), Express.js, JWT, bcrypt, Zod, Helmet, Multer, Swagger UI.
- **Database & ORM**: MySQL 8+ (Chạy trên port 3307), Prisma ORM (24 bảng quan hệ nghiệp vụ).
- **AI Service**: Tích hợp phân tích rủi ro, kiểm tra thông tin thiếu, gợi ý phương án xử lý & Trợ lý hỏi đáp RAG.
- **Testing**: Vitest & Supertest (19/19 Test Cases Passed).

---

## 2. Các phân hệ chức năng hoàn chỉnh

### A. Hệ thống Xác thực & Quản trị Tài khoản người dùng
1. **Đăng nhập (`/login`)**: Xác thực Email & Mật khẩu bảo mật bằng JWT và bcrypt.
2. **Đăng ký tài khoản (`/register`)**: Nhân viên mới tự đăng ký tài khoản (Họ tên, Email, Mật khẩu, Số điện thoại, Chức vụ, Phòng ban), tự động sinh mã nhân viên `EMPxxx` và hồ sơ nhân sự.
3. **Quên mật khẩu & Đặt lại mật khẩu (`/forgot-password`)**: Quy trình 2 bước: Nhập email nhận mã xác thực bảo mật (Token 15 phút) $\rightarrow$ Nhập token và mật khẩu mới để đặt lại mật khẩu an toàn.
4. **Quản lý Tài khoản người dùng (`/users`)**: Dành riêng cho Admin và HR để xem toàn bộ danh sách tài khoản, tạo mới tài khoản với vai trò tùy chọn (Admin, HR, Manager, IT, Kế toán, Employee), và nút Khóa / Mở khóa tài khoản thời gian thực.

### B. Các phân hệ Nghiệp vụ Bàn giao & Kiểm soát
5. **Dashboard** (`/dashboard`): Thống kê KPI, tiến độ bàn giao, cảnh báo AI và Audit Trail.
6. **Hồ sơ thôi việc** (`/offboarding`): Danh sách, tạo hồ sơ mới, chi tiết 10 tab chuyên sâu.
7. **Nhân sự** (`/employees`): Danh mục nhân viên, chức danh, phòng ban.
8. **Nhiệm vụ bàn giao** (`/tasks`): Checklist công việc, người phụ trách, hạn xử lý (Due date).
9. **Phiếu bàn giao** (`/handovers`): Nghiệm thu mã nguồn, tài liệu dự án & xác nhận người nhận.
10. **Mẫu quy trình** (`/templates`): Quản lý mẫu checklist tự động sinh cho từng phòng ban.
11. **Quản lý tài sản** (`/assets`): Thiết bị phần cứng, người đang giữ & form xác nhận thu hồi.
12. **Tài khoản IT & Quyền** (`/access`): Tài khoản Cloud, AWS, GitHub & nút vô hiệu hóa 1-click.
13. **Phê duyệt** (`/approvals`): Quy trình duyệt đa cấp (Manager $\rightarrow$ IT $\rightarrow$ Kế toán $\rightarrow$ HR).
14. **AI Assistant** (`/ai-assistant`): RAG Knowledge, hỏi đáp quy trình & phân tích rủi ro.
15. **Báo cáo thống kê** (`/reports`): Tỷ lệ hoàn tất SLA, phân bổ phòng ban & In/Xuất PDF.
16. **Cài đặt** (`/settings`): Đổi mật khẩu tài khoản và xem ma trận phân quyền.

---

## 3. Cổng dịch vụ đang hoạt động

- **Frontend Web UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5050/api/v1](http://localhost:5050/api/v1)
- **Swagger API Docs**: [http://localhost:5050/api-docs](http://localhost:5050/api-docs)
- **MySQL Database**: `127.0.0.1:3307/exitcontrol`
# NEXORA
