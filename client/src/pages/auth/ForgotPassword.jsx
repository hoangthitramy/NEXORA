import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Mail, Lock, Key, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: enter email, 2: enter reset token and new password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Request reset code
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResetToken(res.data.resetToken || '');
      setSuccessMsg('Đã tạo mã xác thực đặt lại mật khẩu thành công!');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Không tìm thấy tài khoản với email này.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
      });

      setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            EC
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">EXITCONTROL</h1>
            <p className="text-xs text-slate-500">Khôi phục mật khẩu tài khoản</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Input Email */
          <form onSubmit={handleRequestToken} className="space-y-4">
            <p className="text-xs text-slate-600">
              Nhập email đăng ký tài khoản của bạn. Hệ thống sẽ tạo mã xác thực bảo mật để đặt lại mật khẩu.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email tài khoản
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? 'Đang kiểm tra...' : 'Tiếp tục nhận mã xác nhận'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Input Token and New Password */
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mã xác thực bảo mật (Token)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Dán mã xác nhận tại đây..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {loading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
