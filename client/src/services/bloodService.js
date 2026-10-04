/**
 * Blood Service - Tầng dịch vụ kết nối dữ liệu (Service Layer)
 * -------------------------------------------------------------
 * Hiện tại đang dùng Mock Data để dựng giao diện chuẩn.
 * Khi bạn cùng nhóm hoàn thiện Backend API (Node.js/Express):
 * -> Chỉ cần đổi cờ USE_MOCK = false hoặc thay thế hàm bên dưới bằng axios/fetch.
 */

import { MOCK_BLOOD_INVENTORY } from '../mock/bloodInventory.mock';
import { MOCK_URGENT_REQUESTS } from '../mock/urgentRequests.mock';
import { MOCK_STATS } from '../mock/stats.mock';
import { MOCK_DONATION_EVENTS, MOCK_DONOR_PROFILE } from '../mock/events.mock';
import { MOCK_ELIGIBILITY_CRITERIA, MOCK_FAQS } from '../mock/faq.mock';

const USE_MOCK = true;
const API_BASE_URL = 'http://localhost:5000/api';

// Giả lập độ trễ mạng nhẹ (300ms) để hiển thị mượt mà state loading nếu cần
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const bloodService = {
  /**
   * Lấy tình trạng kho máu 8 nhóm máu (A, B, AB, O với Rh+/-)
   */
  async getBloodInventory() {
    if (USE_MOCK) {
      await delay();
      return [...MOCK_BLOOD_INVENTORY];
    }
    const res = await fetch(`${API_BASE_URL}/inventory`);
    return await res.json();
  },

  /**
   * Lấy danh sách các yêu cầu máu khẩn cấp thời gian thực
   */
  async getUrgentRequests() {
    if (USE_MOCK) {
      await delay();
      return [...MOCK_URGENT_REQUESTS];
    }
    const res = await fetch(`${API_BASE_URL}/urgent-requests`);
    return await res.json();
  },

  /**
   * Lấy số liệu thống kê hệ thống
   */
  async getSystemStats() {
    if (USE_MOCK) {
      await delay();
      return [...MOCK_STATS];
    }
    const res = await fetch(`${API_BASE_URL}/stats`);
    return await res.json();
  },

  /**
   * Lấy danh sách đợt hiến máu
   */
  async getDonationEvents() {
    if (USE_MOCK) {
      await delay();
      return [...MOCK_DONATION_EVENTS];
    }
    const res = await fetch(`${API_BASE_URL}/events`);
    return await res.json();
  },

  /**
   * Lấy tiêu chí và điều kiện hiến máu
   */
  async getEligibility() {
    if (USE_MOCK) {
      await delay();
      return {
        criteria: [...MOCK_ELIGIBILITY_CRITERIA],
        faqs: [...MOCK_FAQS]
      };
    }
    const res = await fetch(`${API_BASE_URL}/faq`);
    return await res.json();
  },

  /**
   * Quét mã QR của người hiến máu (dành cho nhân viên y tế / hospital)
   * Trả về thông tin: đã hiến bao nhiêu lần, lần gần nhất, nhóm máu, đủ điều kiện hiến tiếp không
   */
  async scanDonorQr(qrToken) {
    if (USE_MOCK) {
      await delay(400);
      return {
        success: true,
        data: { ...MOCK_DONOR_PROFILE }
      };
    }
    const res = await fetch(`${API_BASE_URL}/donors/verify-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken })
    });
    return await res.json();
  },

  /**
   * Nhân viên y tế nhập thông tin đơn vị máu sau khi hiến thành công
   */
  async submitDonationRecord(recordData) {
    if (USE_MOCK) {
      await delay(500);
      return {
        success: true,
        message: 'Đã lưu thông tin hiến máu thành công!',
        certificateCode: 'GCN-' + Math.floor(100000 + Math.random() * 900000),
        data: recordData
      };
    }
    const res = await fetch(`${API_BASE_URL}/donations/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData)
    });
    return await res.json();
  },

  /**
   * Đăng ký tham gia hiến máu trực tuyến
   */
  async registerDonation(formData) {
    if (USE_MOCK) {
      await delay(400);
      return {
        success: true,
        message: 'Đăng ký hiến máu thành công! Mã QR tham gia đã được cấp.',
        qrToken: 'QR-TOKEN-' + Date.now(),
        donorName: formData.fullName
      };
    }
    const res = await fetch(`${API_BASE_URL}/donations/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return await res.json();
  }
};
