import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User, Mail, Lock, Phone, Briefcase, Building, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    jobTitle: '',
    departmentId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/auth/departments');
        setDepartments(res.data || []);
        if (res.data?.length > 0) {
          setForm((prev) => ({ ...prev, departmentId: res.data[0].id }));
        }
      } catch (err) {
        console.error('Lỗi tải phòng ban:', err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        jobTitle: form.jobTitle,
        departmentId: form.departmentId,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
            <p className="text-xs text-slate-500">Đăng ký tài khoản nhân viên mới</p>
          </div>
        </div>

        {success && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>Đăng ký thành công! Đang chuyển hướng về trang đăng nhập...</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email công ty
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="a.nguyen@exitcontrol.vn"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phòng ban
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Chức vụ
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="Software Engineer"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0901234567"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Xác nhận MK
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
