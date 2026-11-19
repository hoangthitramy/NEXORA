import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  ShieldCheck,
  Bot,
  LogOut,
  Bell,
  Building2,
  Users,
  UserCog,
  Laptop,
  Key,
  FolderGit2,
  Layers,
  BarChart3,
  Settings,
  X,
  Receipt,
  AlertTriangle,
  Activity,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data || []);
      } catch (err) {
        // Silently catch
      }
    };
    fetchNotifs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resignation', label: 'Đơn xin nghỉ việc', icon: FileSpreadsheet },
    { to: '/offboarding', label: 'Hồ sơ thôi việc', icon: FileText },
    { to: '/tasks', label: 'Nhiệm vụ bàn giao', icon: CheckSquare },
    { to: '/handovers', label: 'Phiếu bàn giao', icon: FolderGit2 },
    { to: '/assets', label: 'Quản lý tài sản', icon: Laptop },
    { to: '/access', label: 'Tài khoản & IT', icon: Key },
    { to: '/finance', label: 'Đối soát tài chính', icon: Receipt },
    { to: '/exceptions', label: 'Sự cố & Ngoại lệ', icon: AlertTriangle },
    { to: '/approvals', label: 'Phê duyệt', icon: ShieldCheck },
    { to: '/ai-assistant', label: 'Trợ lý AI (RAG)', icon: Bot, badge: 'AI' },
    { to: '/employees', label: 'Nhân sự', icon: Users },
    { to: '/templates', label: 'Mẫu quy trình', icon: Layers },
    { to: '/reports', label: 'Báo cáo thống kê', icon: BarChart3 },
    { to: '/audit-logs', label: 'Nhật ký Audit', icon: Activity },
    { to: '/users', label: 'Tài khoản hệ thống', icon: UserCog },
    { to: '/profile', label: 'Hồ sơ cá nhân', icon: UserCheck },
    { to: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
        <Link
          to="/"
          className="h-16 flex items-center px-6 border-b border-slate-800 gap-3 hover:bg-slate-800/40 transition-colors"
          title="Về trang chủ giới thiệu"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
            EC
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
              EXITCONTROL
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-semibold px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Offboarding & Handover</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
            Phân hệ nghiệp vụ
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-800/60 hover:text-white text-slate-300'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini Card */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-85 transition-opacity"
              title="Xem hồ sơ cá nhân"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold text-xs border border-indigo-500/30">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-white truncate">{user?.fullName}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {user?.roles?.[0] || 'User'}
                </div>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-10 shadow-sm relative">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              {user?.organization?.name || 'Tập đoàn Nexora'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Link to Landing Introduction */}
            <Link
              to="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition"
              title="Xem trang giới thiệu hệ thống"
            >
              Trang giới thiệu
            </Link>

            {/* Link to Swagger Docs */}
            <a
              href={typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/api-docs' : 'http://localhost:5050/api-docs'}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 flex items-center gap-1 transition"
            >
              <span>Swagger API</span>
              <span className="text-[10px]">↗</span>
            </a>

            {/* Notification bell & popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              {showNotifPopover && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">Thông báo hệ thống</span>
                    <button
                      onClick={() => setShowNotifPopover(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-indigo-50/50 border border-indigo-100 text-slate-700">
                      <div className="font-semibold text-indigo-900">Hồ sơ thôi việc OFF-2026-001</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Cần đối soát danh mục 02 thiết bị phần cứng và thu hồi quyền AWS Cloud.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Vai trò: {user?.roles?.join(', ') || 'N/A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
