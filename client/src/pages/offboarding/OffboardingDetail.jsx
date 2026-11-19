import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  Bot,
  Activity,
  Laptop,
  Key,
  FolderGit2,
  Send,
  Upload,
  Trash2,
  Lock,
  ArrowDownLeft,
  MessageSquare,
  Receipt,
  Plus,
  ExternalLink,
} from 'lucide-react';

export default function OffboardingDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyzing, setAnalyzing] = useState(false);

  // New Comment state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Document Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('HANDOVER');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [resDetail, resProgress] = await Promise.all([
        api.get(`/offboarding/${id}`),
        api.get(`/offboarding/${id}/progress`),
      ]);
      setData(resDetail.data);
      setProgress(resProgress.data);
    } catch (err) {
      console.error('Lỗi tải chi tiết hồ sơ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleRunAIAnalysis = async () => {
    try {
      setAnalyzing(true);
      await api.post(`/ai/analyze/${id}`);
      await fetchDetail();
    } catch (err) {
      console.error('Lỗi chạy phân tích AI:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: nextStatus });
      await fetchDetail();
    } catch (err) {
      console.error('Lỗi cập nhật nhiệm vụ:', err);
    }
  };

  const handleRevokeAccount = async (revocationId) => {
    try {
      await api.patch(`/access/revocations/${revocationId}/status`, {
        status: 'REVOKED',
        note: 'Đã hoàn tất thu hồi quyền truy cập hệ thống',
      });
      await fetchDetail();
    } catch (err) {
      alert(err.message || 'Lỗi khi thu hồi tài khoản');
    }
  };

  const handleReturnAsset = async (assignmentId) => {
    try {
      await api.post(`/assets/assignments/${assignmentId}/return`, {
        condition: 'Bình thường, đã bàn giao đủ phụ kiện',
        note: 'Xác nhận thu hồi thiết bị phục vụ offboarding',
      });
      await fetchDetail();
    } catch (err) {
      alert(err.message || 'Lỗi khi thu hồi tài sản');
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      await api.post(`/offboarding/${id}/comments`, { content: commentText });
      setCommentText('');
      await fetchDetail();
    } catch (err) {
      alert(err.message || 'Lỗi gửi trao đổi');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', docType);
      formData.append('name', selectedFile.name);

      await api.post(`/offboarding/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSelectedFile(null);
      await fetchDetail();
    } catch (err) {
      alert(err.message || 'Lỗi upload tài liệu');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      await fetchDetail();
    } catch (err) {
      alert(err.message || 'Lỗi xóa tài liệu');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Đang tải chi tiết hồ sơ bàn giao...</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không tìm thấy thông tin hồ sơ. <Link to="/offboarding" className="text-indigo-600 underline">Quay lại</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '1. Tổng quan' },
    { id: 'employee', label: '2. Nhân viên' },
    { id: 'tasks', label: `3. Công việc (${data.tasks?.length || 0})` },
    { id: 'assets', label: `4. Tài sản (${data.employee?.assignments?.length || 0})` },
    { id: 'accounts', label: `5. Tài khoản IT (${data.revocations?.length || 0})` },
    { id: 'finance', label: `6. Tài chính (${data.financialReconciliations?.length || 0})` },
    { id: 'exceptions', label: `7. Ngoại lệ (${data.exceptions?.length || 0})` },
    { id: 'documents', label: `8. Tài liệu & Minh chứng (${data.documents?.length || 0})` },
    { id: 'approvals', label: `9. Phê duyệt (${data.approvals?.length || 0})` },
    { id: 'ai', label: '10. Phân tích AI & Rủi ro' },
    { id: 'comments', label: `11. Trao đổi (${data.comments?.length || 0})` },
    { id: 'audit', label: '12. Nhật ký Audit' },
  ];

  const latestAnalysis = data.analyses?.[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/offboarding"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{data.requestCode}</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {data.status}
              </span>
              {data.riskLevel && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    data.riskLevel === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : data.riskLevel === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Rủi ro: {data.riskLevel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhân viên: <strong className="text-slate-700">{data.employee?.fullName}</strong> ({data.employee?.employeeCode}) • Phòng: {data.employee?.department?.name}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={analyzing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Bot className="w-4 h-4" />
          <span>{analyzing ? 'Đang phân tích...' : 'AI Phân tích rủi ro'}</span>
        </button>
      </div>

      {/* Progress Metric Card */}
      {progress && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2 font-semibold">
            <span className="text-slate-700">Tiến độ hoàn tất bàn giao tổng hợp</span>
            <span className="text-indigo-600 text-sm font-bold">{progress.overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.overallProgress}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
            <div>
              Công việc: <strong className="text-slate-800">{progress.completedTasks}/{progress.totalTasks}</strong>
            </div>
            <div>
              Thu hồi quyền: <strong className="text-slate-800">{progress.revokedCount}/{progress.totalRevocations}</strong>
            </div>
            <div>
              Phê duyệt: <strong className="text-slate-800">{progress.approvedCount}/{progress.totalApprovals}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        {/* 1. Tổng quan */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Thông tin mốc thời gian</h4>
                <div><strong>Ngày nộp đơn:</strong> {new Date(data.resignationDate).toLocaleDateString('vi-VN')}</div>
                <div><strong>Ngày làm việc cuối cùng:</strong> {new Date(data.lastWorkingDate).toLocaleDateString('vi-VN')}</div>
                <div><strong>Lý do thôi việc:</strong> {data.reason || 'Không cung cấp'}</div>
                <div><strong>Người tạo hồ sơ:</strong> {data.creator?.fullName} ({data.creator?.email})</div>
              </div>

              <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs">
                <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  Đánh giá rủi ro từ AI
                </h4>
                {latestAnalysis ? (
                  <>
                    <p className="text-slate-700">{latestAnalysis.summary}</p>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-indigo-100">
                      Mô hình: <code>{latestAnalysis.modelName}</code> • Cập nhật: {new Date(latestAnalysis.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500">Chưa có kết quả phân tích AI. Nhấn "AI Phân tích rủi ro" ở góc trên để chạy đánh giá tự động.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Nhân viên */}
        {activeTab === 'employee' && (
          <div className="max-w-xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Hồ sơ trích xuất nhân sự</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div><strong>Họ và tên:</strong> {data.employee?.fullName}</div>
              <div><strong>Mã nhân viên:</strong> {data.employee?.employeeCode}</div>
              <div><strong>Email công việc:</strong> {data.employee?.email}</div>
              <div><strong>Số điện thoại:</strong> {data.employee?.phone || 'Chưa cập nhật'}</div>
              <div><strong>Vị trí / Chức danh:</strong> {data.employee?.jobTitle}</div>
              <div><strong>Phòng ban:</strong> {data.employee?.department?.name}</div>
            </div>
          </div>
        )}

        {/* 3. Nhiệm vụ bàn giao */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Danh mục nhiệm vụ cần bàn giao</h3>
              <span className="text-xs text-slate-400">Click để chuyển đổi trạng thái hoàn tất</span>
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {data.tasks?.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskStatusToggle(task.id, task.status)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300"
                    />
                    <div>
                      <div className={`text-xs font-semibold ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{task.description}</div>
                      {task.assignee && (
                        <div className="text-[10px] text-indigo-600 mt-1 font-medium">
                          Phụ trách: {task.assignee.fullName}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Tài sản */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Tài sản thiết bị đang bàn giao</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.employee?.assignments?.map((item) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-indigo-600" />
                      {item.asset?.name}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">{item.asset?.assetCode}</span>
                  </div>
                  <div className="text-slate-500">Số serial: {item.asset?.serialNumber || 'N/A'}</div>
                  <div className="text-slate-500">Tình trạng ghi nhận: {item.condition}</div>
                  <div className="text-slate-500">Ngày cấp phát: {new Date(item.assignedAt).toLocaleDateString('vi-VN')}</div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Chờ xác nhận thu hồi
                    </span>
                    <button
                      onClick={() => handleReturnAsset(item.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Xác nhận thu hồi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Tài khoản IT */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Thu hồi quyền truy cập & Tài khoản</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
              {data.revocations?.map((rev) => (
                <div key={rev.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800">{rev.account?.systemName}</div>
                      <div className="text-slate-500 text-[11px]">Tài khoản: {rev.account?.accountName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rev.status === 'REVOKED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.status === 'REVOKED' ? 'Đã thu hồi' : 'Chờ thu hồi'}
                    </span>
                    {rev.status !== 'REVOKED' && (
                      <button
                        onClick={() => handleRevokeAccount(rev.id)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Vô hiệu hóa</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Đối soát tài chính */}
        {activeTab === 'finance' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Đối soát công nợ & Quyết toán lương
              </h3>
              <Link
                to="/finance"
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Mở module Kế toán <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.financialReconciliations?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Chưa có bản ghi đối soát tài chính nào cho hồ sơ này.
              </div>
            ) : (
              <div className="space-y-4">
                {data.financialReconciliations?.map((fin) => (
                  <div key={fin.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">Bản ghi đối soát</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          fin.status === 'CLEARED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : fin.status === 'DISPUTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {fin.status === 'CLEARED' ? 'Đã quyết toán' : fin.status === 'DISPUTED' ? 'Tranh chấp' : 'Chờ đối soát'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200/80">
                      <div>
                        <div className="text-[11px] text-slate-400">Tạm ứng</div>
                        <div className="font-mono font-bold text-slate-800 mt-0.5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fin.advanceAmount || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">Nợ tài sản</div>
                        <div className="font-mono font-bold text-amber-700 mt-0.5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fin.debtAmount || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">Chưa thanh toán</div>
                        <div className="font-mono font-bold text-blue-700 mt-0.5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fin.unsettledExpense || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">Tổng khấu trừ</div>
                        <div className="font-mono font-bold text-rose-700 mt-0.5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fin.totalDeduction || 0)}
                        </div>
                      </div>
                    </div>

                    {fin.note && (
                      <div className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60">
                        <strong>Ghi chú kế toán:</strong> {fin.note}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Người quyết toán: <strong className="text-slate-700">{fin.clearedBy || 'Chưa ghi nhận'}</strong></span>
                      <span>Thời điểm: {fin.clearedAt ? new Date(fin.clearedAt).toLocaleString('vi-VN') : '---'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. Ngoại lệ & Sự cố */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Sự cố ngoại lệ trong quá trình bàn giao
              </h3>
              <Link
                to="/exceptions"
                className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800"
              >
                Mở module Ngoại lệ <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.exceptions?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Không có sự cố ngoại lệ nào phát sinh trong hồ sơ này. Quy trình diễn ra thuận lợi.
              </div>
            ) : (
              <div className="space-y-3">
                {data.exceptions?.map((exc) => (
                  <div key={exc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">{exc.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          {exc.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            exc.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {exc.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang mở'}
                        </span>
                      </div>
                    </div>
                    {exc.description && <p className="text-slate-600">{exc.description}</p>}
                    {exc.resolutionNote && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded text-emerald-900">
                        <strong>Biên bản xử lý:</strong> {exc.resolutionNote}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Phụ trách: {exc.assignedTo || '---'}</span>
                      <span>Giải quyết bởi: {exc.resolvedBy || '---'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Tài liệu & Minh chứng */}
        {activeTab === 'documents' && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Tài liệu, Biên bản & Minh chứng bàn giao</h3>
            </div>

            {/* Upload Area */}
            <form onSubmit={handleUploadDocument} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-semibold text-slate-700">Tải lên biên bản bàn giao / xác nhận tài sản</div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="py-1.5 px-3 bg-white border border-slate-200 rounded text-xs"
                >
                  <option value="HANDOVER">Biên bản bàn giao công việc</option>
                  <option value="ASSET">Biên bản hoàn trả tài sản</option>
                  <option value="ACCESS">Biên bản thu hồi tài khoản IT</option>
                  <option value="RESIGNATION">Đơn xin nghỉ việc có chữ ký</option>
                </select>
                <button
                  type="submit"
                  disabled={uploadingDoc || !selectedFile}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold flex items-center gap-1 transition disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingDoc ? 'Đang tải...' : 'Upload'}</span>
                </button>
              </div>
            </form>

            {/* Document list */}
            <div className="space-y-2">
              {data.documents?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                  Chưa có tài liệu hoặc biên bản nào được tải lên
                </div>
              ) : (
                data.documents?.map((doc) => (
                  <div key={doc.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <div className="font-bold text-slate-800">{doc.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Loại: {doc.type} • Tải lên bởi: {doc.uploadedBy || 'N/A'} • {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Xóa tài liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 7. Phê duyệt */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Quy trình phê duyệt nhiều cấp (Multi-step Approvals)</h3>
            <div className="space-y-3">
              {data.approvals?.map((step) => (
                <div key={step.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      Bước {step.step}: Phê duyệt bởi {step.approver?.fullName} ({step.approver?.email})
                    </div>
                    <div className="text-slate-500 mt-1">Ghi chú: {step.note || 'Không có ghi chú'}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      step.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Phân tích AI */}
        {activeTab === 'ai' && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                Kết quả phân tích rủi ro hồ sơ tự động
              </h3>
            </div>

            {latestAnalysis ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-1">Tóm tắt đánh giá:</h4>
                  <p className="text-slate-700">{latestAnalysis.summary}</p>
                </div>

                {latestAnalysis.suggestions && (
                  <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                    <h4 className="font-bold text-indigo-900 mb-2">Đề xuất phương án xử lý:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-indigo-800">
                      {Array.isArray(latestAnalysis.suggestions) &&
                        latestAnalysis.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {latestAnalysis.missingInfo && (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                    <h4 className="font-bold text-rose-900 mb-2">Thông tin & Minh chứng còn thiếu:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-rose-800">
                      {Array.isArray(latestAnalysis.missingInfo) &&
                        latestAnalysis.missingInfo.map((m, idx) => <li key={idx}>{m}</li>)}
                    </ul>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 italic">
                  * Lưu ý: Kết quả phân tích AI chỉ hỗ trợ cảnh báo và đề xuất. Quyết định phê duyệt cuối cùng thuộc về người có thẩm quyền.
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Chưa có phân tích. Hãy nhấn nút "AI Phân tích rủi ro" ở góc trên.</p>
            )}
          </div>
        )}

        {/* 9. Trao đổi nội bộ */}
        {activeTab === 'comments' && (
          <div className="space-y-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Trao đổi nội bộ giữa các phòng ban</h3>

            {/* List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.comments?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg">
                  Chưa có trao đổi nào trong hồ sơ này
                </div>
              ) : (
                data.comments?.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{c.user?.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Nhập nội dung trao đổi nội bộ..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        )}

        {/* 10. Hoạt động */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Lịch sử thao tác & Đối soát (Audit Log)</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {data.auditLogs?.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{log.user?.fullName || 'Hệ thống'}</span>{' '}
                    <span className="text-slate-500">đã thực hiện</span>{' '}
                    <span className="font-medium text-indigo-600">{log.action}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
