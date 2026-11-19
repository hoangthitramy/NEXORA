import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  User,
  Activity,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/dashboard/overview');
        setStats(res.data);
      } catch (err) {
        console.error('Lỗi tải thống kê dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tổng hồ sơ nghỉ việc',
      value: stats?.totalRequests || 0,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Đang xử lý bàn giao',
      value: stats?.inProgressRequests || 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Chờ cấp thẩm quyền duyệt',
      value: stats?.pendingApprovalRequests || 0,
      icon: ShieldAlert,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      label: 'Đã hoàn tất bàn giao',
      value: stats?.completedRequests || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Quản trị Bàn giao</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tập trung tiến độ bàn giao công việc, thu hồi thiết bị và tài khoản
          </p>
        </div>
        <Link
          to="/offboarding/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <span>Tạo hồ sơ mới</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Risk Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 rounded-r-xl bg-white shadow-sm flex items-start gap-4">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Cảnh báo từ AI Assistant & Kiểm soát rủi ro
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Khuyến nghị
            </span>
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            Phát hiện 01 hồ sơ thôi việc của nhân viên khối Kỹ thuật (OFF-2026-001) đang nắm quyền quản trị AWS IAM Cloud Production và 02 thiết bị phần cứng giá trị cao chưa xác nhận thu hồi.
          </p>
        </div>
        <Link
          to="/offboarding"
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline flex items-center gap-1"
        >
          Xem chi tiết
        </Link>
      </div>

      {/* Two columns: Recent Activities & Process Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Audit Log Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Nhật ký hoạt động kiểm soát (Audit Trail)</h3>
            </div>
            <span className="text-xs text-slate-400">Thời gian thực</span>
          </div>

          <div className="space-y-4">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800">{act.user?.fullName}</span>{' '}
                    <span className="text-slate-500">đã thực hiện</span>{' '}
                    <span className="font-medium text-indigo-600">{act.action}</span>{' '}
                    {act.request?.requestCode && (
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                        {act.request.requestCode}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(act.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Chưa có hoạt động nào được ghi nhận</p>
            )}
          </div>
        </div>

        {/* Right: Quick Guide & SLA */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Quy chuẩn thời hạn bàn giao</h3>
          <ul className="text-xs space-y-3 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></span>
              <span><strong>Mã nguồn & Tài liệu:</strong> Hoàn tất tối thiểu 05 ngày trước ngày làm việc cuối.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></span>
              <span><strong>Tài sản & Thiết bị:</strong> IT kiểm tra và thu hồi trước 16h00 ngày cuối.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></span>
              <span><strong>Tài khoản hệ thống:</strong> Vô hiệu hóa lúc 17h30 ngày làm việc cuối.</span>
            </li>
          </ul>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <strong>Nguyên tắc:</strong> Mọi thao tác phê duyệt là bất biến và được ghi vết minh bạch trong Audit Log.
          </div>
        </div>
      </div>
    </div>
  );
}
