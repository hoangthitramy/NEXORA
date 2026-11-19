import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FolderGit2, CheckCircle, Clock, Check, ArrowRight, UserCheck } from 'lucide-react';

export default function HandoverList() {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/handovers');
      setHandovers(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách phiếu bàn giao:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, []);

  const handleConfirmItem = async (itemId) => {
    try {
      await api.patch(`/handovers/items/${itemId}`, {
        status: 'CONFIRMED',
      });
      await fetchHandovers();
    } catch (err) {
      alert(err.message || 'Lỗi xác nhận mục bàn giao');
    }
  };

  const handleConfirmHandover = async (handoverId) => {
    try {
      await api.post(`/handovers/${handoverId}/confirm`);
      await fetchHandovers();
    } catch (err) {
      alert(err.message || 'Lỗi xác nhận phiếu bàn giao');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Phiếu Bàn giao Công việc & Dự án</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý chi tiết nội dung bàn giao mã nguồn, tài liệu dự án và xác nhận từ người tiếp nhận
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Đang tải danh sách bàn giao...
          </div>
        ) : handovers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Chưa có phiếu bàn giao nào
          </div>
        ) : (
          handovers.map((h) => (
            <div key={h.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-slate-900 text-base">{h.title}</h2>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        h.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {h.status === 'CONFIRMED' ? 'Đã nghiệm thu' : 'Đang bàn giao'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Hồ sơ: <Link to={`/offboarding/${h.requestId}`} className="font-mono text-indigo-600 hover:underline">{h.request?.requestCode}</Link>{' '}
                    • Người thôi việc: <strong className="text-slate-800">{h.request?.employee?.fullName}</strong> ({h.request?.employee?.department?.name})
                  </div>
                </div>

                {h.status !== 'CONFIRMED' && (
                  <button
                    onClick={() => handleConfirmHandover(h.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Xác nhận hoàn tất phiếu</span>
                  </button>
                )}
              </div>

              {/* Items list */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nội dung chi tiết ({h.items?.length || 0} hạng mục)
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {h.items?.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <span>{item.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status === 'CONFIRMED' ? 'Đã nhận bàn giao' : 'Chờ xác nhận'}
                          </span>
                        </div>
                        <div className="text-slate-500 mt-1">{item.description}</div>
                        <div className="text-indigo-600 text-[11px] mt-1 font-medium flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Người tiếp nhận: {item.receiver || 'Chưa chỉ định'}</span>
                        </div>
                      </div>

                      {item.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleConfirmItem(item.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 self-start sm:self-center transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Xác nhận đã nhận</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
