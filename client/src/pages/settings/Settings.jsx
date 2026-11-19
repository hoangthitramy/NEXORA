import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import { Settings as SettingsIcon, Lock, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      setMessage('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt Tài khoản & Hệ thống</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin bảo mật cá nhân, vai trò phân quyền và cấu hình doanh nghiệp
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: User & Org Summary */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Hồ sơ người dùng</span>
            </h3>
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div>
                <span className="text-slate-400">Họ và tên:</span>
                <div className="font-semibold text-slate-800">{user?.fullName}</div>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <div className="font-semibold text-slate-800">{user?.email}</div>
              </div>
              <div>
                <span className="text-slate-400">Doanh nghiệp:</span>
                <div className="font-semibold text-slate-800">{user?.organization?.name}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Vai trò & Phân quyền</span>
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              {user?.roles?.map((r, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Change Password */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Đổi mật khẩu tài khoản</h3>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới (tối thiểu 6 ký tự)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
