import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Code,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AuditLogList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 20 };
      if (search) params.search = search;
      const res = await api.get('/audit-logs', { params });
      if (res.data) {
        setLogs(res.data.data || []);
        setPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký kiểm toán:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const getActionBadge = (action) => {
    if (action.includes('CREATE') || action.includes('SUBMIT')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {action}
        </span>
      );
    }
    if (action.includes('APPROVE') || action.includes('CLEAR') || action.includes('RESOLVE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {action}
        </span>
      );
    }
    if (action.includes('REJECT') || action.includes('REVOKE') || action.includes('DELETE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
            <Activity className="w-4 h-4" /> Bảo mật & Tuân thủ
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Nhật ký kiểm toán hệ thống (Audit Logs)</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Lưu vết toàn bộ thao tác: đăng ký, phê duyệt, thu hồi tài khoản, hoàn tất tài sản, đối soát và xử lý ngoại lệ
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-slate-900">{total}</div>
          <div className="text-xs text-slate-400">bản ghi được ghi nhận</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo hành động, thực thể, email, mã hồ sơ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Thời gian</th>
                <th className="px-5 py-3.5 font-semibold">Hành động</th>
                <th className="px-5 py-3.5 font-semibold">Thực thể</th>
                <th className="px-5 py-3.5 font-semibold">Người thực hiện</th>
                <th className="px-5 py-3.5 font-semibold">Hồ sơ liên quan</th>
                <th className="px-5 py-3.5 font-semibold text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500 font-sans">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-2 text-xs">Đang tải nhật ký kiểm toán...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500 font-sans">
                    <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Không tìm thấy bản ghi kiểm toán nào.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">{getActionBadge(item.action)}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">{item.entity}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-sans">
                      {item.user ? (
                        <div>
                          <div className="font-semibold text-xs">{item.user.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{item.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">System</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-indigo-600">
                      {item.request?.requestCode || '---'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Trang {page} / {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" /> Chi tiết thay đổi dữ liệu (Audit Diff)
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400">Action:</span> {selectedLog.action}
                </div>
                <div>
                  <span className="text-slate-400">Entity:</span> {selectedLog.entity}
                </div>
                <div>
                  <span className="text-slate-400">User:</span> {selectedLog.user?.fullName || 'System'}
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span>{' '}
                  {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              {selectedLog.oldValue && (
                <div>
                  <div className="text-xs font-semibold text-rose-700 mb-1 flex items-center gap-1">
                    Giá trị trước thay đổi (Old Value):
                  </div>
                  <pre className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg text-xs font-mono text-rose-900 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                    Giá trị sau thay đổi (New Value):
                  </div>
                  <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-900 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
