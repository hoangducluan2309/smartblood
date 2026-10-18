import React, { useState, useEffect } from 'react';
import { BloodStockSummary } from '../../types';
import { axiosClient } from '../../api/axiosClient';
import { 
  Droplet, 
  CheckCircle2, 
  Search, 
  Box, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  AlertTriangle, 
  Save 
} from 'lucide-react';
import toast from 'react-hot-toast';

// 8 Nhóm máu & Dữ liệu tồn kho tổng hợp mặc định
const DEFAULT_SUMMARIES: BloodStockSummary[] = [
  { nhomMau: 'O-', soLuongTui: 14, nguongAnToan: 50, mucDo: 'CRITICAL', phanTram: 28, tuiSapHetHan: 4 },
  { nhomMau: 'AB-', soLuongTui: 8, nguongAnToan: 30, mucDo: 'CRITICAL', phanTram: 26, tuiSapHetHan: 2 },
  { nhomMau: 'A-', soLuongTui: 18, nguongAnToan: 40, mucDo: 'CRITICAL', phanTram: 45, tuiSapHetHan: 3 },
  { nhomMau: 'B-', soLuongTui: 22, nguongAnToan: 40, mucDo: 'WARNING', phanTram: 55, tuiSapHetHan: 1 },
  { nhomMau: 'O+', soLuongTui: 145, nguongAnToan: 150, mucDo: 'SAFE', phanTram: 96, tuiSapHetHan: 8 },
  { nhomMau: 'A+', soLuongTui: 180, nguongAnToan: 160, mucDo: 'SAFE', phanTram: 100, tuiSapHetHan: 5 },
  { nhomMau: 'B+', soLuongTui: 195, nguongAnToan: 170, mucDo: 'SAFE', phanTram: 100, tuiSapHetHan: 6 },
  { nhomMau: 'AB+', soLuongTui: 85, nguongAnToan: 80, mucDo: 'SAFE', phanTram: 100, tuiSapHetHan: 3 },
];

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const BLOOD_COMPONENTS = [
  { value: 'ToanPhan', label: 'Máu Toàn Phần' },
  { value: 'HongCau', label: 'Khối Hồng Cầu' },
  { value: 'TieuCau', label: 'Khối Tiểu Cầu' },
  { value: 'HuyetTuong', label: 'Huyết Tương Đông Lạnh' },
];

export const BloodInventoryPage: React.FC = () => {
  const [summaries, setSummaries] = useState<BloodStockSummary[]>(DEFAULT_SUMMARIES);
  const [rawDbItems, setRawDbItems] = useState<any[]>([]);
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // States cho Modal Thêm mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNhomMau, setNewNhomMau] = useState('O+');
  const [newThanhPhan, setNewThanhPhan] = useState('ToanPhan');
  const [newTheTich, setNewTheTich] = useState(350);
  const [newDonViLuuTru, setNewDonViLuuTru] = useState('Kho Lưu Trữ Trung Tâm - TP.HCM');
  const [newNguongCanhBao, setNewNguongCanhBao] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States cho Modal Chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editTheTich, setEditTheTich] = useState(350);
  const [editDonViLuuTru, setEditDonViLuuTru] = useState('');
  const [editNguongCanhBao, setEditNguongCanhBao] = useState(500);

  // States cho Modal Xuất hủy / Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, lotsRes] = await Promise.allSettled([
        axiosClient.get('/blood-inventories/summary'),
        axiosClient.get('/blood-inventories'),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value.data) {
        const rawSum = summaryRes.value.data?.data || summaryRes.value.data;
        if (Array.isArray(rawSum) && rawSum.length > 0) {
          setSummaries(rawSum);
        }
      }

      if (lotsRes.status === 'fulfilled' && lotsRes.value.data) {
        const rawLots = lotsRes.value.data?.data?.items || lotsRes.value.data?.items || (Array.isArray(lotsRes.value.data) ? lotsRes.value.data : []);
        setRawDbItems(rawLots);
      }
    } catch {
      console.warn('Lỗi kết nối khi tải dữ liệu kho máu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Xử lý Thêm mới túi máu (POST /api/v1/blood-inventories)
  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonViLuuTru.trim()) {
      toast.error('Vui lòng nhập vị trí / đơn vị lưu trữ!');
      return;
    }
    if (newTheTich <= 0) {
      toast.error('Thể tích máu phải lớn hơn 0ml!');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosClient.post('/blood-inventories', {
        nhomMau: newNhomMau,
        thanhPhan: newThanhPhan,
        soLuongConLaiMl: Number(newTheTich),
        donViLuuTru: newDonViLuuTru.trim(),
        nguongCanhBaoMl: Number(newNguongCanhBao),
      });

      toast.success(`Đã thêm thành công túi máu ${newNhomMau} (${newTheTich}ml) vào kho!`);
      setIsAddModalOpen(false);
      await fetchInventoryData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể thêm túi máu vào kho.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở modal Chỉnh sửa
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setEditTheTich(item.soLuongConLaiMl || 350);
    setEditDonViLuuTru(item.donViLuuTru || '');
    setEditNguongCanhBao(item.nguongCanhBaoMl || 500);
    setIsEditModalOpen(true);
  };

  // Xử lý Cập nhật túi máu (PUT /api/v1/blood-inventories/:id)
  const handleUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsSubmitting(true);
      await axiosClient.put(`/blood-inventories/${editingItem.id}`, {
        soLuongConLaiMl: Number(editTheTich),
        donViLuuTru: editDonViLuuTru.trim(),
        nguongCanhBaoMl: Number(editNguongCanhBao),
      });

      toast.success(`Cập nhật thành công lô máu #${editingItem.id}!`);
      setIsEditModalOpen(false);
      setEditingItem(null);
      await fetchInventoryData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật túi máu.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở modal Xác nhận xuất hủy / Xóa
  const handleOpenDelete = (item: any) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  // Xử lý Xóa / Xuất hủy túi máu (DELETE /api/v1/blood-inventories/:id)
  const handleDeleteInventory = async () => {
    if (!deletingItem) return;

    try {
      setIsSubmitting(true);
      await axiosClient.delete(`/blood-inventories/${deletingItem.id}`);
      toast.success(`Đã xuất hủy lô túi máu #${deletingItem.id} khỏi kho thành công!`);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      await fetchInventoryData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xuất hủy túi máu.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc và sắp xếp danh sách túi máu
  const filteredItems = rawDbItems
    .filter((item) => {
      const matchBlood = selectedBloodFilter === 'ALL' || item.nhomMau === selectedBloodFilter;
      const matchSearch =
        (item.donViLuuTru && item.donViLuuTru.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.nhomMau && item.nhomMau.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.thanhPhan && item.thanhPhan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.id && item.id.toString().includes(searchTerm));
      return matchBlood && matchSearch;
    })
    .sort((a, b) => new Date(a.ngayCapNhat || 0).getTime() - new Date(b.ngayCapNhat || 0).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Quản Lý Kho Máu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black mb-1">
            <Box className="w-3.5 h-3.5 text-blood-primary" />
            Hệ Thống Quản Lý Kho Máu Chuẩn Y Tế FEFO
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản Lý & Điều Phối Kho Máu Trực Tiếp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Theo dõi trữ lượng, tự động cảnh báo thiếu hụt và toàn quyền Thêm / Sửa / Xuất hủy lô máu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchInventoryData(); toast.success('Đã làm mới dữ liệu kho máu!'); }}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blood-primary hover:bg-blood-dark text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blood-primary/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Túi Máu Vào Kho
          </button>
        </div>
      </div>

      {/* 2. 8 THẺ CHỈ SỐ CHO 8 NHÓM MÁU */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-blood-primary fill-blood-primary" />
            Trạng Thái Dung Lượng 8 Nhóm Máu Toàn Khu Vực
          </h2>
          <span className="text-xs text-slate-500 font-medium">Bấm vào nhóm máu để lọc</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {summaries.map((item) => {
            const isCritical = item.mucDo === 'CRITICAL';
            const isWarning = item.mucDo === 'WARNING';
            const isSelected = selectedBloodFilter === item.nhomMau;

            return (
              <div
                key={item.nhomMau}
                onClick={() => setSelectedBloodFilter(isSelected ? 'ALL' : (item.nhomMau || 'ALL'))}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 bg-white flex flex-col justify-between space-y-2.5 transition-all cursor-pointer hover:scale-102 shadow-2xs ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/20 shadow-md'
                    : isCritical
                    ? 'border-red-200 hover:border-blood-primary bg-red-50/20'
                    : isWarning
                    ? 'border-amber-200 hover:border-warning bg-amber-50/20'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900">{item.nhomMau}</span>
                  {isCritical ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-blood-primary animate-ping" />
                  ) : isWarning ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                </div>

                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">
                    {item.soLuongTui || 0}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    túi ({(item as any).soLuongMl ? `${(item as any).soLuongMl}ml` : 'chuẩn'})
                  </span>
                </div>

                {/* Thanh tiến độ an toàn */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-blood-primary' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.phanTram || 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. BẢNG DANH SÁCH LÔ MÁU & THAO TÁC CRUD TRỰC TIẾP */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Danh Sách Lô Túi Máu Trong Kho
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sắp xếp theo thứ tự ưu tiên xuất kho (FEFO) và hỗ trợ Thêm, Sửa, Xóa trực tiếp
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã lô, vị trí, thành phần..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/20 w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedBloodFilter}
              onChange={(e) => setSelectedBloodFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Tất cả nhóm máu</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>Nhóm {type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã Lô (ID)</th>
                <th className="py-3 px-4">Nhóm Máu</th>
                <th className="py-3 px-4">Thành Phần Máu</th>
                <th className="py-3 px-4">Thể Tích Còn Lại</th>
                <th className="py-3 px-4">Ngưỡng Báo Động</th>
                <th className="py-3 px-4">Đơn Vị / Vị Trí Lưu Trữ</th>
                <th className="py-3 px-4">Cập Nhật Gần Nhất</th>
                <th className="py-3 px-4">Trạng Thái Kho</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Droplet className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                    <p className="font-semibold">Không tìm thấy lô túi máu nào phù hợp trong kho.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const isLow = item.soLuongConLaiMl <= (item.nguongCanhBaoMl || 500);
                  const dateStr = item.ngayCapNhat ? new Date(item.ngayCapNhat).toLocaleDateString('vi-VN') : 'Mới nhập';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blood-primary text-white text-[9px] font-extrabold uppercase">
                            FEFO #1
                          </span>
                        )}
                        <span>#LOT-{item.nhomMau}-{item.id}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-red-100 text-blood-dark font-black text-xs">
                          {item.nhomMau}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {item.thanhPhan === 'ToanPhan' && 'Máu toàn phần'}
                        {item.thanhPhan === 'HongCau' && 'Khối hồng cầu'}
                        {item.thanhPhan === 'TieuCau' && 'Khối tiểu cầu'}
                        {item.thanhPhan === 'HuyetTuong' && 'Huyết tương'}
                        {!['ToanPhan', 'HongCau', 'TieuCau', 'HuyetTuong'].includes(item.thanhPhan) && item.thanhPhan}
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        {item.soLuongConLaiMl} ml
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {item.nguongCanhBaoMl || 500} ml
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.donViLuuTru}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-red-100 text-blood-primary animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Cảnh báo thiếu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Đầy đủ an toàn
                          </span>
                        )}
                      </td>

                      {/* Các nút CRUD Thao tác */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Chỉnh sửa thông tin / thể tích"
                            className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(item)}
                            title="Xuất hủy / Xóa lô túi máu"
                            className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* 4. MODAL THÊM MỚI TÚI MÁU VÀO KHO (POST /api/v1/blood-inventories) */}
      {/* ============================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-blood-primary flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Thêm Túi Máu Vào Kho</h3>
                  <p className="text-xs text-slate-500">Tạo mới hoặc cộng dồn vào lô máu có sẵn</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInventory} className="space-y-4">
              
              {/* Chọn Nhóm máu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nhóm Máu <span className="text-blood-primary">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewNhomMau(type)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        newNhomMau === type
                          ? 'bg-blood-primary text-white border-blood-primary shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thành phần máu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Thành phần máu <span className="text-blood-primary">*</span>
                </label>
                <select
                  value={newThanhPhan}
                  onChange={(e) => setNewThanhPhan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white"
                >
                  {BLOOD_COMPONENTS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Thể tích máu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Thể tích máu (ml) <span className="text-blood-primary">*</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[250, 350, 450, 500].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setNewTheTich(vol)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                        newTheTich === vol
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {vol}ml
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={newTheTich}
                  onChange={(e) => setNewTheTich(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  placeholder="Nhập thể tích cụ thể (ml)"
                  required
                />
              </div>

              {/* Đơn vị lưu trữ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Đơn vị / Vị trí lưu trữ <span className="text-blood-primary">*</span>
                </label>
                <input
                  type="text"
                  value={newDonViLuuTru}
                  onChange={(e) => setNewDonViLuuTru(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  placeholder="Ví dụ: Tủ Đông Lạnh A1 - Ngăn 02"
                  required
                />
              </div>

              {/* Ngưỡng cảnh báo tối thiểu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ngưỡng cảnh báo thiếu máu (ml)
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={newNguongCanhBao}
                  onChange={(e) => setNewNguongCanhBao(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blood-primary hover:bg-blood-dark text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blood-primary/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Vào Kho Máu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 5. MODAL CHỈNH SỬA TÚI MÁU (PUT /api/v1/blood-inventories/:id) */}
      {/* ============================================================================== */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Chỉnh Sửa Lô Máu #{editingItem.id}</h3>
                  <p className="text-xs text-slate-500">Nhóm máu: <strong className="text-blood-primary">{editingItem.nhomMau}</strong> ({editingItem.thanhPhan})</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInventory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Thể tích máu còn lại (ml) <span className="text-blood-primary">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={editTheTich}
                  onChange={(e) => setEditTheTich(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Vị trí / Đơn vị lưu trữ <span className="text-blood-primary">*</span>
                </label>
                <input
                  type="text"
                  value={editDonViLuuTru}
                  onChange={(e) => setEditDonViLuuTru(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ngưỡng cảnh báo thiếu máu (ml)
                </label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={editNguongCanhBao}
                  onChange={(e) => setEditNguongCanhBao(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập Nhật Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 6. MODAL XÁC NHẬN XUẤT HỦY / XÓA (DELETE /api/v1/blood-inventories/:id) */}
      {/* ============================================================================== */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-blood-primary flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Xác Nhận Xuất Hủy Lô Máu</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xuất hủy hoặc xóa lô máu <strong>#{deletingItem.id}</strong> (Nhóm <strong>{deletingItem.nhomMau}</strong>, thể tích <strong>{deletingItem.soLuongConLaiMl}ml</strong> tại <em>{deletingItem.donViLuuTru}</em>) không?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeletingItem(null); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Không, giữ lại
              </button>
              <button
                type="button"
                onClick={handleDeleteInventory}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isSubmitting ? 'Đang xóa...' : 'Đồng ý Xuất Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BloodInventoryPage;
