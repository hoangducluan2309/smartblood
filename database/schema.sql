-- =======================================================================
-- SMARTBLOOD DATABASE SCHEMA (Microsoft SQL Server 2014 / 2019)
-- Hệ thống điều phối hiến máu nhân đạo và dự báo nhu cầu máu khẩn cấp
-- =======================================================================

-- Tạo cơ sở dữ liệu nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SmartBloodDB')
BEGIN
    CREATE DATABASE SmartBloodDB;
END
GO

USE SmartBloodDB;
GO

-- 1. BẢNG USERS (Người dùng chung cho cả 3 vai trò: donor, hospital, admin)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(150) NOT NULL,
        Email VARCHAR(120) NOT NULL UNIQUE,
        PasswordHash VARCHAR(255) NOT NULL,
        PhoneNumber VARCHAR(20) NOT NULL,
        Role VARCHAR(20) NOT NULL CHECK (Role IN ('donor', 'hospital', 'admin')),
        AvatarUrl NVARCHAR(500) NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- 2. BẢNG DONORS (Hồ sơ người hiến máu chi tiết)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Donors')
BEGIN
    CREATE TABLE Donors (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
        CitizenId VARCHAR(20) NOT NULL UNIQUE, -- CCCD / Định danh
        BloodGroup VARCHAR(5) NOT NULL CHECK (BloodGroup IN ('A', 'B', 'AB', 'O')),
        RhFactor VARCHAR(5) NOT NULL CHECK (RhFactor IN ('+', '-')), -- '+' hoặc '-'
        IsRareBlood BIT DEFAULT 0, -- Tự động xác định nếu Rh- hoặc nhóm đặc thù
        Gender NVARCHAR(10) NOT NULL CHECK (Gender IN (N'Nam', N'Nữ', N'Khác')),
        DateOfBirth DATE NOT NULL,
        WeightKg DECIMAL(5,2) NOT NULL,
        Address NVARCHAR(300) NOT NULL,
        Latitude DECIMAL(9,6) NULL, -- Vị trí GPS hiện tại (kết hợp lưu Redis GEO)
        Longitude DECIMAL(9,6) NULL,
        TotalDonations INT DEFAULT 0, -- Số lần hiến máu
        LastDonationDate DATE NULL, -- Ngày hiến máu gần nhất (kiểm tra sau 84 ngày / 12 tuần)
        NextEligibleDate DATE NULL,
        QrCodeToken VARCHAR(255) NOT NULL UNIQUE, -- Token tạo mã QR cho nhân viên quét
        IsReadyToDonate BIT DEFAULT 1 -- Trạng thái bật/tắt nhận thông báo khẩn cấp
    );
END
GO

-- 3. BẢNG HOSPITALS (Bệnh viện / Ngân hàng máu)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Hospitals')
BEGIN
    CREATE TABLE Hospitals (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
        HospitalName NVARCHAR(250) NOT NULL,
        HospitalCode VARCHAR(50) NOT NULL UNIQUE,
        Address NVARCHAR(300) NOT NULL,
        Hotline VARCHAR(20) NOT NULL,
        Latitude DECIMAL(9,6) NOT NULL,
        Longitude DECIMAL(9,6) NOT NULL,
        IsVerified BIT DEFAULT 1
    );
END
GO

-- 4. BẢNG BLOOD_INVENTORIES (Kho dự trữ máu từng bệnh viện)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BloodInventories')
BEGIN
    CREATE TABLE BloodInventories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        HospitalId INT NOT NULL FOREIGN KEY REFERENCES Hospitals(Id) ON DELETE CASCADE,
        BloodType VARCHAR(10) NOT NULL, -- A+, A-, B+, B-, AB+, AB-, O+, O-
        UnitsInStock INT DEFAULT 0, -- Số đơn vị máu túi 250ml/350ml hiện có
        SafeThreshold INT DEFAULT 50, -- Ngưỡng an toàn tối thiểu
        Status VARCHAR(20) DEFAULT 'SAFE' CHECK (Status IN ('SAFE', 'WARNING', 'CRITICAL')),
        LastUpdated DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT UQ_Hospital_BloodType UNIQUE (HospitalId, BloodType)
    );
END
GO

-- 5. BẢNG DONATION_EVENTS (Các đợt hiến máu nhân đạo)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DonationEvents')
BEGIN
    CREATE TABLE DonationEvents (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        HospitalId INT NOT NULL FOREIGN KEY REFERENCES Hospitals(Id),
        Title NVARCHAR(250) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Address NVARCHAR(300) NOT NULL,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        TargetUnits INT NOT NULL DEFAULT 100,
        RegisteredCount INT NOT NULL DEFAULT 0,
        CollectedUnits INT NOT NULL DEFAULT 0,
        Status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (Status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- 6. BẢNG DONATION_REGISTRATIONS (Đăng ký hiến máu theo đợt)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DonationRegistrations')
BEGIN
    CREATE TABLE DonationRegistrations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EventId INT NOT NULL FOREIGN KEY REFERENCES DonationEvents(Id),
        DonorId INT NOT NULL FOREIGN KEY REFERENCES Donors(Id),
        PreferredTimeSlot NVARCHAR(50) NOT NULL,
        Status VARCHAR(20) DEFAULT 'REGISTERED' CHECK (Status IN ('REGISTERED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED')),
        RegistrationDate DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- 7. BẢNG DONATION_HISTORIES (Lịch sử hiến máu đã hoàn thành và nhập đơn vị máu)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DonationHistories')
BEGIN
    CREATE TABLE DonationHistories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        DonorId INT NOT NULL FOREIGN KEY REFERENCES Donors(Id),
        HospitalId INT NOT NULL FOREIGN KEY REFERENCES Hospitals(Id),
        EventId INT NULL FOREIGN KEY REFERENCES DonationEvents(Id),
        DonationDate DATETIME2 DEFAULT GETDATE(),
        BloodType VARCHAR(10) NOT NULL,
        VolumeMl INT NOT NULL CHECK (VolumeMl IN (250, 350, 450)),
        CertificateCode VARCHAR(100) NOT NULL UNIQUE, -- Mã chứng nhận hiến máu
        StaffNote NVARCHAR(500) NULL,
        StaffUserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id) -- Nhân viên y tế quét & nhập
    );
END
GO

-- 8. BẢNG URGENT_REQUESTS (Yêu cầu máu khẩn cấp thời gian thực)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UrgentRequests')
BEGIN
    CREATE TABLE UrgentRequests (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        HospitalId INT NOT NULL FOREIGN KEY REFERENCES Hospitals(Id),
        BloodType VARCHAR(10) NOT NULL,
        RequiredUnits INT NOT NULL,
        FulfilledUnits INT DEFAULT 0,
        UrgencyLevel VARCHAR(20) DEFAULT 'HIGH' CHECK (UrgencyLevel IN ('CRITICAL', 'HIGH', 'MEDIUM')),
        PatientCondition NVARCHAR(300) NOT NULL,
        Deadline DATETIME2 NOT NULL,
        Status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (Status IN ('ACTIVE', 'FULFILLED', 'EXPIRED')),
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END
GO

PRINT N'Cơ sở dữ liệu SmartBloodDB đã được khởi tạo thành công!';
