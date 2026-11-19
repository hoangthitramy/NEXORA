import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ShieldCheck, Check, X, AlertCircle } from 'lucide-react';

export default function ApprovalList() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [note, setNote] = useState('');

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/approvals/pending');
      setApprovals(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách phê duyệt:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId, isApprove) => {
    try {
      setProcessingId(approvalId);
      const endpoint = isApprove ? `/approvals/${approvalId}/approve` : `/approvals/${approvalId}/reject`;
      await api.post(endpoint, { note: note || (isApprove ? 'Phê duyệt hoàn tất' : 'Từ chối phê duyệt') });
      setNote('');
      await fetchApprovals();
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi phê duyệt');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ chờ bạn Phê duyệt</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kiểm tra các tiêu chí bàn giao công việc, tài sản và xác nhận hoàn tất quy trình
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Đang tải hồ sơ chờ duyệt...
          </div>
        ) : approvals.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Tuyệt vời! Bạn không có hồ sơ nào đang chờ duyệt.</p>
            <p className="text-xs text-slate-400 mt-1">Khi có nhân sự bàn giao đến bước của bạn, hồ sơ sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          approvals.map((appr) => (
            <div key={appr.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600 text-sm">
                      {appr.request?.requestCode}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Bước {appr.step} / 4
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Nhân viên: <strong className="text-slate-800">{appr.request?.employee?.fullName}</strong> ({appr.request?.employee?.employeeCode}) • Phòng: {appr.request?.employee?.department?.name}
                  </div>
                </div>

                <Link
                  to={`/offboarding/${appr.requestId}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Xem chi tiết hồ sơ →
                </Link>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><strong>Nội dung thẩm định:</strong> {appr.note || 'Kiểm tra và xác nhận bàn giao'}</div>
                <div><strong>Lý do thôi việc:</strong> {appr.request?.reason}</div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <input
                  type="text"
                  placeholder="Ghi chú thẩm định (tùy chọn)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(appr.id, false)}
                    disabled={processingId === appr.id}
                    className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Từ chối</span>
                  </button>
                  <button
                    onClick={() => handleAction(appr.id, true)}
                    disabled={processingId === appr.id}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{processingId === appr.id ? 'Đang xử lý...' : 'Phê duyệt'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
