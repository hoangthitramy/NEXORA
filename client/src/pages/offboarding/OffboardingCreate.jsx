import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function OffboardingCreate() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    employeeId: '',
    reason: 'Chuyển định hướng nghề nghiệp và kế hoạch cá nhân',
    resignationDate: new Date().toISOString().split('T')[0],
    lastWorkingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    templateId: 'default-tech-template-uuid',
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees');
        setEmployees(res.data || []);
        if (res.data?.length > 0) {
          setForm((prev) => ({ ...prev, employeeId: res.data[0].id }));
        }
      } catch (err) {
        console.error('Lỗi tải nhân viên:', err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/offboarding', form);
      navigate(`/offboarding/${res.data.id}`);
    } catch (err) {
      setError(err.message || 'Lỗi tạo hồ sơ thôi việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/offboarding"
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tạo mới Hồ sơ Thôi việc</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Khởi tạo quy trình bàn giao công việc và thu hồi tài nguyên
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Chọn nhân sự thôi việc
          </label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.employeeCode}) - {emp.department?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Ngày nộp đơn thôi việc
            </label>
            <input
              type="date"
              value={form.resignationDate}
              onChange={(e) => setForm({ ...form, resignationDate: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
              Ngày làm việc cuối cùng
            </label>
            <input
              type="date"
              value={form.lastWorkingDate}
              onChange={(e) => setForm({ ...form, lastWorkingDate: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Mẫu quy trình bàn giao áp dụng
          </label>
          <select
            value={form.templateId}
            onChange={(e) => setForm({ ...form, templateId: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="default-tech-template-uuid">
              Quy trình chuẩn bàn giao Khối Công nghệ & Văn phòng (5 bước tiêu chuẩn)
            </option>
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            * Hệ thống sẽ tự động tạo checklist công việc và phân công phụ trách phòng ban dựa trên mẫu này.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
            Lý do thôi việc
          </label>
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập lý do thôi việc..."
          ></textarea>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
          <Link
            to="/offboarding"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Đang tạo...' : 'Tạo hồ sơ bàn giao'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
