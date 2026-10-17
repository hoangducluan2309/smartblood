import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Tải biến môi trường từ .env
dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '1433', 10);
const dbName = process.env.DB_NAME || 'HienMauDB';
const dbUser = process.env.DB_USER || 'hienmau_app';
const dbPassword = process.env.DB_PASSWORD || '';
const dbEncrypt = process.env.DB_ENCRYPT === 'true';
const dbTrustCert = (process.env.DB_TRUST_SERVER_CERTIFICATE ?? process.env.DB_TRUST_CERT ?? 'true') === 'true';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mssql',
  logging: process.env.NODE_ENV === 'development' ? (msg: string) => console.log(`[Sequelize SQL]: ${msg}`) : false,
  dialectOptions: {
    options: {
      encrypt: dbEncrypt,
      trustServerCertificate: dbTrustCert,
      enableArithAbort: true,
      validateBulkLoadParameters: true,
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

/**
 * Hàm kiểm tra kết nối CSDL và xử lý lỗi an toàn (không lộ mật khẩu)
 */
export async function authenticateDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log(`[Database]: Kết nối thành công đến SQL Server [${dbHost}:${dbPort}/${dbName}] với người dùng [${dbUser}].`);
  } catch (error: unknown) {
    const err = error as Error;
    // Bắt và log thông báo lỗi an toàn, tuyệt đối không in mật khẩu ra console
    console.error(`[Database Error]: Không thể kết nối đến cơ sở dữ liệu MSSQL!`);
    console.error(`[Chi tiết lỗi]: ${err.name} - ${err.message}`);
    throw new Error('Database connection failed.');
  }
}
