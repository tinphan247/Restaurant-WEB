# Hướng Dẫn Deploy Full Stack (Restaurant-WEB) lên Vercel & Neon Database

Tài liệu này hướng dẫn chi tiết từ A-Z cách đưa dự án lên môi trường internet miễn phí.

## Phần 1: Tạo Database Online (PostgreSQL)
Chúng ta sẽ dùng **Neon.tech** (Miễn phí, nhanh, dễ dùng).

1.  Truy cập [https://neon.tech](https://neon.tech) và đăng ký tài khoản (Sign up).
2.  Tạo một Project mới:
    *   **Name**: `restaurant-db`
    *   **Postgres version**: 16 (hoặc mới nhất).
    *   **Region**: Singapore (cho gần Việt Nam).
3.  Sau khi tạo xong, Neon sẽ hiện ra **Connection String**. Hãy copy các thông số riêng lẻ hoặc chuỗi kết nối. Bạn cần lưu lại các thông tin sau:
    *   **Host**: (Ví dụ: `ep-shiny-...aws.neon.tech`)
    *   **Database Name**: `neondb`
    *   **User**: (Ví dụ: `neondb_owner`)
    *   **Password**: (Chuỗi ký tự ngẫu nhiên)
    *   **Port**: `5432`

## Phần 2: Đẩy Code lên GitHub
Vercel cần lấy code từ GitHub để deploy.

1.  Tạo một Repository mới trên GitHub (đặt tên `restaurant-web`).
2.  Mở Terminal tại thư mục gốc dự án trên máy tính và chạy các lệnh sau:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for deployment"
    git branch -M main
    git remote add origin https://github.com/<USERNAME_CUA_BAN>/restaurant-web.git
    git push -u origin main
    ```

## Phần 3: Deploy Backend lên Vercel

1.  Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2.  Bấm **Add New...** -> **Project**.
3.  Chọn repo `restaurant-web` bạn vừa đẩy lên -> **Import**.
4.  **Cấu hình Project Backend**:
    *   **Project Name**: `restaurant-backend`
    *   **Root Directory**: Bấm **Edit** -> Chọn `packages/backend`.
    *   **Framework Preset**: Để mặc định (Other).
    *   **Environment Variables** (Mở rộng phần này và điền thông tin từ Neon DB):
        *   `DATABASE_HOST`: (Host lấy từ Neon)
        *   `DATABASE_PORT`: `5432`
        *   `DATABASE_USERNAME`: (User lấy từ Neon)
        *   `DATABASE_PASSWORD`: (Password lấy từ Neon)
        *   `DATABASE_NAME`: `neondb` (hoặc tên DB trên Neon)
        *   `DATABASE_SSL`: `true` (Quan trọng để kết nối Neon)
        *   `JWT_SECRET`: (Điền một chuỗi bí mật bất kỳ)
5.  Bấm **Deploy**.
6.  Chờ deploy xong (màn hình xanh chúc mừng). Bấm vào **Continue to Dashboard**.
7.  Copy **Domain** của Backend (Ví dụ: `https://restaurant-backend.vercel.app`).
    *   *Test thử*: Truy cập `https://restaurant-backend.vercel.app/api` -> Nếu thấy lỗi 404 hoặc JSON gì đó là server đã chạy.

## Phần 4: Deploy Frontend lên Vercel

1.  Quay lại Dashboard Vercel -> **Add New...** -> **Project**.
2.  Chọn lại repo `restaurant-web` lần nữa -> **Import**.
3.  **Cấu hình Project Frontend**:
    *   **Project Name**: `restaurant-frontend`
    *   **Root Directory**: Bấm **Edit** -> Chọn `packages/frontend`.
    *   **Framework Preset**: Chọn **Vite**.
    *   **Environment Variables**:
        *   `VITE_API_URL`: Dán domain backend vừa copy ở trên (Ví dụ: `https://restaurant-backend.vercel.app`).
        *   **Lưu ý**: KHÔNG có dấu `/` ở cuối link.
4.  Bấm **Deploy**.
5.  Chờ deploy xong. Bấm vào domain để xem thành quả!

## Phần 5: Kiểm tra & Debug
*   Nếu vào web thấy lỗi, hãy mở F12 (Developer Tools) -> Tab **Network** để xem lỗi gọi API.
*   Nếu API lỗi, vào Dashboard Vercel của Backend -> Tab **Logs** để xem chi tiết lỗi server.
