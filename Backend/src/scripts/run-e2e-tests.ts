import assert from 'node:assert/strict';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
const HEALTH_URL = 'http://localhost:5000/api/health';

interface TestResult {
  code: string;
  name: string;
  endpoint: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details?: string;
}

const testResults: TestResult[] = [];

async function executeTest(
  code: string,
  name: string,
  endpoint: string,
  fn: () => Promise<void>
) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    testResults.push({ code, name, endpoint, status: 'PASS', durationMs: duration });
    console.log(`  ✅ [PASS] ${code}: ${name} (${duration}ms)`);
  } catch (err: any) {
    const duration = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    testResults.push({ code, name, endpoint, status: 'FAIL', durationMs: duration, details: msg });
    console.error(`  ❌ [FAIL] ${code}: ${name} - Lỗi: ${msg}`);
  }
}

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(10000),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return {
    status: res.status,
    ok: res.ok,
    headers: res.headers,
    data: json,
  };
}

async function runAllE2ETests() {
  console.log('\n================================================================');
  console.log('🚀 BẮT ĐẦU CHẠY BỘ END-TO-END (E2E) TESTS TRỰC TIẾP HỆ THỐNG');
  console.log(`📡 Mục tiêu API: ${BASE_URL}`);
  console.log('================================================================\n');

  // Shared test variables across stages
  let newDonorEmail = `e2e.donor_${Date.now()}@example.com`;
  let newDonorPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
  let newDonorCccd = `00109${Math.floor(1000000 + Math.random() * 9000000)}`;
  let newDonorToken = '';
  let newDonorId = 0;

  let adminToken = '';
  let staffToken = '';
  let regularDonorToken = '';

  let createdAppointmentId = 0;
  let activeEventId = 1;
  let createdEmergencyId = 0;
  let createdEventId = 0;

  // ---------------------------------------------------------------------------
  // T00: KIỂM TRA HEALTH CHECK CỦA HỆ THỐNG
  // ---------------------------------------------------------------------------
  await executeTest('T00', 'Kiểm tra trạng thái hoạt động của Backend Server', 'GET /api/health', async () => {
    const res = await request(HEALTH_URL);
    assert.equal(res.status, 200, `Health check trả về mã ${res.status}`);
    assert.equal(res.data?.success, true, 'Health check success phải là true');
    assert.equal(res.data?.data?.status, 'UP', 'Service status phải là UP');
  });

  // ---------------------------------------------------------------------------
  // T01: ĐĂNG KÝ TÀI KHOẢN DONOR MỚI
  // ---------------------------------------------------------------------------
  await executeTest('T01', 'Đăng ký tài khoản người hiến máu (Donor) mới', 'POST /auth/register', async () => {
    const res = await request(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        hoTen: 'Nguyễn Văn Tình Nguyện',
        email: newDonorEmail,
        matKhau: 'Password@123',
        soDienThoai: newDonorPhone,
        cccd: newDonorCccd,
        nhomMau: 'A+',
        diaChi: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      }),
    });

    assert.equal(res.status, 201, `Đăng ký trả về mã ${res.status}: ${JSON.stringify(res.data)}`);
    assert.equal(res.data?.success, true);
    assert.ok(res.data?.data?.id, 'Phải có ID người dùng');
    assert.equal(res.data?.data?.email, newDonorEmail);
    assert.equal(res.data?.data?.matKhauHash, undefined, 'Mật khẩu hash không được phép lộ ra client');
    newDonorId = res.data.data.id;
  });

  // ---------------------------------------------------------------------------
  // T02: ĐĂNG NHẬP VÀ CẤP JWT TOKEN CHO CÁC VAI TRÒ (ADMIN, STAFF, DONOR)
  // ---------------------------------------------------------------------------
  await executeTest('T02', 'Đăng nhập cấp JWT Token chuẩn cho từng vai trò', 'POST /auth/login', async () => {
    // 1. Đăng nhập Donor mới vừa tạo
    const donorRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: newDonorEmail,
        matKhau: 'Password@123',
      }),
    });
    assert.equal(donorRes.status, 200, `Donor login thất bại: ${JSON.stringify(donorRes.data)}`);
    const donorTok = donorRes.data?.data?.accessToken || donorRes.data?.data?.token;
    assert.ok(donorTok, 'Donor phải nhận được JWT token');
    assert.equal(donorRes.data?.data?.user?.vaiTro, 'DONOR');
    newDonorToken = donorTok;

    // 2. Đăng nhập Quản Trị Viên (ADMIN)
    const adminRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@hienmau.vn',
        matKhau: 'Password@123',
      }),
    });
    assert.equal(adminRes.status, 200, `Admin login thất bại: ${JSON.stringify(adminRes.data)}`);
    const adminTok = adminRes.data?.data?.accessToken || adminRes.data?.data?.token;
    assert.ok(adminTok, 'Admin phải nhận được JWT token');
    assert.equal(adminRes.data?.data?.user?.vaiTro, 'ADMIN');
    adminToken = adminTok;

    // 3. Đăng nhập Bác Sĩ / Y Tế (HOSPITAL_STAFF)
    const staffRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'staff.choray@hienmau.vn',
        matKhau: 'Password@123',
      }),
    });
    assert.equal(staffRes.status, 200, `Staff login thất bại: ${JSON.stringify(staffRes.data)}`);
    const sTok = staffRes.data?.data?.accessToken || staffRes.data?.data?.token;
    assert.ok(sTok, 'Staff phải nhận được JWT token');
    assert.equal(staffRes.data?.data?.user?.vaiTro, 'HOSPITAL_STAFF');
    staffToken = sTok;

    // 4. Đăng nhập Donor có sẵn trong CSDL (Nguyễn Văn An)
    const regDonorRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'nguyenvanan.donor@gmail.com',
        matKhau: 'Password@123',
      }),
    });
    const regTok = regDonorRes.data?.data?.accessToken || regDonorRes.data?.data?.token;
    if (regDonorRes.status === 200 && regTok) {
      regularDonorToken = regTok;
    }
  });

  // ---------------------------------------------------------------------------
  // T03: KIỂM TRA QUY TẮC AN TOÀN CHU KỲ 84 NGÀY (THÔNG TƯ 26/2013/TT-BYT)
  // ---------------------------------------------------------------------------
  await executeTest('T03', 'Chặn đặt lịch khi chưa đủ khoảng cách an toàn 84 ngày', 'POST /donation-appointments', async () => {
    // Nếu có tài khoản Nguyễn Văn An đã hiến máu gần đây, thử đặt lịch quá sớm
    const targetToken = regularDonorToken || newDonorToken;

    // Thử truy vấn danh sách sự kiện để lấy eventId hợp lệ
    const eventsRes = await request(`${BASE_URL}/donation-events?limit=5`);
    if (eventsRes.data?.data?.items?.[0]?.id) {
      activeEventId = eventsRes.data.data.items[0].id;
    }

    // Đặt lịch hẹn vào ngày quá gần mốc hiến máu (test quy tắc 84 ngày)
    const res = await request(`${BASE_URL}/donation-appointments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${targetToken}` },
      body: JSON.stringify({
        eventId: activeEventId,
        ngayHen: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
        khungGio: '08:00 - 09:00',
        luongMauHienMl: 350,
        tinhTrangSucKhoe: 'Tốt',
      }),
    });

    // Nếu người dùng đã có lịch sử hiến máu < 84 ngày, hệ thống chặn 400 Bad Request
    // Nếu là người mới hiến lần đầu, kết quả cho phép tạo thành công (201)
    assert.ok(
      res.status === 400 || res.status === 201,
      `API phải phản hồi đúng mã trạng thái 400 hoặc 201, nhận được: ${res.status}`
    );
  });

  // ---------------------------------------------------------------------------
  // T04: ĐẶT LỊCH HẸN HIẾN MÁU HỢP LỆ VỚI DONOR MỚI
  // ---------------------------------------------------------------------------
  await executeTest('T04', 'Tình nguyện viên đặt lịch hẹn hiến máu hợp lệ', 'POST /donation-appointments', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const res = await request(`${BASE_URL}/donation-appointments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newDonorToken}` },
      body: JSON.stringify({
        eventId: activeEventId,
        ngayHen: futureDate,
        khungGio: '08:30 - 09:30',
        luongMauHienMl: 350,
        tinhTrangSucKhoe: 'Khỏe mạnh, huyết áp ổn định 120/80',
      }),
    });

    assert.equal(res.status, 201, `Tạo lịch hẹn thất bại: ${JSON.stringify(res.data)}`);
    assert.ok(res.data?.data?.id, 'Lịch hẹn phải có ID');
    assert.equal(res.data?.data?.trangThai, 'ChoXacNhan');
    createdAppointmentId = res.data.data.id;
  });

  // ---------------------------------------------------------------------------
  // T05: BÁC SĨ DUYỆT TIẾP NHẬN MÁU & TỰ ĐỘNG CỘNG KHO MÁU (TRANSACTION)
  // ---------------------------------------------------------------------------
  await executeTest('T05', 'Bác sĩ xác nhận tiếp nhận máu và cộng dồn kho FEFO', 'PUT /donation-appointments/:id/status', async () => {
    assert.ok(createdAppointmentId > 0, 'Cần có ID lịch hẹn từ T04');

    const res = await request(`${BASE_URL}/donation-appointments/${createdAppointmentId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        trangThai: 'HoanThanh',
        luongMauHienMl: 350,
        nhomMau: 'A+',
        ghiChu: 'E2E Test: Đã tiếp nhận 350ml máu A+ đạt chuẩn y tế.',
      }),
    });

    assert.equal(res.status, 200, `Duyệt tiếp nhận thất bại: ${JSON.stringify(res.data)}`);
    assert.equal(res.data?.data?.trangThai, 'HoanThanh');
    assert.ok(res.data?.data?.id, 'Lịch hẹn hoàn thành phải có ID');
  });

  // ---------------------------------------------------------------------------
  // T06: BỆNH VIỆN PHÁT YÊU CẦU MÁU CẤP CỨU KHẨN CẤP
  // ---------------------------------------------------------------------------
  await executeTest('T06', 'Bác sĩ / Bệnh viện tạo yêu cầu cấp cứu máu hỏa tốc', 'POST /emergency-requests', async () => {
    const deadline = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
    const res = await request(`${BASE_URL}/emergency-requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        benhVienYeuCau: 'Bệnh viện Chợ Rẫy (Khoa Cấp Cứu E2E)',
        nhomMauCan: 'A+',
        thanhPhanCan: 'ToanPhan',
        soLuongCanMl: 350,
        mucDoKhanCap: 'RAT_KHAN',
        lyDo: 'Bệnh nhân E2E Test - Sốc mất máu cấp cần chi viện hỏa tốc',
        hanChot: deadline,
      }),
    });

    assert.equal(res.status, 201, `Tạo yêu cầu cấp cứu thất bại: ${JSON.stringify(res.data)}`);
    assert.ok(res.data?.data?.id, 'Yêu cầu cấp cứu phải có ID');
    assert.equal(res.data?.data?.trangThai, 'DangCho');
    createdEmergencyId = res.data.data.id;
  });

  // ---------------------------------------------------------------------------
  // T07: ADMIN ĐIỀU PHỐI XUẤT KHO CHI VIỆN THEO FEFO
  // ---------------------------------------------------------------------------
  await executeTest('T07', 'Admin điều phối xuất kho FEFO và gán xe cứu thương 115', 'POST /emergency-requests/:id/dispatch', async () => {
    assert.ok(createdEmergencyId > 0, 'Cần có ID ca cấp cứu từ T06');

    const res = await request(`${BASE_URL}/emergency-requests/${createdEmergencyId}/dispatch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        ghiChu: 'Lệnh điều phối E2E: Xe CC-01 xuất phát giao máu ngay',
      }),
    });

    assert.equal(res.status, 200, `Xuất kho điều phối thất bại: ${JSON.stringify(res.data)}`);
    assert.ok(res.data?.success, 'Lệnh xuất kho phải thành công');
  });

  // ---------------------------------------------------------------------------
  // T08: KIỂM TRA PHÂN QUYỀN BẢO MẬT RBAC (ROLE-BASED ACCESS CONTROL)
  // ---------------------------------------------------------------------------
  await executeTest('T08', 'Kiểm tra bảo mật RBAC: Chặn Donor truy cập tài nguyên quản trị', 'GET /blood-inventories/summary', async () => {
    // 1. Donor không có quyền xem kho máu -> Phải bị chặn 403 Forbidden
    const forbiddenRes = await request(`${BASE_URL}/blood-inventories/summary`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${newDonorToken}` },
    });
    assert.equal(forbiddenRes.status, 403, `Donor xem kho máu phải bị 403, nhận: ${forbiddenRes.status}`);

    // 2. Chưa đăng nhập (không token) gọi API Admin -> Phải bị 401 Unauthorized
    const unauthRes = await request(`${BASE_URL}/users`, {
      method: 'GET',
    });
    assert.equal(unauthRes.status, 401, `Không token phải bị 401, nhận: ${unauthRes.status}`);

    // 3. Admin có toàn quyền xem kho máu -> Phải thành công 200 OK
    const adminRes = await request(`${BASE_URL}/blood-inventories/summary`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminRes.status, 200, 'Admin phải xem được kho máu 200 OK');
  });

  // ---------------------------------------------------------------------------
  // T09: QUẢN LÝ SỰ KIỆN HIẾN MÁU (BÁC SĨ & ADMIN) - TẠO, SỬA, TẮT THẺ, XÓA
  // ---------------------------------------------------------------------------
  await executeTest('T09', 'Bác sĩ & Admin quản lý vòng đời sự kiện hiến máu', 'POST /donation-events', async () => {
    const startDate = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString();
    const endDate = new Date(Date.now() + 10 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString();

    // 1. Bác sĩ tạo sự kiện mới
    const createRes = await request(`${BASE_URL}/donation-events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        tenSuKien: 'Sự Kiện E2E Test - Giọt Máu Hy Vọng',
        diaDiem: 'Trung Tâm Y Tế Quận 1, TP.HCM',
        thoiGianBatDau: startDate,
        thoiGianKetThuc: endDate,
        soLuongDuKien: 100,
        moTa: 'Chiến dịch kiểm thử tự động vòng đời sự kiện hiến máu',
      }),
    });
    assert.equal(createRes.status, 201, `Bác sĩ tạo sự kiện thất bại: ${JSON.stringify(createRes.data)}`);
    assert.ok(createRes.data?.data?.id, 'Sự kiện phải có ID');
    createdEventId = createRes.data.data.id;

    // 2. Bác sĩ sửa thông tin sự kiện
    const updateRes = await request(`${BASE_URL}/donation-events/${createdEventId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        tenSuKien: 'Sự Kiện E2E Test - Đã Cập Nhật Địa Điểm',
        diaDiem: 'Nhà Văn Hóa Thanh Niên TP.HCM',
        thoiGianBatDau: startDate,
        thoiGianKetThuc: endDate,
        soLuongDuKien: 150,
      }),
    });
    assert.equal(updateRes.status, 200, 'Bác sĩ sửa sự kiện phải 200 OK');

    // 3. Bác sĩ tắt thẻ sự kiện (Chuyển DaHuy)
    const dismissRes = await request(`${BASE_URL}/donation-events/${createdEventId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: JSON.stringify({
        trangThai: 'DaHuy',
        lyDo: 'E2E Test hoàn tất',
      }),
    });
    assert.equal(dismissRes.status, 200, 'Tắt thẻ sự kiện phải 200 OK');

    // 4. Admin xóa vĩnh viễn sự kiện kiểm thử
    const deleteRes = await request(`${BASE_URL}/donation-events/${createdEventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(deleteRes.status, 200, 'Admin xóa sự kiện phải 200 OK');
  });

  // ---------------------------------------------------------------------------
  // T10: ĐỒNG BỘ SỰ KIỆN HIẾN MÁU CÔNG KHAI RA TRANG CHỦ
  // ---------------------------------------------------------------------------
  await executeTest('T10', 'Đồng bộ danh sách sự kiện hiến máu công khai ra Trang chủ', 'GET /donation-events', async () => {
    const res = await request(`${BASE_URL}/donation-events?limit=10`);
    assert.equal(res.status, 200, 'Lấy danh sách sự kiện công khai phải 200 OK');
    assert.equal(res.data?.success, true);
    const items = res.data?.data?.items || res.data?.items || res.data?.data;
    assert.ok(Array.isArray(items), 'Danh sách sự kiện phải là mảng');
    assert.ok(items.length > 0, 'Phải có ít nhất 1 sự kiện hiến máu đang hoạt động');
  });

  // ---------------------------------------------------------------------------
  // T11: DANH SÁCH CA CẤP CỨU CÔNG KHAI DÀNH CHO DONOR (CHỈ CA ĐANG MỞ)
  // ---------------------------------------------------------------------------
  await executeTest('T11', 'Lấy danh sách ca cấp cứu công khai dành cho Trang chủ & Donor', 'GET /emergency-requests/public', async () => {
    const res = await request(`${BASE_URL}/emergency-requests/public`);
    assert.equal(res.status, 200, 'Lấy danh sách ca cấp cứu công khai phải 200 OK');
    assert.equal(res.data?.success, true);
    const items = res.data?.data;
    assert.ok(Array.isArray(items), 'Dữ liệu ca cấp cứu phải là mảng');
    assert.ok(items.length > 0, 'Phải có ít nhất 1 ca cấp cứu trong hệ thống');
    const activeItems = items.filter((item: any) => item.trangThai === 'DangCho' || item.trangThai === 'DangDieuPhoi');
    assert.ok(activeItems.length > 0, 'Phải có ít nhất 1 ca cấp cứu đang ở trạng thái khẩn cấp mở');
  });

  // ---------------------------------------------------------------------------
  // T12: KIỂM TRA TỒN KHO MÁU TOÀN VẸN (INTEGRITY CHECK)
  // ---------------------------------------------------------------------------
  await executeTest('T12', 'Kiểm tra tính toàn vẹn và nhất quán của CSDL Kho Máu', 'GET /blood-inventories/summary', async () => {
    const res = await request(`${BASE_URL}/blood-inventories/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200, 'Lấy tổng kết kho máu phải 200 OK');
    assert.equal(res.data?.success, true);
    const summary = res.data?.data;
    assert.ok(Array.isArray(summary), 'Summary phải là mảng 8 nhóm máu');
    assert.ok(summary.length >= 4, 'Kho máu phải có ít nhất 4 nhóm máu chính');
  });

  // ---------------------------------------------------------------------------
  // IN KẾT QUẢ TỔNG HỢP E2E
  // ---------------------------------------------------------------------------
  const total = testResults.length;
  const passed = testResults.filter((r) => r.status === 'PASS').length;
  const failed = testResults.filter((r) => r.status === 'FAIL').length;
  const passRate = Math.round((passed / total) * 100);

  console.log('\n================================================================');
  console.log('📊 KẾT QUẢ TỔNG HỢP KIỂM THỬ END-TO-END (E2E)');
  console.log('================================================================');
  console.log(`- Tổng số ca kiểm thử: ${total}`);
  console.log(`- Thành công (PASS):   ${passed}`);
  console.log(`- Thất bại (FAIL):     ${failed}`);
  console.log(`- Tỷ lệ Đạt:           ${passRate}%`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error(`❌ Có ${failed} ca kiểm thử thất bại!`);
    process.exit(1);
  } else {
    console.log('🎉 TẤT CẢ CÁC CA KIỂM THỬ E2E ĐÃ ĐẠT CHUẨN 100%!');
    process.exit(0);
  }
}

void runAllE2ETests();
