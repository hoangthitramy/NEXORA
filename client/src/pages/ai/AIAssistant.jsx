import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  Database,
  ShieldCheck,
  Laptop,
  Users,
  FileText,
  KeyRound,
  ExternalLink,
  Info,
} from 'lucide-react';

// Simple lightweight Markdown formatter for AI responses
function FormattedMessage({ content }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // H3 Header (### Title)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-slate-900 pt-2 pb-1 border-b border-slate-200">
              {renderInlineStyles(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // H4 Header (#### Title)
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-xs font-bold text-indigo-900 pt-1.5">
              {renderInlineStyles(trimmed.replace(/^####\s+/, ''))}
            </h4>
          );
        }

        // Blockquote (> Quote)
        if (trimmed.startsWith('> ')) {
          return (
            <div
              key={idx}
              className="pl-3 py-1 my-1 border-l-2 border-indigo-500 bg-indigo-50/60 rounded-r text-[11px] text-slate-700 italic"
            >
              {renderInlineStyles(trimmed.replace(/^>\s+/, ''))}
            </div>
          );
        }

        // Bullet list item (* or -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-500 mt-0.5 font-bold">•</span>
              <span className="flex-1">
                {renderInlineStyles(trimmed.replace(/^(\*|-)\s+/, ''))}
              </span>
            </div>
          );
        }

        // Numbered list item (1. 2. etc.)
        if (/^\d+\.\s+/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\.\s+/)[1];
          const text = trimmed.replace(/^\d+\.\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-semibold text-indigo-600 min-w-[14px]">{num}.</span>
              <span className="flex-1">{renderInlineStyles(text)}</span>
            </div>
          );
        }

        // Default paragraph
        return (
          <p key={idx} className="text-slate-800">
            {renderInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}

// Inline parser for bold and code tags
function renderInlineStyles(text) {
  // Split on bold (**text**) and code (`text`)
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
          className="px-1.5 py-0.5 mx-0.5 bg-slate-200/80 text-indigo-900 rounded font-mono text-[10.5px]"
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

Tôi được kết nối trực tiếp với **Cơ sở dữ liệu thời gian thực** của hệ thống và **Kho quy chuẩn nội bộ (RAG Knowledge)**. Tôi có thể giúp bạn:

* 📋 **Tra cứu & Phân tích hồ sơ thôi việc:** Kiểm tra mã hồ sơ (\`OFF-2026-001\`), tiến độ các phòng ban, rủi ro an ninh.
* 👤 **Kiểm tra thông tin nhân viên:** Tra cứu danh mục tài sản, chức vụ, phòng ban và tài khoản của bất kỳ nhân sự nào.
* 💻 **Đối soát tài sản & thiết bị:** Danh sách thiết bị chưa thu hồi, serial máy tính xách tay, màn hình, thẻ bảo mật.
* 🔐 **Thu hồi quyền truy cập:** Rà soát tài khoản AWS Cloud, GitHub Enterprise, Google Workspace cần vô hiệu hóa.
* 📖 **Quy chế & Quy trình SOP:** Tra cứu tiêu chuẩn bàn giao kỹ thuật, chính sách hoàn ứng và xử lý ngoại lệ.

Bạn có thể chọn một câu hỏi gợi ý bên dưới hoặc nhập câu hỏi trực tiếp!`,
      sources: [
        'Hệ thống Cơ sở Dữ liệu EXITCONTROL',
        'Kho Tri thức Quy chế Nội bộ (RAG SOP)',
      ],
      disclaimer: 'Dữ liệu được trích xuất trực tiếp từ hệ thống thực tế. Mọi phê duyệt chính thức thuộc về người có thẩm quyền.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sampleQuestions = [
    { label: '📋 Tra cứu hồ sơ OFF-2026-001', q: 'Phân tích hồ sơ OFF-2026-001' },
    { label: '👤 Tài sản của Nguyễn Văn Bách', q: 'Nhân viên Nguyễn Văn Bách đang giữ những tài sản nào?' },
    { label: '🔐 Tài khoản cần thu hồi', q: 'Danh sách các tài khoản quyền truy cập cần thu hồi?' },
    { label: '📊 Thống kê toàn hệ thống', q: 'Thống kê tổng quan dữ liệu toàn hệ thống hiện tại' },
    { label: '📖 Quy trình bàn giao kỹ thuật', q: 'Quy trình bàn giao kỹ thuật gồm những bước nào?' },
    { label: '💻 Chính sách thu hồi thiết bị', q: 'Chính sách kiểm định và thu hồi tài sản thiết bị như thế nào?' },
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
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: res.data.reply,
          sources: res.data.sources || [],
          disclaimer: res.data.disclaimer,
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: 'Xin lỗi, hiện tại không thể kết nối tới dịch vụ AI. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
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
        text: 'Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ tra cứu thông tin hồ sơ, tài sản hay quy chế nào trên hệ thống?',
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
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
                  Live System Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trợ lý AI trả lời câu hỏi dựa trên toàn bộ dữ liệu thực tế trên hệ thống (Hồ sơ thôi việc, Nhân sự, Tài sản, Quyền truy cập & Quy chuẩn RAG)
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

      {/* System Data Scope Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
        <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 shadow-2xs">
          <div className="p-1 bg-blue-50 text-blue-600 rounded">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Hồ sơ thôi việc</div>
            <div className="text-[10px] text-slate-500">Mã OFF, tiến độ, rủi ro</div>
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 shadow-2xs">
          <div className="p-1 bg-purple-50 text-purple-600 rounded">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Nhân sự & Phòng ban</div>
            <div className="text-[10px] text-slate-500">Thông tin & vai trò</div>
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 shadow-2xs">
          <div className="p-1 bg-amber-50 text-amber-600 rounded">
            <Laptop className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Quản lý Tài sản</div>
            <div className="text-[10px] text-slate-500">Laptop, màn hình, thẻ</div>
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 shadow-2xs">
          <div className="p-1 bg-rose-50 text-rose-600 rounded">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Quyền truy cập</div>
            <div className="text-[10px] text-slate-500">AWS, GitHub, Google</div>
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 shadow-2xs col-span-2 sm:col-span-1">
          <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">RAG Knowledge</div>
            <div className="text-[10px] text-slate-500">SOP-01, POL-02, SEC-03</div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Gợi ý câu hỏi:
        </span>
        {sampleQuestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.q)}
            className="text-[11px] bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 border border-slate-200 px-3 py-1 rounded-full text-slate-600 transition shadow-2xs"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
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
                className={`max-w-2xl p-4 rounded-2xl text-xs ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50/80 text-slate-800 border border-slate-200/80 rounded-tl-none space-y-3 shadow-2xs'
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
                      Dữ liệu hệ thống tham chiếu (RAG Context):
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
                <span>AI đang truy xuất dữ liệu hệ thống & tổng hợp câu trả lời...</span>
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
            placeholder="Hỏi về hồ sơ OFF-2026-001, tài sản của nhân viên, tài khoản AWS hay quy chuẩn SOP..."
            className="flex-1 px-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
