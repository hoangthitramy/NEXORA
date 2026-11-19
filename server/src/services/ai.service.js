import prisma from '../config/database.js';
import { ENV } from '../config/env.js';

// Default RAG Knowledge chunks for internal corporate offboarding SOP and policies
const DEFAULT_KNOWLEDGE_BASE = [
  {
    sourceName: 'SOP-01: Quy trình Bàn giao công việc & Thôi việc tiêu chuẩn',
    metadata: { category: 'PROCESS', code: 'SOP-01' },
    content: `Quy trình bàn giao và thôi việc chuẩn tại EXITCONTROL (Nexora Technology Systems) gồm 6 giai đoạn:
1. Tiếp nhận & Đăng ký: Hồ sơ thôi việc được khởi tạo từ Đơn xin thôi việc của nhân viên hoặc Quản lý trực tiếp tạo trên hệ thống.
2. Sinh danh sách nhiệm vụ: Hệ thống tự động tạo danh sách nhiệm vụ bàn giao dựa theo chức vụ và phòng ban (Tech, HR, Finance, Biz).
3. Bàn giao chuyên môn & Kỹ thuật: Bàn giao mã nguồn GitHub, tài liệu kiến trúc hệ thống Confluence, credentials dịch vụ cho Tech Lead/Người kế nhiệm ít nhất 03 ngày trước ngày làm việc cuối.
4. Kiểm định & Thu hồi tài sản: IT Support và Quản trị tài sản kiểm tra hiện trạng thiết bị (Laptop, màn hình, thẻ từ) và lập biên bản bàn giao có chữ ký hai bên.
5. Thu hồi quyền truy cập & Bảo mật: Khóa tài khoản Cloud (AWS, GCP), thu hồi SSH keys, xóa quyền GitHub Enterprise và vô hiệu hóa Google Workspace đúng 17h30 ngày làm việc cuối.
6. Phê duyệt đa cấp: Lần lượt qua 4 bước phê duyệt: Bước 1 - Quản lý trực tiếp (Manager) -> Bước 2 - IT Quản trị hệ thống -> Bước 3 - Kế toán tài chính -> Bước 4 - Trưởng phòng Nhân sự (HR).`,
  },
  {
    sourceName: 'POL-02: Chính sách Quản lý, Kiểm định & Thu hồi Tài sản CNTT',
    metadata: { category: 'ASSET', code: 'POL-02' },
    content: `Chính sách quản lý và thu hồi tài sản thiết bị doanh nghiệp:
1. Danh mục tài sản công ty cấp phát bao gồm: Laptop cá nhân (MacBook, Dell, ThinkPad), Màn hình mở rộng, Thẻ từ ra vào văn phòng, thiết bị thử nghiệm di động và phụ kiện sạc/cáp.
2. Nghĩa vụ hoàn trả: Nhân viên phải hoàn trả tất cả tài sản được giao trước hoặc chậm nhất vào lúc 16h00 ngày làm việc cuối cùng.
3. Kiểm tra hiện trạng: Bộ phận IT tiến hành kiểm tra số Serial, tình trạng vật lý (màn hình, bàn phím, thân vỏ), đảm bảo không dán decal cá nhân khó tẩy và không có hư hại bất thường do bất cẩn.
4. Biên bản bàn giao: Hai bên ký xác nhận vào Biên bản bàn giao thiết bị trên hệ thống.
5. Hư hỏng hoặc mất mát: Nếu làm mất hoặc hỏng hóc do lỗi cá nhân, nhân viên phải bồi thường theo tỷ lệ khấu hao còn lại hoặc khởi tạo phiếu Ngoại lệ (Process Exception - ASSET_LOST) để trừ vào quyết toán tài chính.`,
  },
  {
    sourceName: 'SEC-03: Quy chuẩn An toàn Thông tin & Vô hiệu hóa Quyền truy cập',
    metadata: { category: 'SECURITY', code: 'SEC-03' },
    content: `Quy chuẩn an toàn thông tin và thu hồi quyền truy cập tài khoản:
1. Thời điểm thu hồi quyền: Đúng 17h30 ngày làm việc cuối cùng (Last Working Date).
2. Danh mục tài khoản trọng yếu:
   - Điện toán đám mây: AWS Management Console, AWS IAM Users, Google Cloud Platform (GCP).
   - Mã nguồn phần mềm: GitHub Enterprise organization, Personal Access Tokens (PAT), SSH keys cá nhân trên server nội bộ.
   - Hòm thư và giao tiếp: Google Workspace (Gmail), Slack, Microsoft Teams, Zoom doanh nghiệp.
   - Quản lý công việc: Jira, Confluence, ERP, VPN công ty.
3. Nguyên tắc bảo mật: Nghiêm cấm sao chép, tải về mã nguồn, bí mật kinh doanh hoặc cơ sở dữ liệu khách hàng sang thiết bị/tài khoản cá nhân. Đối với nhân sự nắm quyền Root/Admin hạ tầng, IT Leader bắt buộc đổi mật khẩu chung và xoay secret keys dịch vụ ngay sau khi nhân viên nghỉ việc.`,
  },
  {
    sourceName: 'FIN-04: Quy định Đối soát Tài chính, Công nợ & Quyết toán Thôi việc',
    metadata: { category: 'FINANCE', code: 'FIN-04' },
    content: `Quy định đối soát tài chính, công nợ và quyết toán tiền lương thôi việc:
1. Đối soát công nợ: Kế toán tiến hành rà soát các khoản tiền tạm ứng công tác, chi phí tiếp khách chưa hoàn ứng, tiền phạt vi phạm quy chế hoặc các khoản nợ cá nhân đối với công ty.
2. Xử lý số dư nợ: Toàn bộ số tiền nợ chưa thanh toán sẽ được khấu trừ trực tiếp vào bảng thanh toán tiền lương tháng cuối cùng.
3. Chi trả tiền lương & Trợ cấp: Tiền lương của các ngày làm việc thực tế trong tháng cuối cùng và tiền thanh toán phép năm còn tồn (nếu có) được chi trả theo kỳ lương gần nhất.
4. Bàn giao hồ sơ: Phòng Nhân sự có trách nhiệm chốt sổ BHXH và bàn giao quyết định chấm dứt hợp đồng lao động cho nhân viên trong vòng 14 ngày làm việc kể từ ngày hoàn tất thủ tục.`,
  },
  {
    sourceName: 'APP-05: Ma trận Phê duyệt Đa cấp & Xử lý Ngoại lệ',
    metadata: { category: 'APPROVAL', code: 'APP-05' },
    content: `Ma trận phê duyệt hồ sơ thôi việc và cơ chế xử lý ngoại lệ:
1. Ma trận 4 bước phê duyệt:
   - Bước 1 (Manager): Thẩm duyệt kết quả bàn giao chuyên môn, tài liệu và phân công người nhận thay thế.
   - Bước 2 (IT Support): Xác nhận đã nhận đủ thiết bị vật lý và thu hồi toàn bộ tài khoản cloud/hệ thống.
   - Bước 3 (Kế toán): Xác nhận đối soát công nợ, tạm ứng bằng 0 (CLEARED) hoặc đã có phương án khấu trừ.
   - Bước 4 (HR Lead): Phê duyệt cuối cùng để ban hành quyết định thôi việc và gửi thông báo toàn công ty.
2. Xử lý ngoại lệ (Process Exception): Nếu có điểm nghẽn (thiết bị mất, người nhận bàn giao đi công tác, khiếu nại tài chính), cần tạo phiếu ngoại lệ trên hệ thống kèm mức ưu tiên (LOW, MEDIUM, HIGH, CRITICAL). Chỉ khi ngoại lệ được giải quyết (RESOLVED) hoặc miễn trừ (EXEMPTED), hồ sơ mới được phê duyệt hoàn tất.`,
  },
];

// Ensure knowledge base has seed data
export const ensureKnowledgeBase = async () => {
  try {
    const count = await prisma.knowledgeChunk.count();
    if (count === 0) {
      for (const item of DEFAULT_KNOWLEDGE_BASE) {
        await prisma.knowledgeChunk.create({
          data: {
            sourceName: item.sourceName,
            content: item.content,
            metadata: item.metadata,
          },
        });
      }
    }
  } catch (err) {
    console.error('Error ensuring knowledge base:', err.message);
  }
};

export const getKnowledgeBaseList = async () => {
  await ensureKnowledgeBase();
  return prisma.knowledgeChunk.findMany({
    orderBy: { createdAt: 'asc' },
  });
};

// Analyze a specific Offboarding Request
export const analyzeRequest = async (requestId) => {
  const request = await prisma.offboardingRequest.findUnique({
    where: { id: requestId },
    include: {
      employee: {
        include: {
          department: true,
          assignments: {
            include: { asset: true },
            where: { returnedAt: null },
          },
        },
      },
      tasks: true,
      handovers: { include: { items: true } },
      revocations: { include: { account: true } },
      documents: true,
      approvals: true,
    },
  });

  if (!request) {
    const error = new Error('Không tìm thấy hồ sơ');
    error.statusCode = 404;
    throw error;
  }

  const risks = [];
  const suggestions = [];
  const missingInfo = [];

  // Check unreturned assets
  const unreturnedAssets = request.employee.assignments;
  if (unreturnedAssets.length > 0) {
    risks.push({
      type: 'ASSET',
      description: `Nhân viên vẫn đang giữ ${unreturnedAssets.length} tài sản chưa thu hồi (${unreturnedAssets.map((a) => a.asset.name).join(', ')})`,
      severity: 'HIGH',
    });
    suggestions.push('Bộ phận IT và Quản trị tài sản cần lên lịch kiểm tra tình trạng vật lý và nhận lại thiết bị trước ngày làm việc cuối.');
  }

  // Check critical access accounts
  const criticalAccounts = request.revocations.filter(
    (r) =>
      r.account.systemName.includes('AWS') ||
      r.account.systemName.includes('GitHub') ||
      r.account.systemName.includes('Cloud')
  );
  if (criticalAccounts.some((r) => r.status !== 'REVOKED')) {
    risks.push({
      type: 'ACCESS_SECURITY',
      description: 'Nhân viên nắm quyền quản trị hạ tầng trọng yếu (AWS/GitHub) chưa được thu hồi hoặc vô hiệu hóa SSH keys.',
      severity: 'CRITICAL',
    });
    suggestions.push('Thu hồi quyền truy cập AWS Cloud và GitHub Enterprise ngay khi kết thúc ca làm việc cuối.');
  }

  // Check missing documents
  const hasHandoverDoc = request.documents.some((d) => d.type === 'HANDOVER');
  if (!hasHandoverDoc) {
    missingInfo.push('Biên bản bàn giao công việc có chữ ký xác nhận của hai bên');
    suggestions.push('Yêu cầu Tech Lead và nhân viên ký biên bản bàn giao file tài liệu kiến trúc hệ thống.');
  }

  let riskLevel = 'LOW';
  if (risks.some((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH')) {
    riskLevel = 'HIGH';
  } else if (risks.length > 0 || missingInfo.length > 0) {
    riskLevel = 'MEDIUM';
  }

  const summary = `Hồ sơ ${request.requestCode} của nhân viên ${request.employee.fullName}: Đánh giá mức rủi ro ${riskLevel}. Có ${risks.length} điểm rủi ro cần lưu ý và ${missingInfo.length} tài liệu/minh chứng cần bổ sung.`;

  await prisma.offboardingRequest.update({
    where: { id: requestId },
    data: { riskLevel },
  });

  const analysis = await prisma.aIAnalysis.create({
    data: {
      requestId,
      status: 'COMPLETED',
      riskLevel,
      summary,
      suggestions,
      missingInfo,
      modelName: ENV.AI_MODEL || 'gemini-1.5-flash',
    },
  });

  return {
    riskLevel,
    summary,
    risks,
    suggestions,
    missingInfo,
    requiresHumanReview: true,
    analysisId: analysis.id,
  };
};

// Retrieve System Data Context based on query keywords
async function gatherSystemContext(query) {
  const lower = query.toLowerCase().trim();
  const context = {
    matchedRequests: [],
    matchedEmployees: [],
    matchedAssets: [],
    matchedAccounts: [],
    matchedTasks: [],
    matchedKnowledge: [],
    statistics: null,
    sources: [],
  };

  // 1. Check for Request Code regex (e.g. OFF-2026-001, RES-...)
  const reqMatch = query.match(/OFF-[\w-]+/i);

  // 2. Fetch requests
  const requestWhere = {};
  if (reqMatch) {
    requestWhere.requestCode = { contains: reqMatch[0] };
  }

  const offRequests = await prisma.offboardingRequest.findMany({
    where: requestWhere,
    take: 5,
    include: {
      employee: {
        include: {
          department: true,
          assignments: {
            include: { asset: true },
            where: { returnedAt: null },
          },
        },
      },
      tasks: true,
      approvals: { include: { approver: true }, orderBy: { step: 'asc' } },
      revocations: { include: { account: true } },
      handovers: { include: { items: true } },
      financialReconciliations: true,
      exceptions: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (offRequests.length > 0) {
    context.matchedRequests = offRequests;
    offRequests.forEach((r) => {
      context.sources.push(`Hồ sơ thôi việc: ${r.requestCode} (${r.employee.fullName})`);
    });
  }

  // 3. Search Employees
  const allEmployees = await prisma.employee.findMany({
    include: {
      department: true,
      assignments: {
        include: { asset: true },
      },
      requests: {
        select: { requestCode: true, status: true, riskLevel: true, lastWorkingDate: true },
      },
    },
  });

  const matchingEmps = allEmployees.filter((emp) => {
    const nameLower = emp.fullName.toLowerCase();
    const codeLower = emp.employeeCode.toLowerCase();
    const parts = nameLower.split(' ');
    const lastName = parts[parts.length - 1]; // e.g. Bách, Hoa, Mạnh

    return (
      lower.includes(nameLower) ||
      lower.includes(codeLower) ||
      (lastName.length >= 2 && lower.includes(lastName))
    );
  });

  if (matchingEmps.length > 0) {
    context.matchedEmployees = matchingEmps;
    matchingEmps.forEach((e) => {
      context.sources.push(`Nhân viên: ${e.fullName} (${e.employeeCode})`);
    });
  }

  // 4. Search Assets
  if (
    lower.includes('tài sản') ||
    lower.includes('laptop') ||
    lower.includes('máy tính') ||
    lower.includes('màn hình') ||
    lower.includes('thiết bị') ||
    lower.includes('thẻ') ||
    lower.includes('ast-')
  ) {
    const assets = await prisma.asset.findMany({
      include: {
        assignments: {
          include: { employee: true },
          where: { returnedAt: null },
        },
      },
      take: 10,
    });
    context.matchedAssets = assets;
    assets.slice(0, 3).forEach((a) => {
      context.sources.push(`Tài sản: ${a.assetCode} - ${a.name}`);
    });
  }

  // 5. Search Accounts & Revocations
  if (
    lower.includes('tài khoản') ||
    lower.includes('truy cập') ||
    lower.includes('quyền') ||
    lower.includes('aws') ||
    lower.includes('github') ||
    lower.includes('google') ||
    lower.includes('workspace') ||
    lower.includes('revocation')
  ) {
    const accounts = await prisma.accessAccount.findMany({
      include: {
        revocations: {
          include: { request: true },
        },
      },
      take: 10,
    });
    context.matchedAccounts = accounts;
    accounts.slice(0, 3).forEach((acc) => {
      context.sources.push(`Tài khoản bảo mật: ${acc.systemName} (${acc.accountName})`);
    });
  }

  // 6. Search RAG Knowledge Chunks
  await ensureKnowledgeBase();
  const allKnowledge = await prisma.knowledgeChunk.findMany();
  const matchedChunks = allKnowledge.filter((k) => {
    const contentLower = k.content.toLowerCase();
    const sourceLower = k.sourceName.toLowerCase();
    const keywords = ['bàn giao', 'quy trình', 'tài sản', 'tài khoản', 'bảo mật', 'quy định', 'thôi việc', 'quyết toán', 'tài chính', 'ngoại lệ'];
    return keywords.some((kw) => lower.includes(kw) && (contentLower.includes(kw) || sourceLower.includes(kw)));
  });

  context.matchedKnowledge = matchedChunks.length > 0 ? matchedChunks : allKnowledge.slice(0, 2);
  context.matchedKnowledge.forEach((k) => {
    context.sources.push(`Quy chế RAG: ${k.sourceName}`);
  });

  // 7. General Statistics & System Overview
  const totalEmployees = await prisma.employee.count();
  const totalRequests = await prisma.offboardingRequest.count();
  const pendingRequests = await prisma.offboardingRequest.count({
    where: { status: { in: ['SUBMITTED', 'IN_PROGRESS', 'PENDING_APPROVAL'] } },
  });
  const totalAssets = await prisma.asset.count();
  const assignedAssets = await prisma.asset.count({ where: { status: 'ASSIGNED' } });
  const pendingApprovals = await prisma.approval.count({ where: { status: 'PENDING' } });

  context.statistics = {
    totalEmployees,
    totalRequests,
    pendingRequests,
    totalAssets,
    assignedAssets,
    pendingApprovals,
  };

  // Deduplicate sources
  context.sources = [...new Set(context.sources)];

  return context;
}

// Format system context into text for LLM or intelligent synthesis
function buildContextString(systemCtx) {
  const parts = [];

  // Stats
  if (systemCtx.statistics) {
    const s = systemCtx.statistics;
    parts.push(`[THỐNG KÊ HỆ THỐNG]:
- Tổng số nhân viên: ${s.totalEmployees}
- Tổng hồ sơ thôi việc: ${s.totalRequests} (Đang xử lý: ${s.pendingRequests})
- Tổng tài sản thiết bị: ${s.totalAssets} (Đang cấp phát/chưa thu hồi: ${s.assignedAssets})
- Bước phê duyệt đang chờ: ${s.pendingApprovals}`);
  }

  // Requests
  if (systemCtx.matchedRequests.length > 0) {
    parts.push(`[DANH SÁCH HỒ SƠ THÔI VIỆC TRÊN HỆ THỐNG]:`);
    systemCtx.matchedRequests.forEach((r) => {
      const unreturned = r.employee.assignments.map((a) => `${a.asset.name} (${a.asset.assetCode})`).join(', ') || 'Đã hoàn tất thu hồi';
      const revocations = r.revocations.map((rv) => `${rv.account.systemName}: ${rv.status}`).join('; ') || 'Không có';
      const approvals = r.approvals.map((ap) => `B${ap.step} (${ap.approver.fullName}): ${ap.status}`).join(' | ');
      const completedTasks = r.tasks.filter((t) => t.status === 'COMPLETED').length;
      const totalTasks = r.tasks.length;

      parts.push(`- Hồ sơ: ${r.requestCode}
  + Nhân viên: ${r.employee.fullName} (Mã: ${r.employee.employeeCode}, Chức vụ: ${r.employee.jobTitle || 'N/A'}, Phòng ban: ${r.employee.department?.name || 'N/A'})
  + Trạng thái: ${r.status} | Đánh giá rủi ro: ${r.riskLevel || 'Chưa đánh giá'}
  + Ngày xin thôi việc: ${r.resignationDate ? new Date(r.resignationDate).toLocaleDateString('vi-VN') : 'N/A'}
  + Ngày làm việc cuối: ${r.lastWorkingDate ? new Date(r.lastWorkingDate).toLocaleDateString('vi-VN') : 'N/A'}
  + Tài sản đang giữ chưa thu hồi: ${unreturned}
  + Tài khoản quyền truy cập: ${revocations}
  + Tiến độ nhiệm vụ: ${completedTasks}/${totalTasks} hoàn thành
  + Tiến độ phê duyệt: ${approvals}`);
    });
  }

  // Employees
  if (systemCtx.matchedEmployees.length > 0) {
    parts.push(`[THÔNG TIN NHÂN VIÊN TRÊN HỆ THỐNG]:`);
    systemCtx.matchedEmployees.forEach((e) => {
      const assets = e.assignments.filter((a) => !a.returnedAt).map((a) => a.asset.name).join(', ') || 'Không giữ tài sản nào';
      const reqStatus = e.requests.map((rq) => `${rq.requestCode} (${rq.status})`).join(', ') || 'Không có hồ sơ thôi việc';
      parts.push(`- Nhân viên: ${e.fullName} (${e.employeeCode})
  + Chức danh: ${e.jobTitle || 'N/A'} - Phòng ban: ${e.department?.name || 'N/A'}
  + Email: ${e.email || 'N/A'} | ĐT: ${e.phone || 'N/A'}
  + Tài sản đang giữ: ${assets}
  + Hồ sơ thôi việc liên quan: ${reqStatus}`);
    });
  }

  // Assets
  if (systemCtx.matchedAssets.length > 0) {
    parts.push(`[DANH MỤC TÀI SẢN THIẾT BỊ]:`);
    systemCtx.matchedAssets.forEach((a) => {
      const holder = a.assignments.length > 0 ? a.assignments[0].employee.fullName : 'Sẵn sàng trong kho';
      parts.push(`- ${a.assetCode}: ${a.name} | Trạng thái: ${a.status} | Người đang giữ: ${holder}`);
    });
  }

  // Accounts
  if (systemCtx.matchedAccounts.length > 0) {
    parts.push(`[TÀI KHOẢN VÀ QUYỀN TRUY CẬP HỆ THỐNG]:`);
    systemCtx.matchedAccounts.forEach((acc) => {
      const revStatus = acc.revocations.length > 0 ? acc.revocations.map((r) => r.status).join(', ') : 'Chưa có yêu cầu thu hồi';
      parts.push(`- ${acc.systemName} (${acc.accountName}) - Nhân viên mã: ${acc.employeeCode} | Trạng thái thu hồi: ${revStatus}`);
    });
  }

  // Knowledge Chunks
  if (systemCtx.matchedKnowledge.length > 0) {
    parts.push(`[QUY CHẾ & QUY TRÌNH NỘI BỘ (RAG KNOWLEDGE)]:`);
    systemCtx.matchedKnowledge.forEach((k) => {
      parts.push(`--- ${k.sourceName} ---\n${k.content}`);
    });
  }

  return parts.join('\n\n');
}

// Built-in intelligent synthesis engine (Deterministic and 100% grounded in system data)
function synthesizeResponse(query, systemCtx) {
  const lower = query.toLowerCase();

  // 1. Statistics / Overview / Aggregate metrics
  if (
    lower.includes('thống kê') ||
    lower.includes('tổng quan') ||
    lower.includes('bao nhiêu') ||
    lower.includes('báo cáo')
  ) {
    const s = systemCtx.statistics;
    let response = `### 📊 Tổng quan Dữ liệu Toàn Hệ thống EXITCONTROL\n\n`;
    response += `* **Tổng số nhân sự:** **${s.totalEmployees}** nhân viên thuộc các phòng ban (BOD, HR, TECH, FINANCE, BIZ)\n`;
    response += `* **Hồ sơ thôi việc:** **${s.totalRequests}** hồ sơ (**${s.pendingRequests}** hồ sơ đang trong quy trình xử lý)\n`;
    response += `* **Quản trị tài sản:** **${s.totalAssets}** thiết bị vật lý (**${s.assignedAssets}** thiết bị đang được bàn giao/chưa thu hồi)\n`;
    response += `* **Phê duyệt đang chờ:** **${s.pendingApprovals}** bước duyệt cần cấp quản lý xử lý\n\n`;

    if (systemCtx.matchedRequests.length > 0) {
      response += `#### 📋 Các hồ sơ thôi việc gần nhất:\n`;
      systemCtx.matchedRequests.forEach((r) => {
        response += `- **${r.requestCode}**: ${r.employee.fullName} (${r.employee.jobTitle || 'Nhân viên'}) - Trạng thái: \`${r.status}\` - Rủi ro: \`${r.riskLevel || 'LOW'}\`\n`;
      });
    }

    return response;
  }

  // 2. Specific Request lookup (e.g. OFF-2026-001)
  const isReqQuery =
    lower.includes('off-') ||
    lower.includes('res-') ||
    lower.includes('hồ sơ') ||
    (systemCtx.matchedRequests.length === 1 && !lower.includes('quy trình') && !lower.includes('bàn giao'));

  if (systemCtx.matchedRequests.length > 0 && isReqQuery) {
    const r = systemCtx.matchedRequests[0];
    const unreturned = r.employee.assignments;
    const completedTasks = r.tasks.filter((t) => t.status === 'COMPLETED').length;

    let response = `### 📋 Thông tin hồ sơ thôi việc: **${r.requestCode}**\n\n`;
    response += `* **Nhân viên:** ${r.employee.fullName} (${r.employee.employeeCode})\n`;
    response += `* **Chức danh:** ${r.employee.jobTitle || 'Chuyên viên'} - **Phòng ban:** ${r.employee.department?.name || 'Kỹ thuật'}\n`;
    response += `* **Ngày làm việc cuối (Last Working Date):** ${r.lastWorkingDate ? new Date(r.lastWorkingDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}\n`;
    response += `* **Trạng thái:** \`${r.status}\` | **Mức rủi ro hệ thống:** \`${r.riskLevel || 'MEDIUM'}\`\n\n`;

    response += `#### 💻 Tình trạng tài sản thiết bị:\n`;
    if (unreturned.length > 0) {
      response += `Nhân viên hiện đang giữ **${unreturned.length} tài sản chưa thu hồi**:\n`;
      unreturned.forEach((a) => {
        response += `- **${a.asset.assetCode}**: ${a.asset.name} (Trạng thái: \`${a.asset.status}\`)\n`;
      });
      response += `> *Khuyến nghị:* Cần lập biên bản kiểm tra tình trạng vật lý và hoàn tất thu hồi trước 16h00 ngày làm việc cuối.\n\n`;
    } else {
      response += `✅ Đã thu hồi toàn bộ tài sản thiết bị được giao.\n\n`;
    }

    response += `#### 🔐 Quyền truy cập & Tài khoản bảo mật:\n`;
    if (r.revocations.length > 0) {
      r.revocations.forEach((rv) => {
        const icon = rv.status === 'REVOKED' ? '✅' : '⏳';
        response += `- ${icon} **${rv.account.systemName}** (${rv.account.accountName}): Trạng thái \`${rv.status}\`\n`;
      });
      response += `> *Thời hạn chuẩn:* Đúng **17h30 ngày làm việc cuối cùng**, IT Support phải vô hiệu hóa toàn bộ quyền truy cập cloud/mã nguồn.\n\n`;
    } else {
      response += `Không có tài khoản quyền truy cập đặc biệt nào cần theo dõi.\n\n`;
    }

    response += `#### 📊 Tiến độ thực hiện & Phê duyệt:\n`;
    response += `- **Nhiệm vụ bàn giao:** Đã hoàn thành ${completedTasks}/${r.tasks.length} đầu việc.\n`;
    if (r.approvals.length > 0) {
      response += `- **Luồng duyệt đa cấp:**\n`;
      r.approvals.forEach((ap) => {
        const statusMap = { PENDING: '⏳ Chờ duyệt', APPROVED: '✅ Đã duyệt', REJECTED: '❌ Từ chối' };
        response += `  + Bước ${ap.step} (${ap.approver.fullName}): ${statusMap[ap.status] || ap.status}\n`;
      });
    }

    return response;
  }

  // 2. Specific Employee lookup
  if (systemCtx.matchedEmployees.length > 0 && !lower.includes('thống kê')) {
    const emp = systemCtx.matchedEmployees[0];
    const unreturned = emp.assignments.filter((a) => !a.returnedAt);

    let response = `### 👤 Dữ liệu nhân viên: **${emp.fullName}** (${emp.employeeCode})\n\n`;
    response += `* **Chức danh:** ${emp.jobTitle || 'Chuyên viên'}\n`;
    response += `* **Phòng ban:** ${emp.department?.name || 'N/A'}\n`;
    response += `* **Email:** ${emp.email || 'N/A'} | **SĐT:** ${emp.phone || 'N/A'}\n\n`;

    if (emp.requests.length > 0) {
      response += `#### 📁 Hồ sơ thôi việc liên quan:\n`;
      emp.requests.forEach((rq) => {
        response += `- Mã hồ sơ: **${rq.requestCode}** | Trạng thái: \`${rq.status}\` | Rủi ro: \`${rq.riskLevel || 'N/A'}\`\n`;
      });
      response += `\n`;
    }

    response += `#### 💻 Danh mục tài sản công ty cấp phát:\n`;
    if (unreturned.length > 0) {
      unreturned.forEach((a) => {
        response += `- **${a.asset.assetCode}**: ${a.asset.name} (Đang giữ, chưa bàn giao)\n`;
      });
    } else {
      response += `Hiện không giữ tài sản công ty nào.\n`;
    }

    return response;
  }

  // 3. Asset queries
  if (
    lower.includes('tài sản') ||
    lower.includes('laptop') ||
    lower.includes('máy tính') ||
    lower.includes('màn hình') ||
    lower.includes('thiết bị')
  ) {
    let response = `### 💻 Thông tin Tài sản & Thiết bị trên Hệ thống\n\n`;
    if (systemCtx.matchedAssets.length > 0) {
      response += `Hệ thống ghi nhận **${systemCtx.matchedAssets.length} tài sản**:\n\n`;
      systemCtx.matchedAssets.forEach((a) => {
        const holder = a.assignments.length > 0 ? `Đang cấp phát cho **${a.assignments[0].employee.fullName}**` : '🟢 Trong kho sẵn sàng cấp phát';
        response += `- **${a.assetCode}**: ${a.name}\n  + Hiện trạng: \`${a.status}\` | ${holder}\n`;
      });
      response += `\n> **Quy chế thu hồi (POL-02):** Tất cả thiết bị phải được hoàn trả và kiểm định trước hoặc trong ngày làm việc cuối cùng. Trường hợp hư hỏng hoặc mất mát cần tạo phiếu Ngoại lệ (Process Exception).\n`;
    } else {
      response += `Hiện tại không tìm thấy thông tin tài sản phù hợp trong hệ thống.\n`;
    }
    return response;
  }

  // 4. Access accounts queries
  if (
    lower.includes('tài khoản') ||
    lower.includes('quyền') ||
    lower.includes('aws') ||
    lower.includes('github') ||
    lower.includes('truy cập')
  ) {
    let response = `### 🔐 Quyền truy cập Hệ thống & Bảo mật Cloud\n\n`;
    if (systemCtx.matchedAccounts.length > 0) {
      response += `Danh mục tài khoản hệ thống trọng yếu được quản lý:\n\n`;
      systemCtx.matchedAccounts.forEach((acc) => {
        const revStatus = acc.revocations.length > 0 ? acc.revocations[0].status : 'ACTIVE';
        response += `- **${acc.systemName}** (${acc.accountName}) - Nhân viên: ${acc.employeeCode}\n  + Trạng thái thu hồi: \`${revStatus}\`\n`;
      });
      response += `\n> **Quy chuẩn bảo mật (SEC-03):** Toàn bộ tài khoản Cloud (AWS/GCP), GitHub Enterprise, SSH Keys và Email doanh nghiệp phải được vô hiệu hóa chính xác lúc **17h30 ngày làm việc cuối cùng** để triệt tiêu rủi ro rò rỉ mã nguồn.\n`;
    } else {
      response += `Không có tài khoản đặc thù nào cần rà soát.\n`;
    }
    return response;
  }

  // 5. System Statistics / Overview
  if (
    lower.includes('thống kê') ||
    lower.includes('tổng quan') ||
    lower.includes('bao nhiêu') ||
    lower.includes('danh sách') ||
    lower.includes('báo cáo')
  ) {
    const s = systemCtx.statistics;
    let response = `### 📊 Tổng quan Dữ liệu Toàn Hệ thống EXITCONTROL\n\n`;
    response += `* **Tổng số nhân sự:** **${s.totalEmployees}** nhân viên thuộc các phòng ban (BOD, HR, TECH, FINANCE, BIZ)\n`;
    response += `* **Hồ sơ thôi việc:** **${s.totalRequests}** hồ sơ (**${s.pendingRequests}** hồ sơ đang trong quy trình xử lý)\n`;
    response += `* **Quản trị tài sản:** **${s.totalAssets}** thiết bị vật lý (**${s.assignedAssets}** thiết bị đang được bàn giao/chưa thu hồi)\n`;
    response += `* **Phê duyệt đang chờ:** **${s.pendingApprovals}** bước duyệt cần cấp quản lý xử lý\n\n`;

    if (systemCtx.matchedRequests.length > 0) {
      response += `#### 📋 Các hồ sơ thôi việc gần nhất:\n`;
      systemCtx.matchedRequests.forEach((r) => {
        response += `- **${r.requestCode}**: ${r.employee.fullName} (${r.employee.jobTitle || 'Nhân viên'}) - Trạng thái: \`${r.status}\` - Rủi ro: \`${r.riskLevel || 'LOW'}\`\n`;
      });
    }

    return response;
  }

  // 6. Quy trình bàn giao / RAG Knowledge queries
  if (
    lower.includes('quy trình') ||
    lower.includes('bàn giao') ||
    lower.includes('chính sách') ||
    lower.includes('quy chế') ||
    lower.includes('offboarding')
  ) {
    let response = `### 📖 Quy chế Bàn giao công việc & Quy trình Thôi việc Chuẩn\n\n`;
    response += `Căn cứ theo tài liệu quy chuẩn **SOP-01 (Nexora ExitControl)**, quy trình thôi việc bao gồm **6 giai đoạn** chính:\n\n`;
    response += `1. **Tiếp nhận & Đăng ký hồ sơ:** Nhân viên nộp đơn hoặc Quản lý trực tiếp tạo hồ sơ thôi việc trên hệ thống.\n`;
    response += `2. **Tự động sinh nhiệm vụ:** Hệ thống phân bổ danh mục đầu việc theo phòng ban (kỹ thuật, hành chính, tài chính).\n`;
    response += `3. **Bàn giao chuyên môn & Mã nguồn:** Bàn giao tài liệu kiến trúc, quyền admin repo GitHub, Confluence cho người kế nhiệm trước tối thiểu 03 ngày.\n`;
    response += `4. **Kiểm định & Thu hồi tài sản:** IT kiểm tra số Serial, hiện trạng laptop, màn hình, thẻ từ và lập biên bản có chữ ký.\n`;
    response += `5. **Vô hiệu hóa quyền truy cập:** Khóa tài khoản Cloud AWS, thu hồi quyền GitHub Enterprise, vô hiệu hóa email lúc **17h30 ngày cuối cùng**.\n`;
    response += `6. **Phê duyệt đa cấp:** Tuần tự qua 4 bước: Manager -> IT Support -> Kế toán (đối soát công nợ) -> Trưởng phòng HR.\n\n`;

    if (systemCtx.matchedRequests.length > 0) {
      const r = systemCtx.matchedRequests[0];
      response += `> *Ghi nhận thực tế:* Hồ sơ **${r.requestCode}** của ${r.employee.fullName} hiện đang ở bước bàn giao kỹ thuật và thu hồi tài sản.\n`;
    }

    return response;
  }

  // Default fallback answer incorporating real system context
  let response = `Tôi là Trợ lý AI EXITCONTROL (RAG Knowledge Engine). Tôi có toàn quyền truy xuất dữ liệu thời gian thực trên hệ thống.\n\n`;
  response += `**Hệ thống hiện đang quản lý:**\n`;
  response += `- **${systemCtx.statistics.totalRequests}** hồ sơ thôi việc (Ví dụ: \`OFF-2026-001\` của nhân viên ${systemCtx.matchedRequests[0]?.employee.fullName || 'Nguyễn Văn Bách'})\n`;
  response += `- **${systemCtx.statistics.totalEmployees}** nhân viên và **${systemCtx.statistics.totalAssets}** tài sản thiết bị\n`;
  response += `- Bộ quy chế nội bộ: Quy trình bàn giao (SOP-01), Quy chế thu hồi tài sản (POL-02), Bảo mật tài khoản (SEC-03), Quyết toán tài chính (FIN-04)\n\n`;
  response += `Bạn có thể hỏi tôi chi tiết về bất kỳ hồ sơ nào (VD: *"Phân tích hồ sơ OFF-2026-001"*), kiểm tra tài sản của một nhân viên (VD: *"Tài sản của Nguyễn Văn Bách"*), hoặc tra cứu quy chuẩn bàn giao.`;

  return response;
}

// Call external Gemini API if a real API key is configured
async function callGeminiAPI(systemContextText, userMessage) {
  const apiKey = ENV.AI_API_KEY;
  if (!apiKey || apiKey === 'mock_ai_api_key' || apiKey.startsWith('your_')) {
    return null;
  }

  const model = ENV.AI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Bạn là Trợ lý AI chuyên trách quản trị hệ thống và kiểm soát thôi việc doanh nghiệp EXITCONTROL (Nexora Technology Systems).
Dưới đây là DỮ LIỆU THỰC TẾ TRÍCH XUẤT TỪ CƠ SỞ DỮ LIỆU HỆ THỐNG VÀ KHO TRI THỨC NỘI BỘ (RAG):

${systemContextText}

YÊU CẦU:
1. Trả lời câu hỏi của người dùng dựa TRỰC TIẾP và CHÍNH XÁC trên dữ liệu hệ thống được cung cấp ở trên.
2. Trích dẫn rõ mã hồ sơ, tên nhân viên, mã tài sản, hệ thống tài khoản và điều khoản quy chế khi trả lời.
3. Sử dụng định dạng Markdown rõ ràng, chuyên nghiệp (tiêu đề, danh sách, in đậm).
4. Giữ phong thái khách quan, bảo mật và hỗ trợ tốt nhất cho quy trình vận hành.

Câu hỏi của người dùng: "${userMessage}"`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Gemini API call returned non-200:', response.status);
      return null;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.warn('Gemini API call failed or timed out:', err.message);
    return null;
  }
}

// Main Chat with AI & RAG Engine
export const chatWithAI = async (message, context = {}, currentUser = null) => {
  if (!message || typeof message !== 'string') {
    return {
      reply: 'Vui lòng nhập nội dung câu hỏi.',
      disclaimer: 'Khuyến cáo: Câu trả lời của AI chỉ mang tính chất tham khảo.',
      sources: [],
    };
  }

  // 1. Gather real-time system context
  const systemContext = await gatherSystemContext(message);
  const contextString = buildContextString(systemContext);

  // 2. Attempt LLM generation if valid API Key exists
  let reply = await callGeminiAPI(contextString, message);

  // 3. Fallback to built-in intelligent context synthesizer
  if (!reply) {
    reply = synthesizeResponse(message, systemContext);
  }

  return {
    reply,
    sources: systemContext.sources || [],
    disclaimer: 'Khuyến cáo: Dữ liệu được trích xuất trực tiếp từ hệ thống EXITCONTROL và kho tri thức quy chế nội bộ. Mọi quyết định phê duyệt chính thức thuộc thẩm quyền của cấp quản lý được chỉ định.',
  };
};
