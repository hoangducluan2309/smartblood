import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Đã kết nối thành công đến SQL Server [HienMauDB]');

    const sqlPath = path.resolve(__dirname, '../../sql/05-emergency-requests.sql');
    const fullSql = fs.readFileSync(sqlPath, 'utf8');

    // Tách các lệnh theo batch GO
    const batches = fullSql
      .split(/^\s*GO\s*$/gim)
      .map((b) => b.trim())
      .filter((b) => b.length > 0 && !b.startsWith('USE '));

    console.log(`Bắt đầu thực thi ${batches.length} khối SQL batch...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (batch) {
        await sequelize.query(batch);
        console.log(`  -> Thực thi thành công batch ${i + 1}/${batches.length}`);
      }
    }

    console.log('\n=== KIỂM TRA BẢN GHI TRONG dbo.YeuCauMauKhanCap ===');
    const [rows] = await sequelize.query(`
      SELECT 
        id, 
        benh_vien_yeu_cau, 
        nhom_mau_can, 
        so_luong_can_ml, 
        muc_do_khan_cap, 
        trang_thai, 
        ly_do 
      FROM dbo.YeuCauMauKhanCap 
      ORDER BY id ASC
    `);
    console.table(rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi thực thi SQL:', err);
    process.exit(1);
  }
}

run();
