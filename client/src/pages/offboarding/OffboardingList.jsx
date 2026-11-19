import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Plus, Filter, AlertCircle, Eye, Calendar, User } from 'lucide-react';

export default function OffboardingList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/offboarding', { params });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách hồ sơ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">Bản nháp</span>;
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">Đã gửi</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Đang bàn giao</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700">Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">Đã duyệt</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Hoàn tất</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700">Từ chối</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">Cao</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">Trung bình</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">Thấp</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ thôi việc & Bàn giao</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý tập trung toàn bộ tiến trình bàn giao công việc và thu hồi tài nguyên
          </p>
        </div>
        <Link
          to="/offboarding/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo hồ sơ thôi việc</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã hồ sơ, tên nhân viên, mã nhân viên..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="SUBMITTED">Đã gửi</option>
            <option value="IN_PROGRESS">Đang bàn giao</option>
            <option value="PENDING_APPROVAL">Chờ phê duyệt</option>
            <option value="COMPLETED">Đã hoàn tất</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Mã hồ sơ</th>
              <th className="py-3 px-4">Nhân sự thôi việc</th>
              <th className="py-3 px-4">Phòng ban</th>
              <th className="py-3 px-4">Ngày làm việc cuối</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Rủi ro (AI)</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  Đang tải dữ liệu hồ sơ...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  Không tìm thấy hồ sơ nghỉ việc nào
                </td>
              </tr>
            ) : (
              requests.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-indigo-600">
                    <Link to={`/offboarding/${item.id}`} className="hover:underline">
                      {item.requestCode}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{item.employee?.fullName}</div>
                    <div className="text-xs text-slate-400">{item.employee?.employeeCode} • {item.employee?.jobTitle}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {item.employee?.department?.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {new Date(item.lastWorkingDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getRiskBadge(item.riskLevel)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/offboarding/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
