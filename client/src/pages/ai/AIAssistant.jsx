import React, { useState } from 'react';
import api from '../../services/api';
import { Bot, Send, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI EXITCONTROL. Tôi có thể hỗ trợ bạn đối soát rủi ro hồ sơ nghỉ việc, kiểm tra tài sản chưa thu hồi hoặc tra cứu quy chuẩn bàn giao nội bộ.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Quy trình bàn giao kỹ thuật gồm những bước nào?',
    'Chính sách thu hồi tài sản thiết bị như thế nào?',
    'Thời điểm thu hồi tài khoản AWS và Google Workspace?',
    'Phân tích rủi ro hồ sơ OFF-2026-001',
  ];

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
          disclaimer: res.data.disclaimer,
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: 'Xin lỗi, hiện tại không thể kết nối tới mô hình AI. Vui lòng thử lại sau.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Assistant & RAG Knowledge</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Trợ lý phân tích rủi ro, kiểm soát thông tin thiếu và tra cứu chính sách nhân sự
        </p>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Gợi ý:
        </span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
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
                {m.sender === 'user' ? 'U' : 'AI'}
              </div>

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none space-y-2'
                }`}
              >
                <div>{m.text}</div>
                {m.disclaimer && (
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 italic">
                    {m.disclaimer}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="w-4 h-4 animate-spin text-indigo-500" />
              <span>AI đang phân tích và trích xuất câu trả lời...</span>
            </div>
          )}
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
            placeholder="Đặt câu hỏi về quy trình bàn giao hoặc đối soát hồ sơ..."
            className="flex-1 px-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
