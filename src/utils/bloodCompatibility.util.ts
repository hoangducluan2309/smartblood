/**
 * Tiện ích kiểm tra tính tương thích nhóm máu trong truyền máu khẩn cấp
 * (Tuân thủ chuẩn y khoa quốc tế và Hiệp hội Truyền máu Quốc gia)
 */

// Ma trận tương thích Máu toàn phần / Khối Hồng cầu (ToanPhan / HongCau)
// Thứ tự mảng ưu tiên: Cùng nhóm máu -> Nhóm máu tương thích theo thứ tự ưu tiên
const RED_CELL_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // AB+ nhận được tất cả
};

// Ma trận tương thích Huyết tương (HuyetTuong / Plasma)
const PLASMA_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'A-', 'AB+', 'AB-'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'B-', 'AB+', 'AB-'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+', 'AB-'],
};

/**
 * Lấy danh sách các nhóm máu người cho (Donor) có thể truyền cho người nhận (Recipient)
 * @param recipientBloodType Nhóm máu người nhận (vd: 'A+', 'O-')
 * @param component Thành phần máu ('ToanPhan', 'HongCau', 'HuyetTuong', 'TieuCau')
 * @returns Mảng các nhóm máu tương thích sắp xếp theo mức độ ưu tiên
 */
export function getCompatibleDonorBloodTypes(
  recipientBloodType: string,
  component: string = 'ToanPhan'
): string[] {
  let normalizedType = recipientBloodType.trim().toUpperCase();
  if (!normalizedType.endsWith('+') && !normalizedType.endsWith('-')) {
    normalizedType += '+';
  }

  if (component === 'HuyetTuong') {
    return PLASMA_COMPATIBILITY[normalizedType] || [normalizedType];
  }

  // Mặc định cho Máu toàn phần, Hồng cầu và Tiểu cầu
  return RED_CELL_COMPATIBILITY[normalizedType] || [normalizedType];
}

/**
 * Kiểm tra xem nhóm máu cho có truyền được cho nhóm máu nhận hay không
 */
export function isBloodCompatible(
  donorBloodType: string,
  recipientBloodType: string,
  component: string = 'ToanPhan'
): boolean {
  const compatibleList = getCompatibleDonorBloodTypes(recipientBloodType, component);
  return compatibleList.includes(donorBloodType.trim().toUpperCase());
}
