import { sequelize } from '../config/database.js';
import { emergencyService } from '../services/emergency.service.js';

async function testEmergencyWorkflow() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    // 1. Kiểm tra lấy danh sách công khai
    console.log('\n--- 1. KIỂM TRA LẤY DANH SÁCH CA CẤP CỨU CÔNG KHAI ---');
    const publicList = await emergencyService.layDanhSachYeuCauKhanCapCongKhai();
    console.log(`Số ca cấp cứu trả về từ database: ${publicList.length}`);
    const active = publicList.filter((item: any) => item.trangThai !== 'DaHuy');
    const dismissed = publicList.filter((item: any) => item.trangThai === 'DaHuy');
    console.log(`  - Đang mở (active): ${active.length} ca`);
    console.log(`  - Đã tắt (dismissed): ${dismissed.length} ca`);

    // 2. Kiểm tra tắt thẻ cấp cứu #2
    console.log('\n--- 2. KIỂM TRA TẮT THẺ CẤP CỨU (DISMISS) #2 ---');
    const dismissedItem = await emergencyService.tatYeuCauKhanCap(2, 'Đã nhận đủ máu O- cho bệnh nhân ICU');
    console.log(`Trạng thái sau khi tắt: ${dismissedItem.trangThai}, Lý do: ${dismissedItem.lyDo}`);

    // 3. Kiểm tra khôi phục lại thẻ #2
    console.log('\n--- 3. KIỂM TRA KHÔI PHỤC / MỞ LẠI THẺ CẤP CỨU (RESTORE) #2 ---');
    const restoredItem = await emergencyService.khoiPhucYeuCauKhanCap(2);
    console.log(`Trạng thái sau khi khôi phục: ${restoredItem.trangThai}`);

    // 4. Kiểm tra tạo ca cấp cứu mới
    console.log('\n--- 4. KIỂM TRA TẠO MỚI CA CẤP CỨU (CREATE) ---');
    const newReq = await emergencyService.taoYeuCauKhanCap(1, {
      benhVienYeuCau: 'Bệnh viện Chợ Rẫy (Khu Phẫu Thuật Cấp Cứu)',
      nhomMauCan: 'O+',
      soLuongTui: 2,
      soLuongCanMl: 700,
      mucDoKhanCap: 'NGUY_CAP',
      lyDo: 'Bệnh nhân thử nghiệm tự động - Phẫu thuật lồng ngực khẩn cấp',
      hanChot: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    console.log(`Đã tạo thành công ca cấp cứu ID: ${newReq.id}, Nhóm máu: ${newReq.nhomMauCan}, Trạng thái: ${newReq.trangThai}`);

    // 5. Kiểm tra tắt thẻ cho ca vừa tạo
    console.log(`\n--- 5. KIỂM TRA TẮT THẺ CHO CA VỪA TẠO #${newReq.id} ---`);
    const dismissedNewReq = await emergencyService.tatYeuCauKhanCap(newReq.id, 'Hoàn tất quy trình kiểm thử');
    console.log(`Trạng thái ca #${newReq.id}: ${dismissedNewReq.trangThai}`);

    // Dọn dẹp ca test
    await emergencyService.xoaYeuCauKhanCap(newReq.id);
    console.log(`Đã dọn dẹp ca test #${newReq.id} thành công.`);

    console.log('\n🎉 TOÀN BỘ WORKFLOW TẠO VÀ TẮT THẺ CẤP CỨU TRÊN DATABASE HOÀN TẤT 100%!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

testEmergencyWorkflow();
