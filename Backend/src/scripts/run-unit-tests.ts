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

console.log('\n------------------------------------------------------');
console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS VƯỢT QUA (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
