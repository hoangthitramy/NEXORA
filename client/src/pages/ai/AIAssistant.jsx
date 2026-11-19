import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  Database,
  Filter,
  Laptop,
  Users,
  FileText,
  KeyRound,
  DollarSign,
  AlertTriangle,
  Info,
} from 'lucide-react';

// Enhanced Markdown Formatter with Table support
function FormattedMessage({ content }) {
  if (!content) return null;

  const rawLines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Check for Table (starts with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // Parse header and rows (skip delimiter row like |---|---|)
        const headerRow = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        const bodyRows = tableLines.slice(1).filter((l) => !/^[|\s-:]+$/.test(l));

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
            <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  {headerRow.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 border-r last:border-r-0 border-slate-200">
                      {renderInlineStyles(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {bodyRows.map((row, rIdx) => {
                  const cells = row
                    .split('|')
                    .slice(1, -1)
                    .map((c) => c.trim());
                  return (
                    <tr key={rIdx} className="hover:bg-indigo-50/40 transition">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 border-r last:border-r-0 border-slate-100 text-slate-800">
                          {renderInlineStyles(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // H3 Header (### Title)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-slate-900 pt-2 pb-1 border-b border-slate-200">
          {renderInlineStyles(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }

    // H4 Header (#### Title)
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold text-indigo-900 pt-2 pb-0.5">
          {renderInlineStyles(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote (> Quote)
    if (trimmed.startsWith('> ')) {
      elements.push(
        <div
          key={`quote-${i}`}
          className="pl-3 py-1.5 my-1.5 border-l-2 border-indigo-500 bg-indigo-50/70 rounded-r text-[11px] text-slate-700 italic"
        >
          {renderInlineStyles(trimmed.replace(/^>\s+/, ''))}
        </div>
      );
      i++;
      continue;
    }

    // Bullet list item (* or -)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 pl-2 text-xs">
          <span className="text-indigo-500 mt-0.5 font-bold">•</span>
          <span className="flex-1 text-slate-800">
            {renderInlineStyles(trimmed.replace(/^(\*|-)\s+/, ''))}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list item (1. 2. etc.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\.\s+/)[1];
      const text = trimmed.replace(/^\d+\.\s+/, '');
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 pl-2 text-xs">
          <span className="font-semibold text-indigo-600 min-w-[14px]">{num}.</span>
          <span className="flex-1 text-slate-800">{renderInlineStyles(text)}</span>
        </div>
      );
      i++;
      continue;
    }

    // Default paragraph
    elements.push(
      <p key={`p-${i}`} className="text-slate-800 text-xs">
        {renderInlineStyles(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1.5">{elements}</div>;
}

// Inline parser for bold and code tags
function renderInlineStyles(text) {
  if (!text) return '';
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 mx-0.5 bg-slate-200/90 text-indigo-900 rounded font-mono text-[10.5px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Xin chào! Tôi là **Trợ lý AI & RAG Knowledge** của EXITCONTROL.

Tôi có toàn quyền truy xuất **Cơ sở dữ liệu thời gian thực** của hệ thống để hỗ trợ bạn **tìm kiếm, lọc thông tin và tra cứu quy chế**:

* 🔍 **Lọc Nhân sự theo Phòng ban:** Lọc danh sách nhân viên phòng Kỹ thuật (TECH), Nhân sự (HR), Kế toán (FINANCE), Kinh doanh (BIZ).
* 📋 **Lọc Hồ sơ thôi việc:** Lọc theo trạng thái (\`IN_PROGRESS\`, \`SUBMITTED\`, \`COMPLETED\`) hoặc mức rủi ro (\`HIGH\`, \`MEDIUM\`, \`LOW\`).
* 💻 **Lọc Tài sản thiết bị:** Kiểm tra danh sách tài sản đang cấp phát / chưa thu hồi, serial thiết bị, người đang giữ.
* 🔐 **Lọc Quyền truy cập:** Rà soát tài khoản AWS Cloud, GitHub Enterprise, Google Workspace cần vô hiệu hóa.
* 💰 **Lọc Tài chính & Công nợ:** Đối soát tạm ứng, công nợ tồn đọng của từng nhân sự.
* 📖 **Tra cứu Quy chế RAG:** Hướng dẫn quy trình bàn giao SOP-01, chính sách tài sản POL-02, an toàn dữ liệu SEC-03.

Bạn có thể bấm vào các **Nút lọc nhanh** phía trên hoặc gõ yêu cầu lọc trực tiếp vào ô chat!`,
      sources: [
        'Hệ thống Dữ liệu Realtime EXITCONTROL',
        'Kho Tri thức Quy chế Nội bộ (RAG)',
      ],
      disclaimer: 'Dữ liệu được trích xuất trực tiếp từ hệ thống thực tế. Mọi phê duyệt chính thức thuộc về người có thẩm quyền.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Filter Categories for 1-click filtering
  const filterShortcuts = [
    { label: '👥 Lọc NV phòng Kỹ thuật (TECH)', q: 'Lọc danh sách nhân viên phòng Kỹ thuật' },
    { label: '👥 Lọc NV phòng Nhân sự (HR)', q: 'Lọc danh sách nhân viên phòng Nhân sự' },
    { label: '📋 Lọc hồ sơ đang xử lý', q: 'Lọc các hồ sơ thôi việc đang xử lý' },
    { label: '💻 Lọc tài sản chưa thu hồi', q: 'Lọc các tài sản chưa thu hồi' },
    { label: '🔐 Lọc tài khoản cần khóa (AWS/Git)', q: 'Lọc danh sách tài khoản cần thu hồi' },
    { label: '📄 Lọc đơn xin nghỉ việc', q: 'Lọc danh sách đơn xin nghỉ việc' },
    { label: '💰 Lọc đối soát công nợ', q: 'Lọc đối soát công nợ tài chính' },
    { label: '⚠️ Lọc sự cố ngoại lệ', q: 'Lọc các sự cố ngoại lệ quy trình' },
    { label: '📊 Thống kê toàn hệ thống', q: 'Thống kê tổng quan dữ liệu toàn hệ thống hiện tại' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const message = textToSend || input;
    if (!message.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: message }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message });

      const replyText =
        res?.data?.reply ||
        res?.reply ||
        (typeof res?.data === 'string' ? res.data : '') ||
        res?.message ||
        'Không nhận được nội dung phản hồi từ hệ thống.';
      const sources = res?.data?.sources || res?.sources || [];
      const disclaimer = res?.data?.disclaimer || res?.disclaimer;

      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: replyText,
          sources: sources,
          disclaimer: disclaimer,
        },
      ]);
    } catch (err) {
      console.error('Lỗi gọi API AI Chat:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Xin lỗi, hiện tại không thể kết nối tới dịch vụ AI. Vui lòng kiểm tra máy chủ backend.';

      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: `⚠️ **Không thể kết nối:** ${errMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ lọc hay tra cứu thông tin nào trên hệ thống?',
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Assistant & RAG Knowledge</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Database Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI hỗ trợ lọc, tra cứu và tổng hợp thông tin trực tiếp từ cơ sở dữ liệu hệ thống (Hồ sơ, Nhân sự, Thiết bị, Quyền truy cập)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-sm transition"
          title="Làm mới cuộc trò chuyện"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter Shortcuts Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            Bộ lọc Dữ liệu Nhanh (Click để lọc thông tin ngay):
          </span>
          <span className="text-[10px] text-slate-400">Dữ liệu thời gian thực từ Database</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filterShortcuts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.q)}
              className="text-[11px] bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 transition shadow-2xs font-medium flex items-center gap-1"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                {m.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-3xl p-4 rounded-2xl text-xs ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50/90 text-slate-800 border border-slate-200/90 rounded-tl-none space-y-3 shadow-2xs w-full'
                }`}
              >
                {m.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <FormattedMessage content={m.text} />
                )}

                {/* Sources / References tags */}
                {m.sources && m.sources.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-200/80 space-y-1.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-3 h-3 text-indigo-500" />
                      Dữ liệu hệ thống tham chiếu:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10.5px] font-medium"
                        >
                          <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {m.disclaimer && (
                  <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 italic flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>{m.disclaimer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 pl-2 text-xs text-slate-500">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                <span>AI đang lọc dữ liệu hệ thống & tổng hợp kết quả...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi để lọc thông tin (VD: 'Lọc nhân viên phòng Kỹ thuật', 'Lọc hồ sơ đang xử lý', 'Ai đang giữ laptop?')..."
            className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
