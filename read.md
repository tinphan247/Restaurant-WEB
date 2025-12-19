thống nhất Interface (Hợp đồng dữ liệu) trước khi chia nhau làm. Tạo một file types.ts (hoặc thống nhất qua JSON):
// types/table.d.ts (Dùng chung cho cả BE và FE)
export interface Table {
  id: string; // UUID
  tableNumber: string;
  capacity: number;
  location: string;
  status: 'active' | 'inactive';
  qrToken: string | null; // JWT String
}

Người 1: Core System & Table Manager (Quản lý Bàn)
Nhiệm vụ: Xây dựng xương sống của ứng dụng, quản lý dữ liệu gốc và giao diện Dashboard.
•	Database: Chịu trách nhiệm chính script CREATE TABLE tables và các field cơ bản (trừ logic token).
•	Phạm vi: CRUD bàn, Validate dữ liệu (sức chứa, tên bàn), Filter/Sort.
Cấu trúc thư mục (Folder Structure)
Backend (Node.js)
src/
└── modules/
    └── tables/  <-- Khu vực làm việc
        ├── table.entity.ts      (Model định nghĩa bảng DB)
        ├── table.dto.ts         (Validate input: capacity 1-20, unique name)
        ├── table.controller.ts  (Endpoints: GET, POST, PUT, PATCH status)
        └── table.service.ts     (Logic query DB, Soft delete)
Frontend (React)
src/
└── features/
    └── admin-dashboard/  <-- Khu vực làm việc
        ├── components/
        │   ├── TableGrid.tsx    (Hiển thị danh sách)
        │   ├── TableForm.tsx    (Modal thêm/sửa)
        │   └── FilterBar.tsx    (Lọc theo Status/Location)
        └── AdminPage.tsx

Người 2: Security & Public Access (QR Logic & Khách hàng)
Nhiệm vụ: Xây dựng "bộ não" xử lý mã QR. Tạo token bảo mật và giao diện phía khách hàng (người quét mã).
•	Database: Tập trung vào cột qr_token.
•	Phạm vi: Logic sinh JWT, Logic Verify (quét mã), Logic Regenerate (đổi mã), Invalidate (hủy mã cũ).
•	Độc lập: Khi làm FE, hãy hardcode một mockToken để test giao diện menu mà không cần chờ Người 1 tạo bàn thật.
Cấu trúc thư mục (Folder Structure)
Backend (Node.js)
src/
└── modules/
    └── qr-auth/  <-- Khu vực làm việc
        ├── qr.utils.ts          (Hàm sign và verify JWT)
        ├── qr.controller.ts     (POST /generate, POST /regenerate, GET /verify)
        ├── qr.service.ts        (Update token vào DB, check token cũ)
        └── guards/
            └── qr-verify.guard.ts (Middleware chặn token hết hạn)

Frontend (React)
src/
└── features/
    └── customer-view/  <-- Khu vực làm việc
        ├── components/
        │   ├── MenuLoader.tsx   (Gọi API verify token)
        │   ├── ErrorScreen.tsx  (Hiển thị khi token invalid/hết hạn)
        │   └── MockMenu.tsx     (Menu giả hiển thị sau khi quét thành công)
        └── ScanPage.tsx         (Trang đích: /menu?token=...)

Người 3: Export Tools & Visuals (Công cụ in ấn)
Nhiệm vụ: Xử lý các tác vụ "nặng" về file và hiển thị hình ảnh QR.
•	Database: Không can thiệp cấu trúc, chỉ đọc dữ liệu để in.
•	Phạm vi: Tạo file PDF (PDFKit), Nén Zip (Archiver), Download PNG, Component hiển thị QR Code (react-qr-code).
•	Độc lập: Tự tạo một file mockData.json chứa list 10 bàn giả để căn chỉnh PDF và layout in ấn cho đẹp.
Cấu trúc thư mục (Folder Structure)
Backend (Node.js)
src/
└── modules/
    └── exports/  <-- Khu vực làm việc
        ├── pdf-generator.service.ts (Logic vẽ PDF: Logo, khung, text)
        ├── zip-generator.service.ts (Logic gom nhiều ảnh vào 1 file zip)
        ├── export.controller.ts     (GET /download/pdf, GET /download/zip)
        └── templates/               (Chứa logo.png, font custom nếu có)

Frontend (React)
src/
└── features/
    └── print-tools/  <-- Khu vực làm việc
        ├── components/
        │   ├── QRCodeDisplay.tsx    (Dùng lib 'react-qr-code' render hình)
        │   ├── PrintPreviewModal.tsx(Dùng lib 'react-to-print')
        │   └── DownloadActions.tsx  (Các nút tải PNG, PDF)
        └── utils/
            └── file-saver.ts        (Helper xử lý blob download)


Tổng kết điểm giao nhau (Integration Points)
Dù làm độc lập, nhưng đến cuối cùng các bạn cần ghép lại ở 2 điểm này:
1.	Backend Route: Trong file app.ts (hoặc server.ts), import 3 controller của 3 người:
app.use('/api/tables', TableController); // Người 1
app.use('/api/qr', QrAuthController);    // Người 2
app.use('/api/export', ExportController);// Người 3
2.	Frontend Dashboard:
•	Người 1 (AdminDashboard) sẽ import component QRCodeDisplay và DownloadActions của Người 3 để đặt vào từng dòng của bảng danh sách.
•	Nút "Regenerate" của Người 1 sẽ gọi API của Người 2.
Lời khuyên: Người 1 nên merge code khung dự án (setup server, connect DB) đầu tiên để 2 người kia có môi trường chạy thử (hoặc mock data cục bộ).

