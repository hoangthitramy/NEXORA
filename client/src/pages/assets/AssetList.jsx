import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Laptop, Filter, Search, CheckCircle2, AlertCircle, ArrowDownLeft } from 'lucide-react';

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [returningId, setReturningId] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Bình thường, hoạt động tốt');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/assets', { params });
      setAssets(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh mục tài sản:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter]);

  const handleReturnAsset = async (assignmentId) => {
    try {
      await api.post(`/assets/assignments/${assignmentId}/return`, {
        condition: returnCondition,
        note: 'Đã hoàn tất bàn giao cho bộ phận quản trị thiết bị',
      });
      setReturningId(null);
      await fetchAssets();
    } catch (err) {
      alert(err.message || 'Lỗi khi xác nhận trả tài sản');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tài sản & Thiết bị</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm soát cấp phát, tình trạng vật lý và đối soát thu hồi tài sản khi nhân viên thôi việc
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên máy, mã tài sản, số serial..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ASSIGNED">Đang cấp phát (ASSIGNED)</option>
            <option value="AVAILABLE">Sẵn sàng trong kho (AVAILABLE)</option>
            <option value="MAINTENANCE">Đang bảo trì</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Mã tài sản</th>
              <th className="py-3 px-4">Tên tài sản</th>
              <th className="py-3 px-4">Loại / Serial</th>
              <th className="py-3 px-4">Người đang giữ</th>
              <th className="py-3 px-4">Tình trạng</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  Đang tải danh mục tài sản...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  Không tìm thấy tài sản nào
                </td>
              </tr>
            ) : (
              assets.map((item) => {
                const activeAssignment = item.assignments?.[0];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 text-xs">
                      {item.assetCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                        {item.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      <div>{item.category}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.serialNumber || 'Không serial'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {activeAssignment ? (
                        <div>
                          <div className="font-medium text-slate-900">{activeAssignment.employee?.fullName}</div>
                          <div className="text-[11px] text-slate-400">{activeAssignment.employee?.department?.name}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Trong kho</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {activeAssignment?.condition || 'Mới 100%'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status === 'ASSIGNED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.status === 'ASSIGNED' ? 'Đang cấp phát' : 'Có sẵn'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'ASSIGNED' && activeAssignment && (
                        returningId === activeAssignment.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              value={returnCondition}
                              onChange={(e) => setReturnCondition(e.target.value)}
                              placeholder="Tình trạng..."
                              className="px-2 py-1 text-xs border border-slate-300 rounded"
                            />
                            <button
                              onClick={() => handleReturnAsset(activeAssignment.id)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setReturningId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReturningId(activeAssignment.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded transition"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Thu hồi</span>
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
