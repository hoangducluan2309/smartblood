import { sequelize } from '../config/database';

async function main() {
  try {
    const [tables]: any = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);

    for (const t of tables) {
      const tableName = t.TABLE_NAME;
      const [cols]: any = await sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${tableName}' AND DATA_TYPE IN ('nvarchar', 'varchar', 'text', 'ntext')
      `);

      if (cols.length === 0) continue;

      const colNames = cols.map((c: any) => c.COLUMN_NAME).join(', ');
      const [rows]: any = await sequelize.query(`SELECT TOP 20 ${colNames} FROM ${tableName}`);

      const brokenRows: any[] = [];
      for (const row of rows) {
        for (const col of cols) {
          const val = row[col.COLUMN_NAME];
          if (typeof val === 'string' && val.includes('?')) {
            brokenRows.push({ col: col.COLUMN_NAME, val });
          }
        }
      }

      if (brokenRows.length > 0) {
        console.log(`\n❌ BẢNG [${tableName}] CÓ LỖI FONT:`);
        for (const b of brokenRows) {
          console.log(`   - Cột [${b.col}]: "${b.val}"`);
        }
      } else {
        console.log(`✅ Bảng [${tableName}]: Không phát hiện lỗi font`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

main();
