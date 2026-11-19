import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Edit3,
  Receipt,
  CreditCard,
  Wallet,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';

export default function FinanceList() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Reconcile Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalForm, setModalForm] = useState({
    advanceAmount: 0,
    debtAmount: 0,
    unsettledExpense: 0,
    status: 'PENDING',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const isAccountantOrAdmin = user?.roles?.some((r) =>
    ['Admin', 'ADMIN', 'Kế toán', 'ACCOUNTANT', 'Accountant'].includes(r)
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/finance', { params });
      setRecords(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đối soát tài chính:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    setModalForm({
      advanceAmount: Number(record.advanceAmount) || 0,
      debtAmount: Number(record.debtAmount) || 0,
      unsettledExpense: Number(record.unsettledExpense) || 0,
      status: record.status || 'PENDING',
      note: record.note || '',
    });
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      setSubmitting(true);
      await api.patch(`/finance/${selectedRecord.id}`, modalForm);
      setSelectedRecord(null);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật đối soát tài chính');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalAdvance = records.reduce((acc, r) => acc + Number(r.advanceAmount || 0), 0);
  const totalDebt = records.reduce((acc, r) => acc + Number(r.debtAmount || 0), 0);
  const totalUnsettled = records.reduce((acc, r) => acc + Number(r.unsettledExpense || 0), 0);
  const totalDeductions = records.reduce((acc, r) => acc + Number(r.totalDeduction || 0), 0);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CLEARED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã quyết toán
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Có tranh chấp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Chờ đối soát
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
            <Receipt className="w-4 h-4" /> Phân hệ Kế toán & Tài chính
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Đối soát & Quyết toán công nợ</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Kiểm tra tạm ứng, công nợ thiết bị, các khoản chi phí tồn đọng và khấu trừ lương cuối cùng
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          Phân quyền Kế toán & Ban Quản trị
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng tiền tạm ứng</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">{formatVND(totalAdvance)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Các khoản tạm ứng chưa thanh toán</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Công nợ thiết bị/tài sản</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600 mt-2">{formatVND(totalDebt)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Bồi thường tài sản hỏng/mất</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Chi phí chưa thanh toán</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600 mt-2">{formatVND(totalUnsettled)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Công tác phí, hóa đơn bổ sung</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng tiền khấu trừ</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600 mt-2">{formatVND(totalDeductions)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Khấu trừ vào kỳ lương cuối</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã hồ sơ, tên nhân viên, ghi chú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === '' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chờ đối soát
          </button>
          <button
            onClick={() => setStatusFilter('CLEARED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'CLEARED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã quyết toán
          </button>
          <button
            onClick={() => setStatusFilter('DISPUTED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'DISPUTED' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tranh chấp
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Hồ sơ</th>
                <th className="px-5 py-3.5 font-semibold">Nhân viên</th>
                <th className="px-5 py-3.5 font-semibold">Tạm ứng</th>
                <th className="px-5 py-3.5 font-semibold">Nợ thiết bị</th>
                <th className="px-5 py-3.5 font-semibold">Chưa thanh toán</th>
                <th className="px-5 py-3.5 font-semibold">Tổng khấu trừ</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold">Quyết toán bởi</th>
                <th className="px-5 py-3.5 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-2 text-xs">Đang tải dữ liệu đối soát tài chính...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Không tìm thấy bản ghi đối soát tài chính nào.
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-indigo-600">
                      <Link
                        to={`/offboarding/${item.request?.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        {item.request?.requestCode}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {item.request?.employee?.fullName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.request?.employee?.department?.name || '---'}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700">
                      {formatVND(item.advanceAmount)}
                    </td>
                    <td className="px-5 py-4 font-mono text-amber-700">
                      {formatVND(item.debtAmount)}
                    </td>
                    <td className="px-5 py-4 font-mono text-blue-700">
                      {formatVND(item.unsettledExpense)}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-rose-600">
                      {formatVND(item.totalDeduction)}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {item.clearedBy ? (
                        <div>
                          <div className="font-medium text-slate-800">{item.clearedBy}</div>
                          <div className="text-[11px] text-slate-400">
                            {item.clearedAt ? new Date(item.clearedAt).toLocaleDateString('vi-VN') : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Chưa đối soát</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isAccountantOrAdmin ? (
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Đối soát
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconcile Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" /> Đối soát tài chính nhân sự
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Mã hồ sơ:</span>{' '}
                  <span className="font-mono font-bold text-indigo-600">
                    {selectedRecord.request?.requestCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Nhân viên:</span>{' '}
                  <span className="font-medium text-slate-800">
                    {selectedRecord.request?.employee?.fullName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiền tạm ứng (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={modalForm.advanceAmount}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, advanceAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nợ tài sản (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={modalForm.debtAmount}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, debtAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chưa TT (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={modalForm.unsettledExpense}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, unsettledExpense: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200/80 flex items-center justify-between">
                <span className="text-xs font-medium text-rose-900">Tổng tiền khấu trừ dự kiến:</span>
                <span className="text-base font-bold font-mono text-rose-700">
                  {formatVND(
                    (Number(modalForm.advanceAmount) || 0) +
                      (Number(modalForm.debtAmount) || 0) +
                      (Number(modalForm.unsettledExpense) || 0)
                  )}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái đối soát
                </label>
                <select
                  value={modalForm.status}
                  onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PENDING">Chờ đối soát (PENDING)</option>
                  <option value="CLEARED">Đã quyết toán & Cấn trừ xong (CLEARED)</option>
                  <option value="DISPUTED">Đang có tranh chấp / Khiếu nại (DISPUTED)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú kế toán
                </label>
                <textarea
                  rows={3}
                  value={modalForm.note}
                  onChange={(e) => setModalForm({ ...modalForm, note: e.target.value })}
                  placeholder="Ghi nhận phương thức cấn trừ, hóa đơn chứng từ liên quan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu kết quả đối soát'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
