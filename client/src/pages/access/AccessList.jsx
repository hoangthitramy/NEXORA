import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Key, ShieldAlert, CheckCircle2, Search, Filter, Lock } from 'lucide-react';

export default function AccessList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemFilter, setSystemFilter] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (systemFilter) params.systemName = systemFilter;
      const res = await api.get('/access/accounts', { params });
      setAccounts(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách tài khoản:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [systemFilter]);

  const handleRevoke = async (revocationId) => {
    try {
      await api.patch(`/access/revocations/${revocationId}/status`, {
        status: 'REVOKED',
        note: 'Đã vô hiệu hóa tài khoản và xóa 2FA/SSH keys',
      });
      await fetchAccounts();
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái thu hồi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tài khoản Hệ thống & Thu hồi Quyền</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi danh mục tài khoản Cloud, SSO, GitHub, Google Workspace và quản lý vô hiệu hóa quyền truy cập
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value)}
            className="py-2 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả hệ thống</option>
            <option value="Google Workspace">Google Workspace</option>
            <option value="GitHub Enterprise">GitHub Enterprise</option>
            <option value="AWS Cloud Production/Staging">AWS Cloud</option>
            <option value="Slack Nexora HQ">Slack</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Hệ thống</th>
              <th className="py-3 px-4">Tên tài khoản / Email</th>
              <th className="py-3 px-4">Mã nhân sự</th>
              <th className="py-3 px-4">Trạng thái tài khoản</th>
              <th className="py-3 px-4">Tiến độ thu hồi (Offboarding)</th>
              <th className="py-3 px-4 text-right">Thao tác IT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Đang tải danh sách tài khoản...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Không tìm thấy tài khoản nào
                </td>
              </tr>
            ) : (
              accounts.map((acc) => {
                const activeRevocation = acc.revocations?.[0];
                return (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-xs text-slate-900">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{acc.systemName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                      <div>{acc.accountName}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{acc.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {acc.employeeCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          acc.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {activeRevocation ? (
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              activeRevocation.status === 'REVOKED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {activeRevocation.status === 'REVOKED' ? 'Đã thu hồi quyền' : 'Chờ thu hồi'}
                          </span>
                          {activeRevocation.performedBy && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              Bởi: {activeRevocation.performedBy}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Không có yêu cầu</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {activeRevocation && activeRevocation.status === 'PENDING' && (
                        <button
                          onClick={() => handleRevoke(activeRevocation.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded shadow-sm transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Vô hiệu hóa ngay</span>
                        </button>
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
