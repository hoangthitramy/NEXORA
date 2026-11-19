import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  UserCheck,
} from 'lucide-react';

export default function ResignationList() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    reason: '',
    resignationDate: new Date().toISOString().split('T')[0],
    lastWorkingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Review Modal
  const [reviewModal, setReviewModal] = useState({
    open: false,
    item: null,
    action: 'APPROVE', // or 'REJECT'
    approverNote: '',
    templateId: '',
  });

  const isManagerOrHR = user?.roles?.some((r) =>
    ['Admin', 'ADMIN', 'HR', 'Manager', 'MANAGER'].includes(r)
  );

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/resignation-requests', { params });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn nghỉ việc:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates');
      setTemplates(res.data || []);
      if (res.data?.length > 0) {
        setReviewModal((prev) => ({ ...prev, templateId: res.data[0].id }));
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTemplates();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!createForm.reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do xin nghỉ việc');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/resignation-requests', createForm);
      setShowCreateModal(false);
      setCreateForm({
        reason: '',
        resignationDate: new Date().toISOString().split('T')[0],
        lastWorkingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
      fetchRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể gửi đơn xin nghỉ việc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModal.item) return;
    try {
      setSubmitting(true);
      await api.post(`/resignation-requests/${reviewModal.item.id}/review`, {
        action: reviewModal.action,
        approverNote: reviewModal.approverNote,
        templateId: reviewModal.templateId,
      });
      setReviewModal({ open: false, item: null, action: 'APPROVE', approverNote: '', templateId: '' });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xử lý đơn');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Chờ phê duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Đã từ chối
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
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
            <FileText className="w-4 h-4" /> Quy trình Nhân sự
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Đơn xin nghỉ việc</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tiếp nhận, xử lý và phê duyệt đơn xin nghỉ việc của nhân viên theo chuẩn SRS v1.0
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nộp đơn xin nghỉ việc
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, nhân viên, lý do..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === '' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Từ chối
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Mã đơn</th>
                <th className="px-5 py-3.5 font-semibold">Nhân viên</th>
                <th className="px-5 py-3.5 font-semibold">Phòng ban</th>
                <th className="px-5 py-3.5 font-semibold">Ngày nộp & Ngày cuối</th>
                <th className="px-5 py-3.5 font-semibold">Lý do</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-2 text-xs">Đang tải danh sách đơn xin nghỉ việc...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Không tìm thấy đơn xin nghỉ việc nào phù hợp.
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-indigo-600">
                      {item.requestCode}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{item.employee?.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.employee?.employeeCode}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.employee?.department?.name || '---'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-700">
                        Nộp: {new Date(item.resignationDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs font-semibold text-rose-600 mt-0.5">
                        Làm cuối: {new Date(item.lastWorkingDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4 text-right">
                      {item.status === 'PENDING' && isManagerOrHR ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setReviewModal({
                                open: true,
                                item,
                                action: 'APPROVE',
                                approverNote: 'Đồng ý phê duyệt và khởi tạo hồ sơ bàn giao',
                                templateId: templates[0]?.id || '',
                              })
                            }
                            className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() =>
                              setReviewModal({
                                open: true,
                                item,
                                action: 'REJECT',
                                approverNote: '',
                                templateId: '',
                              })
                            }
                            className="px-2.5 py-1.5 rounded-md bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-medium cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : item.offboardingRequest ? (
                        <Link
                          to={`/offboarding/${item.offboardingRequest.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Xem hồ sơ <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">---</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Submit Resignation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Nộp đơn xin nghỉ việc
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày gửi đơn
                  </label>
                  <input
                    type="date"
                    value={createForm.resignationDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, resignationDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày làm việc cuối cùng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={createForm.lastWorkingDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lastWorkingDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do xin nghỉ việc <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  placeholder="Mô tả lý do xin nghỉ việc và nguyện vọng bàn giao..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 leading-relaxed">
                ℹ️ Sau khi nộp, quản lý trực tiếp và phòng Nhân sự (HR) sẽ xem xét đơn của bạn. Khi được duyệt, hệ thống sẽ tự động kích hoạt quy trình bàn giao công việc và tài sản.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Review Resignation */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                {reviewModal.action === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Phê duyệt đơn xin nghỉ việc
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" /> Từ chối đơn xin nghỉ việc
                  </>
                )}
              </h3>
              <button
                onClick={() => setReviewModal({ open: false, item: null, action: 'APPROVE', approverNote: '', templateId: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Mã đơn:</span>{' '}
                  <span className="font-mono font-bold text-indigo-600">{reviewModal.item?.requestCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">Nhân viên:</span>{' '}
                  <span className="font-medium text-slate-800">{reviewModal.item?.employee?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Lý do:</span> {reviewModal.item?.reason}
                </div>
              </div>

              {reviewModal.action === 'APPROVE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chọn Mẫu quy trình bàn giao (Task Template)
                  </label>
                  <select
                    value={reviewModal.templateId}
                    onChange={(e) => setReviewModal({ ...reviewModal, templateId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.items?.length || 0} nhiệm vụ)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Hệ thống sẽ tự động tạo hồ sơ Offboarding và khởi tạo các nhiệm vụ tương ứng.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ý kiến phê duyệt / Ghi chú
                </label>
                <textarea
                  rows={3}
                  value={reviewModal.approverNote}
                  onChange={(e) => setReviewModal({ ...reviewModal, approverNote: e.target.value })}
                  placeholder="Ghi nhận ý kiến xử lý..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModal({ open: false, item: null, action: 'APPROVE', approverNote: '', templateId: '' })}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer ${
                    reviewModal.action === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting
                    ? 'Đang xử lý...'
                    : reviewModal.action === 'APPROVE'
                    ? 'Xác nhận duyệt & Mở hồ sơ'
                    : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
