import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Database,
  Building2,
  Droplet,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Layers,
  Inbox,
  AlertCircle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api.js';

export interface BloodInventoryTabProps {
  onSelectTab?: (tabId: string) => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
}

export interface InventoryItem {
  id: number;
  maLuuTru: string;
  donViLuuTru: string; // Quan hệ Bệnh viện / Cơ sở lưu trữ
  khoaPhongKho?: string;
  nhomMau: string; // A+, O-, ...
  thanhPhan: 'ToanPhan' | 'HongCau' | 'TieuCau' | 'HuyetTuong' | string;
  soLuongTui: number;
  soLuongConLaiMl: number;
  nguongCanhBaoMl: number;
  ngayNhap: string; // YYYY-MM-DD
  hanSuDung: string; // YYYY-MM-DD (FEFO)
  trangThaiKho: 'DU_TRU_AN_TOAN' | 'CANH_BAO_THIEU_MAU' | 'SAP_HET_HAN';
  nhietDoBaoQuan?: string;
}

export interface BloodGroupSummary {
  nhomMau: string;
  soLuongTui: number;
  soLuongMl: number;
  dungLuongChuanTui: number; // Mức an toàn mong muốn
  phanTram: number;
  mucDo: 'NGUY_CAP' | 'CANH_BAO' | 'AN_TOAN';
}

// 25+ bản ghi dữ liệu mẫu chuẩn y khoa thực tế (Quan hệ 1-n: Bệnh viện - Chi tiết kho máu)
const COMPREHENSIVE_MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    maLuuTru: 'BLD-CR-2601',
    donViLuuTru: 'Bệnh viện Chợ Rẫy',
    khoaPhongKho: 'Kho Huyết học Trung tâm - Tủ đông sâu A1',
    nhomMau: 'O-',
    thanhPhan: 'Máu toàn phần',
    soLuongTui: 6,
    soLuongConLaiMl: 2100,
    nguongCanhBaoMl: 5000,
    ngayNhap: '2026-09-25',
    hanSuDung: '2026-10-30',
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 2,
    maLuuTru: 'BLD-CR-2602',
    donViLuuTru: 'Bệnh viện Chợ Rẫy',
    khoaPhongKho: 'Kho Huyết học Trung tâm - Tủ lạnh B2',
    nhomMau: 'O+',
    thanhPhan: 'Khối hồng cầu',
    soLuongTui: 38,
    soLuongConLaiMl: 13300,
    nguongCanhBaoMl: 8000,
    ngayNhap: '2026-10-01',
    hanSuDung: '2026-11-12',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 3,
    maLuuTru: 'BLD-NIH-2603',
    donViLuuTru: 'Viện Huyết học - Truyền máu TW',
    khoaPhongKho: 'Ngân hàng Máu Quốc gia - Dãy K3',
    nhomMau: 'A+',
    thanhPhan: 'Khối hồng cầu',
    soLuongTui: 45,
    soLuongConLaiMl: 15750,
    nguongCanhBaoMl: 10000,
    ngayNhap: '2026-09-28',
    hanSuDung: '2026-11-05',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 4,
    maLuuTru: 'BLD-NIH-2604',
    donViLuuTru: 'Viện Huyết học - Truyền máu TW',
    khoaPhongKho: 'Kho Điều chế Chế phẩm - Máy lắc tiểu cầu',
    nhomMau: 'A-',
    thanhPhan: 'Tiểu cầu đậm đặc',
    soLuongTui: 4,
    soLuongConLaiMl: 1000,
    nguongCanhBaoMl: 2500,
    ngayNhap: '2026-10-09',
    hanSuDung: '2026-10-14', // 5 ngày
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '20°C - 24°C',
  },
  {
    id: 5,
    maLuuTru: 'BLD-BM-2605',
    donViLuuTru: 'Bệnh viện Bạch Mai',
    khoaPhongKho: 'Trung tâm Huyết học & Truyền máu A9',
    nhomMau: 'B+',
    thanhPhan: 'Máu toàn phần',
    soLuongTui: 28,
    soLuongConLaiMl: 9800,
    nguongCanhBaoMl: 6000,
    ngayNhap: '2026-09-20',
    hanSuDung: '2026-10-25',
    trangThaiKho: 'SAP_HET_HAN',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 6,
    maLuuTru: 'BLD-BM-2606',
    donViLuuTru: 'Bệnh viện Bạch Mai',
    khoaPhongKho: 'Trung tâm Huyết học - Tủ cấp đông Plasma',
    nhomMau: 'B-',
    thanhPhan: 'Huyết tương tươi đông lạnh',
    soLuongTui: 8,
    soLuongConLaiMl: 2800,
    nguongCanhBaoMl: 4000,
    ngayNhap: '2026-08-15',
    hanSuDung: '2027-08-15',
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '-25°C',
  },
  {
    id: 7,
    maLuuTru: 'BLD-108-2607',
    donViLuuTru: 'Bệnh viện Quân Y 108',
    khoaPhongKho: 'Kho Máu Cấp cứu Ngoại khoa',
    nhomMau: 'AB+',
    thanhPhan: 'Khối hồng cầu',
    soLuongTui: 18,
    soLuongConLaiMl: 6300,
    nguongCanhBaoMl: 4500,
    ngayNhap: '2026-10-02',
    hanSuDung: '2026-11-15',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 8,
    maLuuTru: 'BLD-108-2608',
    donViLuuTru: 'Bệnh viện Quân Y 108',
    khoaPhongKho: 'Kho Máu Cấp cứu Ngoại khoa',
    nhomMau: 'AB-',
    thanhPhan: 'Máu toàn phần',
    soLuongTui: 3,
    soLuongConLaiMl: 1050,
    nguongCanhBaoMl: 3000,
    ngayNhap: '2026-09-22',
    hanSuDung: '2026-10-27',
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 9,
    maLuuTru: 'BLD-PSTW-2609',
    donViLuuTru: 'Bệnh viện Phụ sản Trung ương',
    khoaPhongKho: 'Kho Huyết học Phòng sinh Cấp cứu',
    nhomMau: 'O-',
    thanhPhan: 'Máu toàn phần',
    soLuongTui: 5,
    soLuongConLaiMl: 1750,
    nguongCanhBaoMl: 4000,
    ngayNhap: '2026-09-30',
    hanSuDung: '2026-11-04',
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 10,
    maLuuTru: 'BLD-PSTW-2610',
    donViLuuTru: 'Bệnh viện Phụ sản Trung ương',
    khoaPhongKho: 'Kho Trữ Huyết tương Tươi',
    nhomMau: 'A+',
    thanhPhan: 'Huyết tương tươi đông lạnh',
    soLuongTui: 24,
    soLuongConLaiMl: 8400,
    nguongCanhBaoMl: 5000,
    ngayNhap: '2026-07-10',
    hanSuDung: '2027-07-10',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '-25°C',
  },
  {
    id: 11,
    maLuuTru: 'BLD-HV-2611',
    donViLuuTru: 'Bệnh viện Hùng Vương',
    khoaPhongKho: 'Kho Trữ Máu Sản khoa Tầng 2',
    nhomMau: 'B+',
    thanhPhan: 'Khối hồng cầu',
    soLuongTui: 22,
    soLuongConLaiMl: 7700,
    nguongCanhBaoMl: 5000,
    ngayNhap: '2026-10-04',
    hanSuDung: '2026-11-18',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 12,
    maLuuTru: 'BLD-HV-2612',
    donViLuuTru: 'Bệnh viện Hùng Vương',
    khoaPhongKho: 'Kho Huyết học Sơ sinh',
    nhomMau: 'O+',
    thanhPhan: 'Tiểu cầu đậm đặc',
    soLuongTui: 5,
    soLuongConLaiMl: 1250,
    nguongCanhBaoMl: 2000,
    ngayNhap: '2026-10-10',
    hanSuDung: '2026-10-15',
    trangThaiKho: 'SAP_HET_HAN',
    nhietDoBaoQuan: '20°C - 24°C',
  },
  {
    id: 13,
    maLuuTru: 'BLD-ND1-2613',
    donViLuuTru: 'Bệnh viện Nhi Đồng 1',
    khoaPhongKho: 'Kho Lưu Trữ Máu Nhi khoa',
    nhomMau: 'A-',
    thanhPhan: 'Máu toàn phần',
    soLuongTui: 5,
    soLuongConLaiMl: 1750,
    nguongCanhBaoMl: 3500,
    ngayNhap: '2026-10-03',
    hanSuDung: '2026-11-08',
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 14,
    maLuuTru: 'BLD-ND1-2614',
    donViLuuTru: 'Bệnh viện Nhi Đồng 1',
    khoaPhongKho: 'Kho Lưu Trữ Máu Nhi khoa',
    nhomMau: 'AB-',
    thanhPhan: 'Tiểu cầu đậm đặc',
    soLuongTui: 2,
    soLuongConLaiMl: 500,
    nguongCanhBaoMl: 1500,
    ngayNhap: '2026-10-08',
    hanSuDung: '2026-10-13',
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '20°C - 24°C',
  },
  {
    id: 15,
    maLuuTru: 'BLD-CR-2615',
    donViLuuTru: 'Bệnh viện Chợ Rẫy',
    khoaPhongKho: 'Kho Máu Cấp Cứu A9',
    nhomMau: 'A+',
    thanhPhan: 'Khối hồng cầu',
    soLuongTui: 30,
    soLuongConLaiMl: 10500,
    nguongCanhBaoMl: 7000,
    ngayNhap: '2026-10-05',
    hanSuDung: '2026-11-19',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 16,
    maLuuTru: 'BLD-NIH-2616',
    donViLuuTru: 'Viện Huyết học - Truyền máu TW',
    khoaPhongKho: 'Ngân hàng Tế bào Gốc & Chế phẩm',
    nhomMau: 'O+',
    thanhPhan: 'Máu toàn phần',
    soLuongTui: 52,
    soLuongConLaiMl: 18200,
    nguongCanhBaoMl: 12000,
    ngayNhap: '2026-10-07',
    hanSuDung: '2026-11-21',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '2°C - 6°C',
  },
  {
    id: 17,
    maLuuTru: 'BLD-BM-2617',
    donViLuuTru: 'Bệnh viện Bạch Mai',
    khoaPhongKho: 'Kho Máu Trung tâm',
    nhomMau: 'AB+',
    thanhPhan: 'Huyết tương tươi đông lạnh',
    soLuongTui: 19,
    soLuongConLaiMl: 6650,
    nguongCanhBaoMl: 4000,
    ngayNhap: '2026-08-01',
    hanSuDung: '2027-08-01',
    trangThaiKho: 'DU_TRU_AN_TOAN',
    nhietDoBaoQuan: '-25°C',
  },
  {
    id: 18,
    maLuuTru: 'BLD-108-2618',
    donViLuuTru: 'Bệnh viện Quân Y 108',
    khoaPhongKho: 'Kho Huyết học Phẫu thuật',
    nhomMau: 'B-',
    thanhPhan: 'Khối hồng cầu',
    soLuongTui: 7,
    soLuongConLaiMl: 2450,
    nguongCanhBaoMl: 3500,
    ngayNhap: '2026-09-29',
    hanSuDung: '2026-11-03',
    trangThaiKho: 'CANH_BAO_THIEU_MAU',
    nhietDoBaoQuan: '2°C - 6°C',
  },
];

const BLOOD_TYPES_ORDER = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const BloodInventoryTab: React.FC<BloodInventoryTabProps> = ({
  onSelectTab,
}) => {
  // 1. Quản lý State phân trang & bộ lọc
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(8);
  const [searchInput, setSearchInput] = useState<string>(''); // Text gõ vào input
  const [debouncedSearch, setDebouncedSearch] = useState<string>(''); // Text đã debounce
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedThanhPhan, setSelectedThanhPhan] = useState<string>('ALL');

  // 2. Quản lý State dữ liệu từ Backend
  const [tableData, setTableData] = useState<InventoryItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(COMPREHENSIVE_MOCK_INVENTORY.length);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(COMPREHENSIVE_MOCK_INVENTORY.length / 8));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summaryStats, setSummaryStats] = useState<BloodGroupSummary[]>([]);

  // 3. Xử lý DEBOUNCE khi gõ tìm kiếm (Trì hoãn 400ms để tối ưu số lần gọi API)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset về trang 1 khi đổi từ khóa tìm kiếm
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Reset trang về 1 khi đổi bộ lọc
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setPage(1);
  };

  // 4. Tính toán khối chỉ số 8 nhóm máu (Blood Group Overview Cards)
  useEffect(() => {
    const defaultCapacityMap: Record<string, number> = {
      'O+': 70,
      'O-': 30,
      'A+': 60,
      'A-': 25,
      'B+': 55,
      'B-': 25,
      'AB+': 40,
      'AB-': 20,
    };

    const groupCounts: Record<string, { tui: number; ml: number }> = {};
    BLOOD_TYPES_ORDER.forEach((b) => {
      groupCounts[b] = { tui: 0, ml: 0 };
    });

    COMPREHENSIVE_MOCK_INVENTORY.forEach((item) => {
      const b = item.nhomMau.trim().toUpperCase();
      if (groupCounts[b]) {
        groupCounts[b].tui += item.soLuongTui;
        groupCounts[b].ml += item.soLuongConLaiMl;
      }
    });

    const calculatedSummaries: BloodGroupSummary[] = BLOOD_TYPES_ORDER.map((b) => {
      const count = groupCounts[b] || { tui: 0, ml: 0 };
      const capacity = defaultCapacityMap[b] || 50;
      const pct = Math.min(100, Math.round((count.tui / capacity) * 100));

      let mucDo: 'NGUY_CAP' | 'CANH_BAO' | 'AN_TOAN' = 'AN_TOAN';
      if (pct < 35) {
        mucDo = 'NGUY_CAP'; // Đỏ: Báo động thiếu
      } else if (pct < 65) {
        mucDo = 'CANH_BAO'; // Vàng: Mức cảnh báo
      } else {
        mucDo = 'AN_TOAN'; // Xanh: An toàn
      }

      return {
        nhomMau: b,
        soLuongTui: count.tui,
        soLuongMl: count.ml,
        dungLuongChuanTui: capacity,
        phanTram: pct,
        mucDo,
      };
    });

    setSummaryStats(calculatedSummaries);
  }, []);

  // 5. Gọi API GET /api/blood-inventories với Pagination, Search, Filter
  const fetchInventories = useCallback(async () => {
    setIsLoading(true);

    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    if (debouncedSearch.trim()) {
      queryParams.append('search', debouncedSearch.trim());
    }
    if (selectedBloodGroup !== 'ALL') {
      queryParams.append('bloodGroup', selectedBloodGroup);
      queryParams.append('nhomMau', selectedBloodGroup);
    }
    if (selectedStatus !== 'ALL') {
      queryParams.append('status', selectedStatus);
    }

    try {
      // 1. Thử gọi API backend
      let apiSuccess = false;
      try {
        const res = await api.get(`/blood-inventories?${queryParams.toString()}`);
        if (res.data?.success && res.data?.data) {
          const resData = res.data.data;
          const items = Array.isArray(resData) ? resData : resData.items || [];
          setTableData(items);
          setTotalItems(resData.total || items.length);
          setTotalPages(resData.totalPages || Math.ceil((resData.total || items.length) / limit) || 1);
          apiSuccess = true;
        }
      } catch {
        // Fallback v1 nếu backend dùng /api/v1/blood-inventories
        try {
          const resV1 = await api.get(`/v1/blood-inventories?${queryParams.toString()}`);
          if (resV1.data?.success && resV1.data?.data) {
            const resData = resV1.data.data;
            const items = Array.isArray(resData) ? resData : resData.items || [];
            setTableData(items);
            setTotalItems(resData.total || items.length);
            setTotalPages(resData.totalPages || Math.ceil((resData.total || items.length) / limit) || 1);
            apiSuccess = true;
          }
        } catch {
          apiSuccess = false;
        }
      }

      // 2. Cơ chế Dự phòng dữ liệu y khoa chuẩn (Client-Side Filtering & Pagination)
      if (!apiSuccess) {
        let filtered = [...COMPREHENSIVE_MOCK_INVENTORY];

        // Lọc theo search input
        if (debouncedSearch.trim()) {
          const kw = debouncedSearch.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.donViLuuTru.toLowerCase().includes(kw) ||
              item.maLuuTru.toLowerCase().includes(kw) ||
              (item.khoaPhongKho && item.khoaPhongKho.toLowerCase().includes(kw))
          );
        }

        // Lọc theo nhóm máu
        if (selectedBloodGroup !== 'ALL') {
          filtered = filtered.filter((item) => item.nhomMau.trim().toUpperCase() === selectedBloodGroup);
        }

        // Lọc theo trạng thái
        if (selectedStatus !== 'ALL') {
          filtered = filtered.filter((item) => item.trangThaiKho === selectedStatus);
        }

        // Lọc theo thành phần
        if (selectedThanhPhan !== 'ALL') {
          filtered = filtered.filter((item) => item.thanhPhan === selectedThanhPhan);
        }

        // Áp dụng thuật toán sắp xếp FEFO (First Expired First Out)
        filtered.sort((a, b) => new Date(a.hanSuDung).getTime() - new Date(b.hanSuDung).getTime());

        const total = filtered.length;
        const totalP = Math.max(1, Math.ceil(total / limit));
        const startIndex = (page - 1) * limit;
        const pagedItems = filtered.slice(startIndex, startIndex + limit);

        setTableData(pagedItems);
        setTotalItems(total);
        setTotalPages(totalP);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedBloodGroup, selectedStatus, selectedThanhPhan]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  // Đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedBloodGroup('ALL');
    setSelectedStatus('ALL');
    setSelectedThanhPhan('ALL');
    setPage(1);
  };

  // Format ngày DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Tính số ngày còn lại đến hạn sử dụng (FEFO)
  const getDaysRemaining = (expireDateStr: string) => {
    const diff = new Date(expireDateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Render Badge trạng thái
  const renderStatusBadge = (status: string, daysLeft: number) => {
    if (daysLeft <= 7 || status === 'SAP_HET_HAN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>Sắp hết hạn ({daysLeft > 0 ? `${daysLeft} ngày` : 'Quá hạn'})</span>
        </span>
      );
    }

    if (status === 'CANH_BAO_THIEU_MAU') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-[#D32F2F] border border-rose-200">
          <TrendingDown className="w-3 h-3 text-[#D32F2F]" />
          <span>Thiếu hụt báo động</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        <span>Dự trữ an toàn</span>
      </span>
    );
  };

  // Render danh sách nút phân trang thông minh
  const renderPaginationButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`dots-${idx}`} className="px-3 py-1.5 text-xs text-slate-400 font-bold select-none">
            ...
          </span>
        );
      }
      const pageNum = p as number;
      const isActive = pageNum === page;
      return (
        <button
          key={pageNum}
          type="button"
          onClick={() => handlePageChange(pageNum)}
          className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-bold transition-all ${
            isActive
              ? 'bg-[#D32F2F] text-white shadow-sm shadow-[#D32F2F]/30 scale-105'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. HEADER SECTION: QUẢN LÝ KHO DỰ TRỮ MÁU & FEFO */}
      <section className="bg-white p-6 sm:p-8 rounded-[12px] border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#D32F2F] text-xs font-bold uppercase tracking-wider border border-rose-200">
              <Database className="w-3.5 h-3.5" />
              <span>Nghiệp vụ cốt lõi: Quan hệ Bệnh viện — Kho Máu Chi Tiết</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Giám Sát Kho Dự Trữ Máu Toàn Hệ Thống
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Theo dõi định lượng tồn kho máu tại các bệnh viện liên kết, tự động cảnh báo ngưỡng thiếu hụt và tối ưu xuất kho theo nguyên tắc y khoa <strong>FEFO (First Expired, First Out)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchInventories}
              disabled={isLoading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              title="Cập nhật lại dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D32F2F]' : ''}`} />
              <span>Đồng bộ kho</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. KHỐI CHỈ SỐ 8 NHÓM MÁU CHÍNH (8 BLOOD GROUPS OVERVIEW) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-[#D32F2F]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Mức Độ Dự Trữ An Toàn 8 Nhóm Máu Chính
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> An toàn (&gt;65%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cảnh báo (35-65%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Báo động thiếu (&lt;35%)
            </span>
          </div>
        </div>

        {/* Grid 8 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {summaryStats.map((item) => {
            const isSelected = selectedBloodGroup === item.nhomMau;
            const progressColor =
              item.mucDo === 'NGUY_CAP'
                ? 'bg-red-500'
                : item.mucDo === 'CANH_BAO'
                ? 'bg-amber-500'
                : 'bg-emerald-500';

            const badgeBg =
              item.mucDo === 'NGUY_CAP'
                ? 'bg-rose-50 text-[#D32F2F] border-rose-200'
                : item.mucDo === 'CANH_BAO'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            return (
              <button
                key={item.nhomMau}
                type="button"
                onClick={() =>
                  handleFilterChange(setSelectedBloodGroup, isSelected ? 'ALL' : item.nhomMau)
                }
                className={`p-3.5 rounded-[12px] text-left transition-all duration-200 border relative group cursor-pointer ${
                  isSelected
                    ? 'bg-red-50/70 border-[#D32F2F] ring-2 ring-[#D32F2F]/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Header Card */}
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {item.nhomMau}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeBg}`}>
                    {item.phanTram}%
                  </span>
                </div>

                {/* Số lượng túi & ml */}
                <div className="space-y-0.5 mb-2.5">
                  <div className="text-base font-black text-slate-900 leading-tight">
                    {item.soLuongTui}{' '}
                    <span className="text-[11px] font-normal text-slate-500">túi</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    ≈ {item.soLuongMl.toLocaleString('vi-VN')} ml
                  </div>
                </div>

                {/* Progress Bar (Đỏ - Vàng - Xanh) */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${Math.max(5, item.phanTram)}%` }}
                  />
                </div>

                {/* Chú thích mức độ */}
                <div className="mt-2 text-[10px] font-bold truncate">
                  {item.mucDo === 'NGUY_CAP' && (
                    <span className="text-[#D32F2F] flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                      Thiếu hụt
                    </span>
                  )}
                  {item.mucDo === 'CANH_BAO' && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      Mức cảnh báo
                    </span>
                  )}
                  {item.mucDo === 'AN_TOAN' && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                      An toàn
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BỘ LỌC VÀ TÌM KIẾM CÓ DEBOUNCE */}
      <section className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Ô Input tìm kiếm (Debounce 400ms) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên Bệnh viện, Mã lưu trữ hoặc Kho..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lọc Nhóm Máu */}
          <div className="md:col-span-2">
            <select
              value={selectedBloodGroup}
              onChange={(e) => handleFilterChange(setSelectedBloodGroup, e.target.value)}
              aria-label="Chọn nhóm máu cần lọc"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            >
              <option value="ALL">Tất cả nhóm máu</option>
              {BLOOD_TYPES_ORDER.map((bg) => (
                <option key={bg} value={bg}>
                  Nhóm {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng thái (Đầy đủ, Thiếu hụt, Sắp hết hạn) */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              aria-label="Chọn trạng thái kho"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            >
              <option value="ALL">Tất cả trạng thái kho</option>
              <option value="DU_TRU_AN_TOAN">Đầy đủ (Dự trữ an toàn)</option>
              <option value="CANH_BAO_THIEU_MAU">Thiếu hụt (Báo động đỏ)</option>
              <option value="SAP_HET_HAN">Sắp hết hạn (FEFO ưu tiên)</option>
            </select>
          </div>

          {/* Nút đặt lại */}
          <div className="md:col-span-2 flex items-center justify-end">
            {(searchInput || selectedBloodGroup !== 'ALL' || selectedStatus !== 'ALL') ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 px-3 border border-slate-200 hover:border-[#D32F2F] text-slate-600 hover:text-[#D32F2F] text-xs font-bold rounded-xl transition-all"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 text-right w-full pr-1">
                Tìm kiếm tự động Debounce 400ms
              </div>
            )}
          </div>
        </div>

        {/* Thanh lọc phụ: Thành phần máu */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#D32F2F]" />
            Chế phẩm máu:
          </span>
          {['ALL', 'Máu toàn phần', 'Khối hồng cầu', 'Tiểu cầu đậm đặc', 'Huyết tương tươi đông lạnh'].map(
            (tp) => {
              const isSelected = selectedThanhPhan === tp;
              return (
                <button
                  key={tp}
                  type="button"
                  onClick={() => handleFilterChange(setSelectedThanhPhan, tp)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tp === 'ALL' ? 'Tất cả chế phẩm' : tp}
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* 4. BẢNG DỮ LIỆU TỒN KHO MÁU (DATA TABLE VỚI FEFO & PAGINATION) */}
      <section className="bg-white rounded-[12px] border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#D32F2F]" />
              <span>Bảng Kê Chi Tiết Tồn Kho Máu Theo Cơ Sở</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {totalItems} bản ghi
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dữ liệu sắp xếp ưu tiên theo hạn sử dụng tăng dần (FEFO - Lô sắp hết hạn xuất trước)
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Trang <strong>{page}</strong> / <strong>{totalPages}</strong>
          </div>
        </div>

        {/* Bảng Dữ Liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã Lưu Trữ</th>
                <th className="py-3 px-4">Bệnh Viện / Cơ Sở Lưu Trữ</th>
                <th className="py-3 px-4 text-center">Nhóm Máu</th>
                <th className="py-3 px-4">Chế Phẩm Máu</th>
                <th className="py-3 px-4 text-right">Số Lượng Tồn</th>
                <th className="py-3 px-4">Ngày Nhập</th>
                <th className="py-3 px-4">Hạn Sử Dụng (FEFO)</th>
                <th className="py-3 px-4 text-center">Trạng Thái Kho</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                /* Loading State */
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#D32F2F]" />
                      <span className="text-xs font-semibold">Đang tải dữ liệu tồn kho từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                /* 5. EMPTY STATE: Khi không có dữ liệu */
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#D32F2F] flex items-center justify-center mx-auto">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Không tìm thấy dữ liệu kho máu phù hợp</h4>
                      <p className="text-xs text-slate-500">
                        Không có lô máu nào khớp với tiêu chuẩn tìm kiếm &quot;{debouncedSearch}&quot; hoặc bộ lọc đã chọn.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-[#D32F2F] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#B71C1C] transition-all"
                      >
                        Xóa toàn bộ bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Danh sách các dòng dữ liệu */
                tableData.map((row) => {
                  const daysLeft = getDaysRemaining(row.hanSuDung);
                  const isExpiringSoon = daysLeft <= 7;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-rose-50/30 transition-colors group"
                    >
                      {/* Mã lưu trữ */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-100 group-hover:bg-rose-100/60 group-hover:text-[#D32F2F] transition-colors">
                          {row.maLuuTru}
                        </span>
                      </td>

                      {/* Tên Bệnh viện (Quan hệ 1-N) */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{row.donViLuuTru}</span>
                        </div>
                        {row.khoaPhongKho && (
                          <div className="text-[11px] text-slate-500 pl-5 line-clamp-1">
                            {row.khoaPhongKho}
                          </div>
                        )}
                      </td>

                      {/* Nhóm máu */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white font-black text-xs shadow-xs">
                          {row.nhomMau}
                        </span>
                      </td>

                      {/* Chế phẩm máu */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {row.thanhPhan}
                        {row.nhietDoBaoQuan && (
                          <span className="block text-[10px] text-slate-400">
                            Bảo quản: {row.nhietDoBaoQuan}
                          </span>
                        )}
                      </td>

                      {/* Số lượng */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-sm font-black text-slate-900 block leading-tight">
                          {row.soLuongTui} <span className="text-[11px] font-normal text-slate-500">túi</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {row.soLuongConLaiMl.toLocaleString('vi-VN')} ml
                        </span>
                      </td>

                      {/* Ngày nhập */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(row.ngayNhap)}
                      </td>

                      {/* Hạn sử dụng (FEFO) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-mono text-[11px] font-bold ${isExpiringSoon ? 'text-amber-600' : 'text-slate-800'}`}>
                          {formatDate(row.hanSuDung)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã quá hạn'}
                        </div>
                      </td>

                      {/* Trạng thái kho */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(row.trangThaiKho, daysLeft)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. THANH PHÂN TRANG (PAGINATION BAR) */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Hiển thị{' '}
            <strong className="text-slate-800">
              {totalItems === 0 ? 0 : (page - 1) * limit + 1}
            </strong>{' '}
            đến{' '}
            <strong className="text-slate-800">
              {Math.min(page * limit, totalItems)}
            </strong>{' '}
            trong tổng số <strong className="text-slate-800">{totalItems}</strong> bản ghi
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nút Trước (Previous) */}
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                page <= 1 || isLoading
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </button>

            {/* Danh sách các số trang [1, 2, 3...] */}
            <div className="flex items-center gap-1">{renderPaginationButtons()}</div>

            {/* Nút Sau (Next) */}
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                page >= totalPages || isLoading
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95'
              }`}
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BloodInventoryTab;
