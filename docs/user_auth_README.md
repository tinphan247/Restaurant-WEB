Module User & Authentication
1. Giới thiệuModule quản lý người dùng và xác thực tập trung, hỗ trợ đăng nhập truyền thống (Email/Password) và mạng xã hội (Google OAuth2).
2. Luồng xác thực (Authentication Flow)Local: Client gửi email/pass -> Backend kiểm tra bcrypt -> Trả về JWT Access Token.Google: Client redirect tới /auth/google -> Google callback về Backend -> Backend tạo/cập nhật User -> Trả JWT về client (thông qua URL hoặc Cookie).
3. Cấu hình .envBackend (packages/backend/.env)
Đoạn mã
JWT_SECRET=super-secret-key-senior-level
JWT_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
Frontend (packages/frontend/.env)Đoạn mãVITE_API_URL=http://localhost:3000
4. API EndpointsMethodEndpointAccessDescriptionPOST/auth/registerPublic
Đăng ký tài khoảnPOST/auth/loginPublic
Đăng nhập nhận JWTGET/auth/googlePublic
Chuyển hướng tới GoogleGET/users/meUser
Lấy thông tin cá nhânGET/usersAdmin
Danh sách người dùng🚀 Cách chạy module mớiDatabase: Chạy file user.sql sau đó user.seed.sql.Backend: cd packages/backend && npm install && npm run start:dev.Frontend: cd packages/frontend && npm install && npm run dev.Module này được thiết kế theo hướng Decoupled, dễ dàng thay thế TypeORM bằng Prisma hoặc thêm các nhà cung cấp OAuth khác (Facebook, Apple) mà không ảnh hưởng đến logic cốt lõi.