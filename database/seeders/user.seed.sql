-- Password: 'password123' (hashed with bcrypt)
INSERT INTO "users" (name, email, password, role, avatar) VALUES
('System Admin', 'admin@restaurant.com', '$2b$10$EpjFEJP8VqHqyvL7.G9Lp.wM6fJ8Gj2pS6p2W1zYyGj2pS6p2W1zY', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'),
('Tin', 'tin@gmail.com', '$2b$10$EpjFEJP8VqHqyvL7.G9Lp.wM6fJ8Gj2pS6p2W1zYyGj2pS6p2W1zY', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
