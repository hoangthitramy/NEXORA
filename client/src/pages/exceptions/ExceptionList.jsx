import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ExternalLink,
  Laptop,
  Key,
  FolderGit2,
  Receipt,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

export default function ExceptionList() {
  const { user } = useAuthStore();
  const [exceptions, setExceptions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    requestId: '',
    title: '',
    description: '',
    type: 'ASSET_LOST',
    priority: 'MEDIUM',
    assignedTo: '',
  });

  // Resolve Modal
  const [selectedException, setSelectedException] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    status: 'RESOLVED',
    resolutionNote: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await api.get('/exceptions', { params });
      setExceptions(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách ngoại lệ:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffboardingRequests = async () => {
    try {
      const res = await api.get('/offboarding');
      setRequests(res.data || []);
      if (res.data?.length > 0 && !createForm.requestId) {
        setCreateForm((prev) => ({ ...prev, requestId: res.data[0].id }));
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchExceptions();
    fetchOffboardingRequests();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExceptions();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.requestId) {
      alert('Vui lòng chọn hồ sơ và nhập tiêu đề sự cố');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/exceptions', createForm);
      setShowCreateModal(false);
      setCreateForm({
        requestId: requests[0]?.id || '',
        title: '',
        description: '',
        type: 'ASSET_LOST',
        priority: 'MEDIUM',
        assignedTo: '',
      });
      fetchExceptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi ghi nhận ngoại lệ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedException) return;
    try {
      setSubmitting(true);
      await api.patch(`/exceptions/${selectedException.id}/resolve`, resolveForm);
      setSelectedException(null);
      fetchExceptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật giải quyết');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'ASSET_LOST':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Laptop className="w-3 h-3" /> Mất/Hỏng tài sản
          </span>
        );
      case 'ACCOUNT_BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            <Key className="w-3 h-3" /> Lỗi thu hồi tài khoản
          </span>
        );
      case 'HANDOVER_DELAYED':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <FolderGit2 className="w-3 h-3" /> Chậm trễ bàn giao
          </span>
        );
      case 'DEBT_UNRESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
            <Receipt className="w-3 h-3" /> Tranh chấp công nợ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            <HelpCircle className="w-3 h-3" /> Sự cố khác
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-600 text-white animate-pulse">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-700 border border-rose-200">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700 border border-amber-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã giải quyết
          </span>
        );
      case 'EXEMPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Miễn trừ trách nhiệm
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3.5 h-3.5" /> Đang mở (Cần xử lý)
          </span>
        );
    }
  };

  // Metrics
  const openCount = exceptions.filter((e) => e.status === 'OPEN').length;
  const criticalCount = exceptions.filter((e) => ['CRITICAL', 'HIGH'].includes(e.priority) && e.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4" /> Kiểm soát rủi ro & Sự cố
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Sự cố & Ngoại lệ quy trình</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Quản lý các sự cố phát sinh: mất mát tài sản, kẹt tài khoản IT, chậm bàn giao tài liệu, tranh chấp công nợ
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Báo cáo sự cố ngoại lệ
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tổng số ngoại lệ đã ghi nhận</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{exceptions.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Toàn bộ vòng đời offboarding</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Đang mở & Chưa giải quyết</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{openCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Cần người phụ trách xử lý ngay</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Mức độ nghiêm trọng (High/Critical)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{criticalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ảnh hưởng trực tiếp đến thời hạn bàn giao</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, mô tả, nhân viên, mã hồ sơ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            <option value="">Tất cả mức độ</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

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
              onClick={() => setStatusFilter('OPEN')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'OPEN' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang mở
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã giải quyết
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
                <th className="px-5 py-3.5 font-semibold">Hồ sơ</th>
                <th className="px-5 py-3.5 font-semibold">Tiêu đề sự cố</th>
                <th className="px-5 py-3.5 font-semibold">Phân loại</th>
                <th className="px-5 py-3.5 font-semibold">Mức độ</th>
                <th className="px-5 py-3.5 font-semibold">Người xử lý</th>
                <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-rose-600 border-t-transparent"></div>
                    <p className="mt-2 text-xs">Đang tải danh sách sự cố ngoại lệ...</p>
                  </td>
                </tr>
              ) : exceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Không tìm thấy sự cố ngoại lệ nào.
                  </td>
                </tr>
              ) : (
                exceptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-indigo-600">
                      <Link
                        to={`/offboarding/${item.request?.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        {item.request?.requestCode}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.request?.employee?.fullName}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 max-w-sm truncate" title={item.description}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">{getTypeBadge(item.type)}</td>
                    <td className="px-5 py-4">{getPriorityBadge(item.priority)}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {item.assignedTo || item.resolvedBy || 'Chưa phân công'}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4 text-right">
                      {item.status === 'OPEN' ? (
                        <button
                          onClick={() => {
                            setSelectedException(item);
                            setResolveForm({
                              status: 'RESOLVED',
                              resolutionNote: '',
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs transition-colors cursor-pointer"
                        >
                          Xử lý sự cố
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Báo cáo sự cố ngoại lệ
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn hồ sơ bàn giao nghỉ việc <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createForm.requestId}
                  onChange={(e) => setCreateForm({ ...createForm, requestId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                >
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.requestCode} - {r.employee?.fullName} ({r.employee?.department?.name || '---'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề sự cố / Vấn đề phát sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mất laptop công ty, Không thể xóa tài khoản AWS..."
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phân loại sự cố
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="ASSET_LOST">Mất mát/Hỏng tài sản</option>
                    <option value="ACCOUNT_BLOCKED">Kẹt/Lỗi thu hồi tài khoản</option>
                    <option value="HANDOVER_DELAYED">Chậm trễ bàn giao công việc</option>
                    <option value="DEBT_UNRESOLVED">Tranh chấp công nợ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="LOW">Thấp (Low)</option>
                    <option value="MEDIUM">Trung bình (Medium)</option>
                    <option value="HIGH">Cao (High)</option>
                    <option value="CRITICAL">Khẩn cấp (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bộ phận / Cá nhân phụ trách xử lý
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: IT Support, Ban Nhân sự, Kế toán..."
                  value={createForm.assignedTo}
                  onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chi tiết mô tả sự cố
                </label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Ghi nhận hiện trạng, nguyên nhân và các yêu cầu liên quan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Ghi nhận sự cố'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Giải quyết sự cố ngoại lệ
              </h3>
              <button
                onClick={() => setSelectedException(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{selectedException.title}</div>
                <div className="text-slate-600">
                  Hồ sơ: <span className="font-mono">{selectedException.request?.requestCode}</span> - {selectedException.request?.employee?.fullName}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kết quả xử lý
                </label>
                <select
                  value={resolveForm.status}
                  onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="RESOLVED">Đã giải quyết hoàn tất (RESOLVED)</option>
                  <option value="EXEMPTED">Miễn trừ trách nhiệm đặc biệt (EXEMPTED)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phương án & Biên bản giải quyết
                </label>
                <textarea
                  rows={4}
                  value={resolveForm.resolutionNote}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionNote: e.target.value })}
                  placeholder="Ghi rõ phương án đã thống nhất (ví dụ: cấn trừ lương, bồi thường, ký cam kết bảo mật bổ sung)..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedException(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Xác nhận giải quyết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
