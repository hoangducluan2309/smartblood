import { sequelize, authenticateDatabase } from '../config/database.js';

async function checkCccd() {
  await authenticateDatabase();
  await sequelize.query(`DELETE FROM dbo.NguoiDung WHERE email = 'test.user.api@gmail.com'`);
  const [rows] = await sequelize.query(`SELECT id, email, cccd FROM dbo.NguoiDung`);
  console.log('--- DANH SÁCH CCCD TRONG CSDL (SAU DỌN DẸP) ---');
  console.table(rows);
  await sequelize.close();
}

checkCccd();
