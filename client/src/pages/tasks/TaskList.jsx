import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckSquare, Filter, CheckCircle2, Clock } from 'lucide-react';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/tasks', { params });
      setTasks(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách nhiệm vụ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const toggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: nextStatus });
      await fetchTasks();
    } catch (err) {
      console.error('Lỗi đổi trạng thái nhiệm vụ:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nhiệm vụ Bàn giao & Thu hồi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tất cả nhiệm vụ thuộc các hồ sơ nghỉ việc đang được phân công
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="TODO">Chưa thực hiện (TODO)</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="COMPLETED">Đã hoàn tất</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Hoàn tất</th>
              <th className="py-3 px-4">Tên nhiệm vụ</th>
              <th className="py-3 px-4">Hồ sơ liên quan</th>
              <th className="py-3 px-4">Người phụ trách</th>
              <th className="py-3 px-4">Thời hạn (Due Date)</th>
              <th className="py-3 px-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Đang tải nhiệm vụ...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Không có nhiệm vụ nào
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      onChange={() => toggleStatus(task.id, task.status)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className={`font-semibold text-xs ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono">
                    <Link to={`/offboarding/${task.requestId}`} className="text-indigo-600 hover:underline">
                      {task.request?.requestCode}
                    </Link>
                    <div className="text-[11px] text-slate-400 font-sans">{task.request?.employee?.fullName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {task.assignee?.fullName || 'Chưa giao'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
