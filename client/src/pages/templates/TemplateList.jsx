import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Layers, Plus, CheckCircle2, ChevronRight, Save, X } from 'lucide-react';

export default function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([
    { title: '', description: '', department: 'TECH', isRequired: true },
  ]);
  const [creating, setCreating] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/templates');
      setTemplates(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách mẫu quy trình:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddItemRow = () => {
    setItems([...items, { title: '', description: '', department: 'TECH', isRequired: true }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      await api.post('/templates', {
        name,
        description,
        items: items.filter((i) => i.title.trim()),
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setItems([{ title: '', description: '', department: 'TECH', isRequired: true }]);
      await fetchTemplates();
    } catch (err) {
      alert(err.message || 'Lỗi tạo mẫu quy trình');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mẫu Quy trình Bàn giao (Templates)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập danh mục công việc chuẩn áp dụng tự động cho từng phòng ban khi có hồ sơ nghỉ việc
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mẫu quy trình mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Đang tải mẫu quy trình...
          </div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Chưa có mẫu quy trình nào
          </div>
        ) : (
          templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-bold text-slate-900 text-base">{tpl.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      Đang kích hoạt
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Đã áp dụng: <strong className="text-slate-700">{tpl._count?.requests || 0} hồ sơ</strong>
                </div>
              </div>

              {/* Items in template */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Checklist nhiệm vụ tự động ({tpl.items?.length || 0} bước)
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {tpl.items?.map((item, idx) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">{item.title}</div>
                          {item.description && (
                            <div className="text-slate-500 text-[11px] mt-0.5">{item.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {item.department || 'Chung'}
                        </span>
                        {item.isRequired && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700">
                            Bắt buộc
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Tạo mới Mẫu quy trình bàn giao</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên mẫu quy trình</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Quy trình bàn giao Khối Kinh doanh & CSKH..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả quy trình</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phạm vi áp dụng..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    Các bước nhiệm vụ bàn giao
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm bước</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((row, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex gap-2 items-start">
                      <span className="font-bold text-slate-400 mt-2 text-xs">{idx + 1}.</span>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          required
                          value={row.title}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          placeholder="Tiêu đề nhiệm vụ..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Mô tả chi tiết / hướng dẫn..."
                            className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded text-[11px]"
                          />
                          <select
                            value={row.department}
                            onChange={(e) => handleItemChange(idx, 'department', e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                          >
                            <option value="TECH">Kỹ thuật (TECH)</option>
                            <option value="IT">IT Quản trị</option>
                            <option value="FINANCE">Kế toán (FINANCE)</option>
                            <option value="HR">Nhân sự (HR)</option>
                            <option value="BIZ">Kinh doanh (BIZ)</option>
                          </select>
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
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
                  {creating ? 'Đang lưu...' : 'Lưu mẫu quy trình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
