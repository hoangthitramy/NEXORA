import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  ShieldAlert,
  CheckCircle,
  Clock,
  Printer,
  Building,
} from 'lucide-react';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/analytics');
        setReport(res.data);
      } catch (err) {
        console.error('Lỗi tải báo cáo:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Đang khởi tạo báo cáo phân tích...</div>;
  }

  const { summary, statusCounts, riskCounts, deptBreakdown } = report || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo cáo Phân tích & Kiểm toán Bàn giao</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng hợp dữ liệu đối soát tỷ lệ hoàn tất công việc, mức độ an toàn tài sản và rủi ro nhân sự
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>In / Xuất PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng hồ sơ tiếp nhận</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary?.totalRequests || 0}</p>
          <div className="text-[11px] text-slate-400 mt-1">Trên toàn hệ thống</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ xong nhiệm vụ</p>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{summary?.taskCompletionRate || 0}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${summary?.taskCompletionRate || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ thu hồi quyền IT</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{summary?.accessRevocationRate || 0}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${summary?.accessRevocationRate || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nhiệm vụ quá hạn SLA</p>
          <p className="text-2xl font-bold text-rose-600 mt-2">{summary?.overdueTasks || 0}</p>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">Cần đốc thúc xử lý</div>
        </div>
      </div>

      {/* Grid: Risk & Department breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Phân bổ hồ sơ thôi việc theo Phòng ban</span>
            </h3>
          </div>

          <div className="space-y-4">
            {deptBreakdown?.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có dữ liệu phòng ban</p>
            ) : (
              deptBreakdown?.map((d, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{d.department}</span>
                    <span className="text-slate-500">{d.completed} / {d.total} hoàn tất</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${d.total ? Math.round((d.completed / d.total) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Phân loại rủi ro bảo mật & bàn giao (AI)</span>
            </h3>
          </div>

          <div className="space-y-3">
            {riskCounts?.map((r, idx) => {
              const isHigh = r.riskLevel === 'HIGH';
              const isMed = r.riskLevel === 'MEDIUM';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border flex items-center justify-between text-xs ${
                    isHigh
                      ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                      : isMed
                      ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>Mức độ rủi ro: {r.riskLevel}</span>
                  </div>
                  <span className="text-sm font-bold">{r.count} hồ sơ</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
