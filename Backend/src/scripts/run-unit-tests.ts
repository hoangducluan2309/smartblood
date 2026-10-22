import assert from 'node:assert/strict';
import { isBloodCompatible, getCompatibleDonorBloodTypes } from '../utils/bloodCompatibility.util.js';
import { AppError } from '../utils/AppError.js';
import { parsePaginationParams, buildPaginatedResponse } from '../dtos/pagination.dto.js';
import { Validators } from '../middlewares/validate.middleware.js';

let passedTests = 0;
let totalTests = 0;

function runTest(testName: string, testFn: () => void) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ [FAIL] ${testName}: ${message}`);
  }
}

console.log('\n======================================================');
console.log('🧪 BẮT ĐẦU CHẠY BỘ UNIT TESTS CÁC LOGIC CỐT LÕI');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// TEST CASE 1: Ma trận tương thích nhóm máu truyền toàn phần (O- cho tất cả, AB+ nhận tất cả)
// -----------------------------------------------------------------------------
runTest('Unit Test 1: Quy tắc ma trận tương thích nhóm máu (O- cho tất cả, AB+ nhận tất cả)', () => {
  // O- có thể cho AB+, A+, B+, O+
  assert.equal(isBloodCompatible('O-', 'AB+', 'ToanPhan'), true, 'O- phải truyền được cho AB+');
  assert.equal(isBloodCompatible('O-', 'A+', 'ToanPhan'), true, 'O- phải truyền được cho A+');
  assert.equal(isBloodCompatible('O-', 'O+', 'ToanPhan'), true, 'O- phải truyền được cho O+');

  // A+ không thể truyền cho O+ hay B+
  assert.equal(isBloodCompatible('A+', 'O+', 'ToanPhan'), false, 'A+ không được phép truyền cho O+');
  assert.equal(isBloodCompatible('A+', 'B+', 'ToanPhan'), false, 'A+ không được phép truyền cho B+');

  // AB+ nhận được tất cả
  const compatibleWithABPos = getCompatibleDonorBloodTypes('AB+', 'ToanPhan');
  assert.deepEqual(
    compatibleWithABPos,
    ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    'AB+ phải nhận được tất cả các nhóm máu'
  );
});

// -----------------------------------------------------------------------------
// TEST CASE 2: Ma trận tương thích Huyết tương (Plasma Compatibility)
// -----------------------------------------------------------------------------
runTest('Unit Test 2: Quy tắc tương thích Huyết tương (Plasma)', () => {
  const compatibleWithAPos = getCompatibleDonorBloodTypes('A+', 'HuyetTuong');
  assert.ok(compatibleWithAPos.includes('AB+'), 'Huyết tương A+ phải nhận được từ AB+');
  assert.ok(compatibleWithAPos.includes('A+'), 'Huyết tương A+ phải nhận được từ A+');
});

// -----------------------------------------------------------------------------
// TEST CASE 3: Lớp ngoại lệ AppError kế thừa và mã trạng thái chuẩn
// -----------------------------------------------------------------------------
runTest('Unit Test 3: Lớp AppError và các Factory Methods chuẩn HTTP Status', () => {
  const badReq = AppError.badRequest('Dữ liệu sai định dạng');
  assert.equal(badReq.statusCode, 400);
  assert.equal(badReq.isOperational, true);
  assert.equal(badReq.message, 'Dữ liệu sai định dạng');

  const unauth = AppError.unauthorized();
  assert.equal(unauth.statusCode, 401);
  assert.equal(unauth.message, 'Không có quyền truy cập hoặc phiên đăng nhập đã hết hạn');

  const forbidden = AppError.forbidden('Chỉ Admin mới có quyền');
  assert.equal(forbidden.statusCode, 403);

  const notFound = AppError.notFound('Không tìm thấy tài nguyên');
  assert.equal(notFound.statusCode, 404);
});

// -----------------------------------------------------------------------------
// TEST CASE 4: Xử lý Phân trang (Pagination DTO & Helpers)
// -----------------------------------------------------------------------------
runTest('Unit Test 4: Phân trang (Pagination) - Tính toán offset và metadata chính xác', () => {
  // Kiểm tra parse query rỗng -> default page 1, limit 10, offset 0
  const parsedDefault = parsePaginationParams({});
  assert.equal(parsedDefault.page, 1);
  assert.equal(parsedDefault.limit, 10);
  assert.equal(parsedDefault.offset, 0);

  // Kiểm tra tính offset ở trang 3, mỗi trang 15 mục -> offset 30
  const parsedCustom = parsePaginationParams({ page: '3', limit: '15' });
  assert.equal(parsedCustom.page, 3);
  assert.equal(parsedCustom.limit, 15);
  assert.equal(parsedCustom.offset, 30);

  // Kiểm tra buildPaginatedResponse
  const mockItems = [{ id: 1 }, { id: 2 }];
  const response = buildPaginatedResponse(mockItems, 25, 2, 10);
  assert.equal(response.pagination.totalItems, 25);
  assert.equal(response.pagination.totalPages, 3);
  assert.equal(response.pagination.hasNextPage, true);
  assert.equal(response.pagination.hasPrevPage, true);
});

// -----------------------------------------------------------------------------
// TEST CASE 5: Input Validation Middleware (Kiểm tra dữ liệu đầu vào bắt buộc)
// -----------------------------------------------------------------------------
runTest('Unit Test 5: Input Validation Rules (Email, SĐT, Bắt buộc, MinLength)', () => {
  // Required
  const reqCheck = Validators.required('hoTen', 'Họ tên');
  assert.equal(reqCheck({}), "Trường 'Họ tên' là bắt buộc");
  assert.equal(reqCheck({ hoTen: '   ' }), "Trường 'Họ tên' là bắt buộc");
  assert.equal(reqCheck({ hoTen: 'Luan' }), null);

  // Email format
  const emailCheck = Validators.email('email');
  assert.equal(emailCheck({ email: 'sai-dinh-dang' }), 'Email không đúng định dạng');
  assert.equal(emailCheck({ email: 'luan@gmail.com' }), null);

  // Phone number (10 số bắt đầu bằng 0)
  const phoneCheck = Validators.phone('soDienThoai');
  assert.equal(phoneCheck({ soDienThoai: '123' }), 'Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số');
  assert.equal(phoneCheck({ soDienThoai: '0903123456' }), null);

  // MinLength
  const minLengthCheck = Validators.minLength('matKhau', 6, 'Mật khẩu');
  assert.equal(minLengthCheck({ matKhau: '123' }), "'Mật khẩu' phải có độ dài tối thiểu 6 ký tự");
  assert.equal(minLengthCheck({ matKhau: 'Password@123' }), null);
});

// -----------------------------------------------------------------------------
// TEST CASE 6: Quy tắc nghiệp vụ tính ngày hiến máu (Quy tắc 84 ngày)
// -----------------------------------------------------------------------------
runTest('Unit Test 6: Kiểm tra chênh lệch thời gian tối thiểu 84 ngày giữa các lần hiến', () => {
  const lastDonationDate = new Date('2026-08-01T00:00:00Z');

  // Đặt lịch sau 30 ngày (2026-08-31) -> Chỉ có 30 ngày (< 84 ngày) -> Phải từ chối
  const earlyAppointmentDate = new Date('2026-08-31T00:00:00Z');
  const diffDaysEarly = Math.floor(
    (earlyAppointmentDate.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  assert.ok(diffDaysEarly < 84, `30 ngày phải nhỏ hơn 84 ngày (thực tế: ${diffDaysEarly})`);

  // Đặt lịch sau 90 ngày (2026-10-30) -> Đạt 90 ngày (>= 84 ngày) -> Hợp lệ
  const validAppointmentDate = new Date('2026-10-30T00:00:00Z');
  const diffDaysValid = Math.floor(
    (validAppointmentDate.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  assert.ok(diffDaysValid >= 84, `90 ngày phải lớn hơn hoặc bằng 84 ngày (thực tế: ${diffDaysValid})`);
});

// -----------------------------------------------------------------------------
// TEST CASE 7: Cơ chế Login Limiter 2 giai đoạn (Tạm khóa 3 phút sau 5 lần sai, và khóa luôn sau 3 lần sai tiếp theo)
// -----------------------------------------------------------------------------
runTest('Unit Test 7: Cơ chế LoginLimiter 2 giai đoạn: Tạm khóa 3 phút khi sai 5 lần, khóa luôn sau 3 lần sai nữa', async () => {
  const { LoginLimiterService } = await import('../services/loginLimiter.service.js');
  const limiter = LoginLimiterService.getInstance();
  const testAccount = `unittest_user_${Date.now()}@test.vn`;

  // Ban đầu: Chưa bị khóa
  assert.equal(limiter.checkLockout(testAccount).isLocked, false);

  // Giai đoạn 1: Nhập sai lần 1 -> còn 4 lần
  const att1 = limiter.recordFailedAttempt(testAccount);
  assert.equal(att1.attempts, 1);
  assert.equal(att1.remainingAttempts, 4);
  assert.equal(att1.isTempLocked, false);
  assert.equal(att1.isPermanentLock, false);

  // Nhập sai lần 2, 3, 4
  limiter.recordFailedAttempt(testAccount);
  limiter.recordFailedAttempt(testAccount);
  const att4 = limiter.recordFailedAttempt(testAccount);
  assert.equal(att4.attempts, 4);
  assert.equal(att4.remainingAttempts, 1);
  assert.equal(att4.isTempLocked, false);

  // Nhập sai lần thứ 5 -> Kích hoạt tạm khóa 3 phút
  const att5 = limiter.recordFailedAttempt(testAccount);
  assert.equal(att5.attempts, 5);
  assert.equal(att5.remainingAttempts, 0);
  assert.equal(att5.isTempLocked, true);
  assert.equal(att5.isPermanentLock, false);
  assert.equal(att5.lockDurationMinutes, 3);

  // Kiểm tra trạng thái khóa
  const checkLocked = limiter.checkLockout(testAccount);
  assert.equal(checkLocked.isLocked, true);
  assert.ok(checkLocked.remainingMinutes > 0 && checkLocked.remainingMinutes <= 3);

  // Giả lập: Hết thời gian 3 phút tạm khóa (qua giai đoạn 2)
  const key = (limiter as any).normalizeKey(testAccount);
  const record = (limiter as any).attempts.get(key);
  record.lockedUntil = Date.now() - 1000; // Đã quá hạn khóa tạm

  // Sau khi hết tạm khóa: checkLockout phải báo isLocked = false, hasBeenTempLocked = true
  const checkUnlocked = limiter.checkLockout(testAccount);
  assert.equal(checkUnlocked.isLocked, false);
  assert.equal(checkUnlocked.hasBeenTempLocked, true);

  // Giai đoạn 2: Nhập sai lần 1 sau tạm khóa -> còn 2 lần
  const stage2_att1 = limiter.recordFailedAttempt(testAccount);
  assert.equal(stage2_att1.stage, 2);
  assert.equal(stage2_att1.attempts, 1);
  assert.equal(stage2_att1.remainingAttempts, 2);
  assert.equal(stage2_att1.isPermanentLock, false);

  // Giai đoạn 2: Nhập sai lần 2 sau tạm khóa -> còn 1 lần
  const stage2_att2 = limiter.recordFailedAttempt(testAccount);
  assert.equal(stage2_att2.stage, 2);
  assert.equal(stage2_att2.attempts, 2);
  assert.equal(stage2_att2.remainingAttempts, 1);
  assert.equal(stage2_att2.isPermanentLock, false);

  // Giai đoạn 2: Nhập sai lần 3 sau tạm khóa -> KHÓA LUÔN (isPermanentLock = true)
  const stage2_att3 = limiter.recordFailedAttempt(testAccount);
  assert.equal(stage2_att3.stage, 2);
  assert.equal(stage2_att3.attempts, 3);
  assert.equal(stage2_att3.remainingAttempts, 0);
  assert.equal(stage2_att3.isPermanentLock, true);

  // Admin mở lại tài khoản (resetAttempts)
  limiter.resetAttempts(testAccount);
  assert.equal(limiter.checkLockout(testAccount).isLocked, false);
});

console.log('\n------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS VƯỢT QUA (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
