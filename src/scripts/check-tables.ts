import { sequelize, authenticateDatabase } from '../config/database.js';

async function checkAllTables() {
  await authenticateDatabase();
  console.log('\n=== DANH SÁCH BẢNG TRONG HienMauDB ===');
  
  const [tables] = await sequelize.query(`
    SELECT TABLE_NAME, 
           (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = t.TABLE_NAME) as col_count
    FROM INFORMATION_SCHEMA.TABLES t 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `);
  
  console.table(tables);

  console.log('\n=== SỐ LƯỢNG BẢN GHI TRONG MỖI BẢNG ===');
  for (const t of tables as any[]) {
    try {
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM [dbo].[${t.TABLE_NAME}]`);
      const total = (countResult[0] as any).total;
      console.log(`- ${t.TABLE_NAME}: ${total} bản ghi`);
    } catch (err: any) {
      console.log(`- ${t.TABLE_NAME}: Lỗi đọc (${err.message})`);
    }
  }

  await sequelize.close();
}

checkAllTables().catch(console.error);
