import { sequelize, authenticateDatabase } from '../config/database.js';

async function checkConnection(): Promise<void> {
  console.log('--- Đang kiểm tra kết nối CSDL SQL Server (MSSQL)... ---');
  try {
    await authenticateDatabase();

    // Thực thi câu truy vấn kiểm tra phiên bản SQL Server
    const [result] = await sequelize.query('SELECT @@VERSION AS sql_version, DB_NAME() AS current_db');
    console.log('[Database Info]:', result[0]);
    console.log('--- Kiểm tra kết nối CSDL thành công 100%! ---');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('--- Kiểm tra kết nối CSDL THẤT BẠI! ---');
    console.error('Vui lòng kiểm tra lại:');
    console.error('1. SQL Server Service (MSSQLSERVER/SQLEXPRESS) và TCP/IP port 1433 đã được bật.');
    console.error('2. File .env đã có đúng DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.');
    console.error('3. User hienmau_app đã được tạo bằng script sql/03-app-user.sql.');

    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

checkConnection();
