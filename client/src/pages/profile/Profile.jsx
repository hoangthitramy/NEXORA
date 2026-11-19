import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Phone,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');

  // General profile form
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.employee?.phone || '',
    jobTitle: user?.employee?.jobTitle || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [pwdForm, setPwdForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    // Refresh user info from /auth/me
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          setUser(res.data);
          setProfileForm({
            fullName: res.data.fullName || '',
            phone: res.data.employee?.phone || '',
            jobTitle: res.data.employee?.jobTitle || '',
          });
        }
      } catch (err) {
        // Silently catch
      }
    };
    fetchMe();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      setProfileLoading(true);
      const res = await api.patch('/auth/profile', profileForm);
      setUser(res.data);
      setProfileSuccess('Cập nhật thông tin hồ sơ thành công!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      setPwdError('Mật khẩu mới phải có tối thiểu 8 ký tự');
      return;
    }

    try {
      setPwdLoading(true);
      await api.post('/auth/change-password', {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdSuccess('Đổi mật khẩu thành công! Mật khẩu mới có hiệu lực ngay lập tức.');
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900"></div>
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-4 -mt-12">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md">
              <div className="w-full h-full rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
            <div className="mb-1">
              <h1 className="text-xl font-bold text-slate-900">{user?.fullName}</h1>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {user?.roles?.map((r) => (
              <span
                key={r}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bảo mật & Mật khẩu
        </button>
      </div>

      {/* Tab 1: General Info */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Hồ sơ tài khoản & Nhân sự</h2>
            <span className="text-xs text-slate-400">
              Mã NV: <span className="font-mono font-semibold text-slate-700">{user?.employee?.employeeCode || '---'}</span>
            </span>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email (Định danh đăng nhập)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại liên hệ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: 0901234567"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chức danh / Vị trí công việc
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Senior Software Engineer"
                    value={profileForm.jobTitle}
                    onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-600" /> Đơn vị trực thuộc
              </div>
              <div className="text-slate-600">
                Tổ chức: <span className="font-medium text-slate-900">{user?.organization?.name || 'Tập đoàn Công nghệ Nexora'}</span>
              </div>
              <div className="text-slate-600">
                Phòng ban: <span className="font-medium text-slate-900">{user?.employee?.department?.name || 'Chưa gán phòng ban'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Đổi mật khẩu truy cập</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Mật khẩu mới yêu cầu tối thiểu 8 ký tự để đảm bảo an toàn tài khoản
            </p>
          </div>

          {pwdSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {pwdSuccess}
            </div>
          )}

          {pwdError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {pwdError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={pwdForm.oldPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Tối thiểu 8 ký tự"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwdLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {pwdLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
