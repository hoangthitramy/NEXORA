import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, UserPlus, Shield, Building, Mail, Phone, Lock, CheckCircle2, AlertCircle, X, Search } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    roleName: 'Employee',
    departmentId: '',
    jobTitle: '',
    phone: '',
  });

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [resUsers, resDepts] = await Promise.all([
        api.get('/users'),
        api.get('/auth/departments'),
      ]);
      setUsers(resUsers.data || []);
      setDepartments(resDepts.data || []);
      if (resDepts.data?.length > 0) {
        setForm((prev) => ({ ...prev, departmentId: resDepts.data[0].id }));
      }
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      await fetchUsers();
    } catch (err) {
      alert(err.message || 'Lỗi thay đổi trạng thái tài khoản');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setCreating(true);
      await api.post('/users', form);
      setSuccess('Đã tạo tài khoản thành công!');
      setShowCreateModal(false);
      setForm({
        fullName: '',
        email: '',
        password: '',
        roleName: 'Employee',
        departmentId: departments[0]?.id || '',
        jobTitle: '',
        phone: '',
      });
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Lỗi tạo tài khoản');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.employee?.employeeCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tài khoản & Phân quyền</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị toàn bộ tài khoản đăng nhập, gán vai trò hệ thống và hồ sơ nhân sự
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setSuccess('');
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tạo tài khoản mới</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, email hoặc mã nhân viên..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Họ và tên</th>
              <th className="py-3 px-4">Email đăng nhập</th>
              <th className="py-3 px-4">Vai trò (Role)</th>
              <th className="py-3 px-4">Phòng ban</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Đang tải danh sách tài khoản...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Không tìm thấy tài khoản nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const roleNames = u.userRoles?.map((ur) => ur.role?.name).join(', ') || 'Employee';
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-slate-900">{u.fullName}</div>
                      {u.employee?.employeeCode && (
                        <div className="text-[10px] text-slate-400 font-mono">{u.employee.employeeCode} • {u.employee.jobTitle}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {roleNames}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {u.employee?.department?.name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                          u.isActive
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Tạo mới Tài khoản người dùng</span>
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Lê Thị B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="b.le@exitcontrol.vn"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                  Mật khẩu khởi tạo
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mật khẩu ban đầu (mặc định: Password123!)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Vai trò (Role)
                  </label>
                  <select
                    value={form.roleName}
                    onChange={(e) => setForm({ ...form, roleName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Employee">Nhân viên (Employee)</option>
                    <option value="Manager">Quản lý (Manager)</option>
                    <option value="IT">IT Quản trị (IT Lead)</option>
                    <option value="Kế toán">Kế toán (Accountant)</option>
                    <option value="HR">Nhân sự (HR Manager)</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Phòng ban
                  </label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Chức danh
                  </label>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    placeholder="VD: Senior Analyst"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
