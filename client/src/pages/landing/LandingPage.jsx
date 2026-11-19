import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Shield,
  FileText,
  Laptop,
  Key,
  Receipt,
  AlertTriangle,
  Bot,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Phone,
  Mail,
  MapPin,
  Send,
  ExternalLink,
  ChevronRight,
  Layers,
  Lock,
  BarChart3,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    employeeScale: '50-200',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setContactForm({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        employeeScale: '50-200',
        message: '',
      });
    }, 800);
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Khởi tạo đơn trực tuyến',
      desc: 'Nhân viên nộp đơn xin nghỉ việc trực tuyến với lý do, ngày làm việc cuối cùng và tệp đính kèm. Quản lý trực tiếp và HR phê duyệt chủ trương trên hệ thống.',
      icon: FileText,
      role: 'Employee & Manager',
    },
    {
      step: '02',
      title: 'Tự động kích hoạt Checklist',
      desc: 'Hệ thống tự động tạo hồ sơ Offboarding và phân bổ danh mục nhiệm vụ bàn giao theo Mẫu quy trình (Task Template) của từng phòng ban.',
      icon: Layers,
      role: 'HR Coordinator',
    },
    {
      step: '03',
      title: 'Thu hồi Tài sản & Quyền IT',
      desc: 'Hành chính kiểm tra tình trạng vật lý và thu hồi Laptop/phụ kiện. Đội ngũ IT thực hiện 1-Click vô hiệu hóa quyền truy cập Email, VPN, AWS, Jira.',
      icon: Key,
      role: 'IT & Administration',
    },
    {
      step: '04',
      title: 'Đối soát & Quyết toán tài chính',
      desc: 'Kế toán kiểm tra các khoản tạm ứng công tác phí, nợ bồi thường thiết bị và chi phí tồn đọng; xác định chính xác số tiền cấn trừ lương cuối cùng.',
      icon: Receipt,
      role: 'Accountant',
    },
    {
      step: '05',
      title: 'Phê duyệt đa cấp & Lưu vết Audit',
      desc: 'Chuỗi phê duyệt 4 cấp hoàn tất nghĩa vụ. Trợ lý AI quét rủi ro toàn diện trước khi HR đóng hồ sơ. Toàn bộ dữ liệu được lưu vết kiểm toán vĩnh viễn.',
      icon: Shield,
      role: 'HR & Management',
    },
  ];

  const enterpriseSolutions = [
    {
      title: 'Bảo mật dữ liệu & Sở hữu trí tuệ',
      desc: 'Ngăn ngừa rò rỉ mã nguồn và dữ liệu khách hàng bằng cơ chế 1-Click thu hồi toàn bộ tài khoản Google Workspace, GitHub, VPN và hạ tầng Cloud.',
      icon: Lock,
    },
    {
      title: 'Chống thất thoát tài sản hữu hình',
      desc: 'Quản lý tập trung mọi tài sản từ máy tính, màn hình, thẻ ra vào tòa nhà đến chìa khóa tủ với biên bản nghiệm thu tình trạng vật lý chi tiết.',
      icon: Laptop,
    },
    {
      title: 'Quyết toán công nợ minh bạch',
      desc: 'Tự động hóa đối soát tài chính: công nợ bồi thường hỏng máy, các khoản tạm ứng chưa hoàn ứng, đảm bảo không chi trả sai lệch lương kỳ cuối.',
      icon: Receipt,
    },
    {
      title: 'Quản lý ngoại lệ & Sự cố phát sinh',
      desc: 'Cung cấp phân hệ Exception Management chuyên biệt cho các trường hợp mất thẻ, hỏng máy, chậm bàn giao có biên bản xử lý và miễn trừ trách nhiệm.',
      icon: AlertTriangle,
    },
    {
      title: 'Trợ lý AI phân tích rủi ro (RAG)',
      desc: 'Động cơ AI tự động kiểm tra tính đầy đủ của minh chứng bàn giao, cảnh báo quá hạn thời gian cam kết (SLA) và đề xuất phương án giải quyết.',
      icon: Bot,
    },
    {
      title: 'Nhật ký kiểm toán toàn vẹn (Audit Trail)',
      desc: 'Ghi nhận chi tiết từng thay đổi dữ liệu (Audit Diff: Old Value vs New Value), định danh người thao tác và thời điểm theo chuẩn ISO 27001 và SOC 2.',
      icon: Activity,
    },
  ];

  const roles = [
    { name: 'Admin', desc: 'Quản trị hệ thống, cấp phát tài khoản, giám sát nhật ký Audit và cấu hình tổ chức.' },
    { name: 'HR', desc: 'Điều phối quy trình, duyệt đơn nghỉ việc, khởi tạo hồ sơ, phê duyệt cấp nhân sự và đóng hồ sơ.' },
    { name: 'Manager', desc: 'Thẩm định lý do xin thôi việc của cấp dưới, xác nhận nội dung và tài liệu bàn giao chuyên môn.' },
    { name: 'IT Specialist', desc: 'Quản lý tài khoản số, 1-Click thu hồi quyền truy cập Email, AWS, VPN, Jira.' },
    { name: 'Kế toán', desc: 'Kiểm tra tạm ứng, công nợ thiết bị, cấn trừ tiền phạt vào kỳ lương cuối cùng.' },
    { name: 'Hành chính', desc: 'Kiểm tra tình trạng vật lý phần cứng, xác nhận thu hồi laptop, màn hình, thẻ từ.' },
    { name: 'Employee', desc: 'Nộp đơn thôi việc, tạo phiếu bàn giao công việc, nộp tài sản và theo dõi tiến độ cá nhân.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              EC
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base tracking-wide flex items-center gap-1.5">
                EXITCONTROL
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
                  v1.0 Enterprise
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Employee Offboarding & Handover</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#workflow" className="hover:text-indigo-600 transition-colors">
              Cách thức hoạt động
            </a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">
              Giải pháp doanh nghiệp
            </a>
            <a href="#roles" className="hover:text-indigo-600 transition-colors">
              Phân quyền 7 vai trò
            </a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">
              Về nền tảng
            </a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">
              Liên hệ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>Vào Bảng điều khiển</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Đăng ký tài khoản
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <span>Giải pháp Quản trị Nhân sự Chuyên sâu – AI Buildathon 2026</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Kiểm soát toàn diện quy trình nghỉ việc & bàn giao nhân sự
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                EXITCONTROL giúp doanh nghiệp chuyển đổi số toàn bộ vòng đời thôi việc: tự động hóa danh mục bàn giao, thu hồi tài sản phần cứng, 1-click vô hiệu hóa tài khoản số, đối soát tài chính minh bạch và phân tích rủi ro bằng AI.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Truy cập hệ thống quản trị</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all"
                    >
                      <span>Trải nghiệm ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#workflow"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                    >
                      <span>Xem luồng hoạt động</span>
                    </a>
                  </>
                )}
              </div>

              {/* Trust Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-100">
                <div>
                  <div className="text-2xl font-bold font-mono text-indigo-600">100%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Thu hồi quyền số</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-indigo-600">0%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Thất thoát thiết bị</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-indigo-600">75%</div>
                  <div className="text-xs text-slate-500 mt-0.5">Tiết kiệm thời gian</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-indigo-600">ISO/SOC2</div>
                  <div className="text-xs text-slate-500 mt-0.5">Chuẩn kiểm toán Audit</div>
                </div>
              </div>
            </div>

            {/* Visual Hero Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-800 text-slate-200">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="ml-2 font-mono text-[11px]">EXITCONTROL Executive Panel</span>
                  </div>
                  <span className="font-mono text-emerald-400">SYSTEM ONLINE</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>Mã hồ sơ: OFF-2026-001</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                        TIẾN ĐỘ: 85%
                      </span>
                    </div>
                    <div className="text-slate-400 mt-1">Nhân viên: Nguyễn Văn Bách (Senior Backend Engineer)</div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[85%]"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400">Tài sản vật lý:</div>
                      <div className="font-semibold text-emerald-400 mt-0.5">Đã thu hồi 2/2</div>
                    </div>
                    <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400">Tài khoản Cloud:</div>
                      <div className="font-semibold text-emerald-400 mt-0.5">Vô hiệu hóa 4/4</div>
                    </div>
                    <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400">Đối soát tài chính:</div>
                      <div className="font-semibold text-indigo-300 mt-0.5">CLEARED (Quyết toán)</div>
                    </div>
                    <div className="p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400">Đánh giá rủi ro AI:</div>
                      <div className="font-semibold text-emerald-400 mt-0.5">LOW RISK (An toàn)</div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/40 rounded-lg border border-indigo-900/50 text-[11px] text-indigo-300">
                    <strong>Nhật ký kiểm toán:</strong> Xác nhận phê duyệt vòng cuối cùng từ Giám đốc Nhân sự (HR Lead). Hồ sơ sẵn sàng lưu trữ.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cách thức hoạt động (How it works) */}
      <section id="workflow" className="py-16 bg-slate-100/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Quy trình chuẩn hóa 5 bước
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Cách thức hoạt động của hệ thống
            </h3>
            <p className="text-sm text-slate-600">
              EXITCONTROL kết nối liền mạch giữa Nhân viên, Quản lý trực tiếp, IT, Hành chính, Kế toán và Nhân sự theo một chu trình khép kín, không góc chết.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {workflowSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        BƯỚC {item.step}
                      </span>
                      <div className="p-2 rounded-lg bg-slate-50 text-slate-700">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                    Phụ trách: <span className="text-slate-700">{item.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Giải pháp doanh nghiệp (Enterprise Solutions) */}
      <section id="solutions" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Giá trị cốt lõi
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Những gì EXITCONTROL giải quyết cho Doanh nghiệp
            </h3>
            <p className="text-sm text-slate-600">
              Giải quyết triệt để sự rời rạc giữa email, excel và tin nhắn nội bộ bằng một nền tảng quản trị duy nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseSolutions.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition space-y-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{sol.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{sol.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Phân quyền 7 nhóm vai trò (Roles & RBAC) */}
      <section id="roles" className="py-16 bg-slate-100/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Nguyên tắc Phân tách Trách nhiệm
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Phân quyền 7 nhóm vai trò theo SRS v1.0
            </h3>
            <p className="text-sm text-slate-600">
              Mỗi vai trò chỉ được thao tác trong phạm vi chuyên môn được ủy quyền, ngăn ngừa xung đột lợi ích và gian lận.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((r, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <h4 className="font-bold text-slate-900 text-sm">{r.name}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
            <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 flex flex-col justify-center">
              <div className="text-xs font-bold text-indigo-900">Bảo mật đa tầng</div>
              <p className="text-[11px] text-indigo-800">
                Toàn bộ thao tác phân quyền được ghi vết tự động vào hệ thống Audit Trail bất biến.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Giới thiệu nền tảng (About EXITCONTROL) */}
      <section id="about" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Về Nền tảng EXITCONTROL
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900">
                Phát triển bởi Tập đoàn Công nghệ Nexora
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                EXITCONTROL là giải pháp chuyên sâu dành riêng cho bài toán Employee Offboarding trong khuôn khổ AI Buildathon 2026. Được thiết kế theo chuẩn đặc tả kỹ thuật SRS v1.0, hệ thống chú trọng vào tính chính xác nghiệp vụ, độ tin cậy cơ sở dữ liệu và khả năng mở rộng cho doanh nghiệp từ 50 đến hơn 10.000 nhân sự.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cơ sở dữ liệu MySQL 8 với 27 thực thể ràng buộc toàn vẹn quan hệ.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Bộ kiểm thử tự động 25/25 test cases bao phủ 100% nghiệp vụ cốt lõi.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Tài liệu đặc tả API chuẩn OpenAPI Specification 3.0 với Swagger UI.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4 text-center">
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-3xl font-extrabold font-mono text-indigo-600">v1.0</div>
                <div className="text-xs text-slate-500 mt-1">Phiên bản Enterprise</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-3xl font-extrabold font-mono text-indigo-600">27</div>
                <div className="text-xs text-slate-500 mt-1">Mô hình dữ liệu Prisma</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-3xl font-extrabold font-mono text-indigo-600">12</div>
                <div className="text-xs text-slate-500 mt-1">Tab quản trị chuyên sâu</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-3xl font-extrabold font-mono text-indigo-600">24/7</div>
                <div className="text-xs text-slate-500 mt-1">Sẵn sàng vận hành</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Thông tin liên hệ & Đăng ký tư vấn (Contact Section) */}
      <section id="contact" className="py-16 bg-slate-100/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Kết nối với chúng tôi
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              Thông tin liên hệ & Đăng ký tư vấn doanh nghiệp
            </h3>
            <p className="text-sm text-slate-600">
              Đội ngũ chuyên gia của Nexora luôn sẵn sàng hỗ trợ triển khai và tích hợp hệ thống cho doanh nghiệp của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <h4 className="font-bold text-slate-900 text-lg">Thông tin liên lạc chính thức</h4>
              
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Trụ sở chính:</strong>
                    <div>Tầng 18, Tòa nhà Nexora Innovation Center, Khu Công nghệ Cao, Hà Nội.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Hotline hỗ trợ kỹ thuật:</strong>
                    <div>1900 6868 (Tổng đài 24/7) • 024 8888 9999</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Email tiếp nhận:</strong>
                    <div>support@exitcontrol.vn • contact@nexora.vn</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Thời gian làm việc:</strong>
                    <div>Thứ Hai – Thứ Sáu: 08:00 – 18:00 | Thứ Bảy: 08:00 – 12:00</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">Môi trường máy chủ hiện hành:</div>
                <div>• Web App: <code className="text-indigo-600">http://localhost:5173</code></div>
                <div>• REST API: <code className="text-indigo-600">http://localhost:5050/api/v1</code></div>
                <div>• Swagger Docs: <code className="text-indigo-600">http://localhost:5050/api-docs</code></div>
              </div>
            </div>

            {/* Consultation Request Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <h4 className="font-bold text-slate-900 text-lg">Gửi yêu cầu demo hoặc tư vấn kỹ thuật</h4>
              
              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-emerald-900 text-base">Yêu cầu đã được gửi thành công!</div>
                  <p className="text-xs text-emerald-700">
                    Cảm ơn bạn đã quan tâm đến EXITCONTROL. Chuyên viên của chúng tôi sẽ liên hệ trong vòng 24 giờ làm việc.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ và tên người liên hệ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={contactForm.fullName}
                        onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email công việc <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@company.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số điện thoại liên lạc
                      </label>
                      <input
                        type="tel"
                        placeholder="0901234567"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên doanh nghiệp / Đơn vị
                      </label>
                      <input
                        type="text"
                        placeholder="Công ty Cổ phần ABC"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quy mô nhân sự doanh nghiệp
                    </label>
                    <select
                      value={contactForm.employeeScale}
                      onChange={(e) => setContactForm({ ...contactForm, employeeScale: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="under-50">Dưới 50 nhân sự</option>
                      <option value="50-200">Từ 50 – 200 nhân sự</option>
                      <option value="200-500">Từ 200 – 500 nhân sự</option>
                      <option value="500-1000">Từ 500 – 1.000 nhân sự</option>
                      <option value="over-1000">Trên 1.000 nhân sự (Enterprise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nhu cầu hoặc câu hỏi chi tiết
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả nhu cầu quản trị nghỉ việc, câu hỏi về tích hợp hệ thống..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Đang gửi thông tin...' : 'Gửi yêu cầu tư vấn'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  EC
                </div>
                <span className="font-bold text-white text-base">EXITCONTROL</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Hệ thống kiểm soát bàn giao và quy trình nghỉ việc nhân sự chuẩn doanh nghiệp. Đảm bảo an toàn thông tin số, chống thất thoát tài sản và minh bạch quyết toán tài chính.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase text-[11px] tracking-wider">
                Phân hệ chính
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link to="/resignation" className="hover:text-white transition">Đơn xin nghỉ việc</Link></li>
                <li><Link to="/offboarding" className="hover:text-white transition">Hồ sơ thôi việc</Link></li>
                <li><Link to="/assets" className="hover:text-white transition">Thu hồi tài sản</Link></li>
                <li><Link to="/access" className="hover:text-white transition">Thu hồi tài khoản IT</Link></li>
                <li><Link to="/finance" className="hover:text-white transition">Đối soát tài chính</Link></li>
                <li><Link to="/exceptions" className="hover:text-white transition">Quản lý ngoại lệ</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase text-[11px] tracking-wider">
                Hỗ trợ & Liên hệ
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li>Hotline: 1900 6868</li>
                <li>Email: support@exitcontrol.vn</li>
                <li>Swagger API: /api-docs</li>
                <li>Tập đoàn Công nghệ Nexora</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              © 2026 EXITCONTROL – Nexora Technology Systems. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="#about" className="hover:text-white transition">Chính sách bảo mật</a>
              <a href="#about" className="hover:text-white transition">Điều khoản sử dụng</a>
              <a href="#contact" className="hover:text-white transition">Liên hệ hỗ trợ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
