-- ==============================================================================
-- 03-app-user.sql
-- Tạo Login & Database User chuyên dụng cho ứng dụng (thay thế tài khoản sa)
-- ==============================================================================

USE master;
GO

-- 1. Đảm bảo Database HienMauDB đã tồn tại trước khi tạo Database User
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HienMauDB')
BEGIN
    CREATE DATABASE HienMauDB;
    PRINT 'Da tu dong tao CSDL HienMauDB.';
END
GO

-- 2. Tạo hoặc cập nhật Server Login hienmau_app
-- Mẹo: Đặt CHECK_POLICY = OFF để tránh bị lỗi độ phức tạp mật khẩu của Windows trên máy cá nhân
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'hienmau_app')
BEGIN
    CREATE LOGIN hienmau_app 
    WITH PASSWORD = N'HienMau@2026!',
         CHECK_EXPIRATION = OFF,
         CHECK_POLICY = OFF;
    PRINT 'Da tao moi Login: hienmau_app (Mat khau: HienMau@2026!)';
END
ELSE
BEGIN
    -- Nếu login đã có sẵn, cập nhật lại mật khẩu để đồng bộ với .env
    ALTER LOGIN hienmau_app WITH PASSWORD = N'HienMau@2026!', CHECK_POLICY = OFF;
    PRINT 'Login hienmau_app da ton tai san. Da cap nhat lai mat khau thanh cong.';
END
GO

USE HienMauDB;
GO

-- 3. Tạo Database User liên kết với Login trong CSDL HienMauDB
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'hienmau_app')
BEGIN
    CREATE USER hienmau_app FOR LOGIN hienmau_app;
    PRINT 'Da tao Database User: hienmau_app trong HienMauDB';
END
GO

-- 4. Cấp quyền Đọc / Ghi và Thực thi (Least Privilege Principle)
ALTER ROLE db_datareader ADD MEMBER hienmau_app;
ALTER ROLE db_datawriter ADD MEMBER hienmau_app;

-- Cấp quyền DDL cơ bản nếu dùng Sequelize sync (tùy chọn)
GRANT CREATE TABLE TO hienmau_app;
GRANT EXECUTE TO hienmau_app;
GO

PRINT 'Cap quyen thanh cong cho user hienmau_app tren CSDL HienMauDB.';
GO
