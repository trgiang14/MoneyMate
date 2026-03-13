# MoneyMate – Ứng dụng quản lý tài chính cá nhân

### Giới thiệu
**MoneyMate** là ứng dụng web giúp bạn quản lý thu – chi cá nhân một cách trực quan và hiện đại.  
Bạn có thể theo dõi dòng tiền, lập ngân sách, đặt mục tiêu tiết kiệm, tự động hoá các khoản thu – chi và phân tích thói quen chi tiêu của mình chỉ trong một dashboard.

Dự án được xây dựng như một sản phẩm thực tế để áp dụng các kiến thức về phân tích yêu cầu, thiết kế hệ thống, phát triển ứng dụng web full‑stack và triển khai trên môi trường production.

---

### Mục tiêu
- **Quản lý thu – chi khoa học**: ghi chép và phân loại dòng tiền rõ ràng, nhất quán.
- **Hỗ trợ kiểm soát ngân sách & tiết kiệm**: đặt hạn mức, cảnh báo vượt ngưỡng, theo dõi mục tiêu.
- **Cung cấp báo cáo trực quan**: biểu đồ, thống kê giúp nhìn nhanh “sức khoẻ tài chính”.
- **Thực hành công nghệ hiện đại**: Next.js, Prisma, i18n, UI component library, v.v.

---

## Tính năng

### I. Tính năng cơ bản
- **Quản lý người dùng**
  - Đăng ký, đăng nhập, đăng xuất.
  - Quên / đổi mật khẩu.
  - Cập nhật thông tin cá nhân (tên hiển thị, mật khẩu).

- **Quản lý thu – chi**
  - Thêm, sửa, xoá các khoản thu và chi.
  - Nhập số tiền, ngày, ghi chú chi tiết.
  - Gán danh mục cho từng giao dịch.

- **Quản lý danh mục**
  - Bộ danh mục mặc định (ăn uống, di chuyển, mua sắm, giáo dục, giải trí, v.v.).
  - Tạo, chỉnh sửa, xoá danh mục cá nhân.

- **Theo dõi & thống kê**
  - Thống kê tổng thu – chi theo ngày / tháng / năm.
  - Biểu đồ tròn, biểu đồ cột / đường thể hiện dòng tiền.
  - Phân tích phân bổ chi tiêu theo danh mục.

- **Tìm kiếm & lọc**
  - Lọc theo khoảng thời gian, loại giao dịch, danh mục.
  - Tìm kiếm theo ghi chú giao dịch.

- **Xuất báo cáo**
  - Xuất báo cáo thu – chi.
  - Hỗ trợ định dạng **PDF** và **Excel**.

---

### II. Tính năng nâng cao
- **Ngân sách (Budgets)**
  - Thiết lập ngân sách theo tháng hoặc theo danh mục.
  - Cảnh báo khi sắp đạt hoặc đã vượt ngân sách.
  - Tổng quan ngân sách trên dashboard.

- **Mục tiêu tiết kiệm (Saving Goals)**
  - Tạo mục tiêu tiết kiệm (mua nhà, xe, du lịch…).
  - Theo dõi tiến độ đạt mục tiêu theo phần trăm.
  - Ghi nhận các khoản “đóng góp” thêm vào từng mục tiêu.

- **Tự động hoá (Automation)**
  - Thiết lập thu – chi định kỳ (hàng ngày / tuần / tháng / năm).
  - Quản lý hoá đơn cố định (điện, nước, tiền trọ…).
  - Nhắc nhở nhập chi tiêu theo khung giờ và ngày trong tuần.

- **Nhóm chi tiêu (Group Spending)**
  - Tạo / tham gia nhóm chi tiêu (gia đình, bạn bè, phòng trọ…).
  - Ghi nhận chi tiêu chung, phân chia theo:
    - Chia đều,
    - Chia theo số tiền cụ thể,
    - Chia theo phần trăm.
  - Tính toán số dư mỗi thành viên (ai cần trả thêm / ai được nhận lại).

- **Huy hiệu (Badges) & thống kê hành vi**
  - Hệ thống huy hiệu thưởng cho người dùng chăm chỉ / siêu tiết kiệm.
  - Gợi ý và nhận diện thói quen chi tiêu theo thời gian.

- **Cá nhân hoá & đa ngôn ngữ**
  - Giao diện sáng / tối.
  - Hỗ trợ đa ngôn ngữ (tiếng Việt, tiếng Anh) với `next-intl`.
  - **Đơn vị tiền tệ hiển thị luôn là VND**, ngay cả khi đổi ngôn ngữ giao diện.

---

## Công nghệ sử dụng
- **Frontend / Full‑stack**: Next.js (App Router), React, TypeScript.
- **UI**: Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: Route handlers & server actions của Next.js.
- **CSDL & ORM**: Prisma (ví dụ: PostgreSQL / MySQL tuỳ cấu hình môi trường).
- **Xác thực**: NextAuth / Auth solution được cấu hình trong `auth`.
- **Quốc tế hoá (i18n)**: `next-intl` với file `messages/vi.json` và `messages/en.json`.
- **Lịch & xử lý ngày**: `date-fns` + locale `vi`, `enUS`.

> Một số chi tiết (CSDL cụ thể, thông số deploy…) có thể thay đổi tuỳ môi trường và không được mô tả chi tiết trong README này.

---

## Cài đặt & chạy dự án

### 1. Yêu cầu môi trường
- Node.js phiên bản LTS (khuyến nghị ≥ 18).
- Trình quản lý gói `npm` hoặc `yarn`.
- CSDL (PostgreSQL / MySQL / SQLite…) tương ứng với cấu hình Prisma.

### 2. Clone & cài đặt
```bash
git clone <repo-url>
cd MoneyMate

# Cài đặt dependencies
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env` (hoặc `.env.local`) dựa trên ví dụ có sẵn và thiết lập các biến môi trường cần thiết:
- Thông tin kết nối CSDL (`DATABASE_URL`, ...).
- Cấu hình auth (client ID/secret nếu dùng OAuth).
- Các biến khác phục vụ gửi mail, cron job (nếu có).

### 4. Chạy migration & khởi tạo dữ liệu
```bash
# Chạy migration Prisma
npx prisma migrate dev

# Seed dữ liệu mẫu (nếu đã định nghĩa script)
npm run db:seed
```

### 5. Chạy ứng dụng ở môi trường phát triển
```bash
npm run dev
```
Ứng dụng mặc định chạy tại `http://localhost:3000`.

---

## Cấu trúc thư mục chính (rút gọn)
- `app/` – cấu trúc route của Next.js (auth, dashboard, marketing, API, ...).
- `app/[locale]/(dashboard)/` – các trang trong dashboard (transactions, budgets, statistics, saving-goals, automation, groups, badges, settings, ...).
- `components/` – các component UI dùng chung (card, button, form, bảng, biểu đồ, ...).
- `actions/` – server actions xử lý nghiệp vụ (giao dịch, ngân sách, mục tiêu, tự động hoá, nhóm, huy hiệu, ...).
- `messages/` – file ngôn ngữ `vi.json`, `en.json` cho i18n.
- `prisma/` – schema Prisma và các file migration.

---

## Ghi chú phát triển
- Mọi giá trị tiền tệ trong giao diện được format cố định theo chuẩn `vi-VN` và đơn vị `VND` (theo yêu cầu bài toán).
- Khi thêm tính năng mới, nên:
  - Thêm key dịch tương ứng vào `messages/vi.json` và `messages/en.json`.
  - Sử dụng `useTranslations` / `useLocale` để đảm bảo hỗ trợ đa ngôn ngữ và định dạng ngày.
- Khuyến khích viết code theo TypeScript, tách nhỏ component, tận dụng server actions để giữ code rõ ràng và dễ bảo trì.

---