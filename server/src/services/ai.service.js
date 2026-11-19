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

// ============================================================================
// DYNAMIC FILTERING & QUERY ENGINE
// Allows users to filter, query, and search any system data via natural language
// ============================================================================
async function executeFilterQuery(query) {
  const lower = query.toLowerCase().trim();
  const sources = [];

  // 1. FILTER EMPLOYEES (Lọc Nhân sự theo phòng ban, vai trò, tài sản đang giữ)
  const isEmployeeFilter =
    lower.includes('nhân viên') ||
    lower.includes('nhân sự') ||
    lower.includes('danh sách nhân viên') ||
    lower.includes('ai làm ở') ||
    lower.includes('lọc theo phòng ban') ||
    (lower.includes('lọc') && (lower.includes('tech') || lower.includes('kỹ thuật') || lower.includes('hr') || lower.includes('nhân sự') || lower.includes('kế toán') || lower.includes('kinh doanh')));

  if (isEmployeeFilter && !lower.includes('hồ sơ') && !lower.includes('quy trình')) {
    let deptCode = null;
    let deptName = 'Tất cả phòng ban';

    if (lower.includes('kỹ thuật') || lower.includes('tech') || lower.includes('công nghệ')) {
      deptCode = 'TECH';
      deptName = 'Phòng Kỹ thuật & Công nghệ (TECH)';
    } else if (lower.includes('nhân sự') || lower.includes('hr')) {
      deptCode = 'HR';
      deptName = 'Phòng Nhân sự (HR)';
    } else if (lower.includes('kế toán') || lower.includes('tài chính') || lower.includes('finance')) {
      deptCode = 'FINANCE';
      deptName = 'Phòng Kế toán & Tài chính (FINANCE)';
    } else if (lower.includes('kinh doanh') || lower.includes('marketing') || lower.includes('biz')) {
      deptCode = 'BIZ';
      deptName = 'Phòng Kinh doanh & Marketing (BIZ)';
    } else if (lower.includes('giám đốc') || lower.includes('bod')) {
      deptCode = 'BOD';
      deptName = 'Ban Giám Đốc (BOD)';
    }

    const whereClause = {};
    if (deptCode) {
      whereClause.department = { code: deptCode };
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
        assignments: {
          include: { asset: true },
          where: { returnedAt: null },
        },
        requests: {
          select: { requestCode: true, status: true, riskLevel: true },
        },
      },
      orderBy: { employeeCode: 'asc' },
    });

    sources.push(`Lọc Nhân sự: ${deptName} (${employees.length} nhân viên)`);

    let response = `### 👥 Kết quả Lọc Nhân sự: **${deptName}**\n\n`;
    response += `Hệ thống tìm thấy **${employees.length} nhân sự** phù hợp với điều kiện lọc:\n\n`;

    response += `| STT | Mã NV | Họ và Tên | Chức danh | Phòng ban | Tài sản đang giữ | Hồ sơ thôi việc |\n`;
    response += `| --- | --- | --- | --- | --- | --- | --- |\n`;

    employees.forEach((e, idx) => {
      const assetsCount = e.assignments.length > 0 ? `${e.assignments.length} thiết bị` : 'Không';
      const offStatus = e.requests.length > 0 ? e.requests.map((r) => `\`${r.requestCode}\` (${r.status})`).join(', ') : 'Không có';
      response += `| ${idx + 1} | **${e.employeeCode}** | ${e.fullName} | ${e.jobTitle || 'Chuyên viên'} | ${e.department?.name || 'N/A'} | ${assetsCount} | ${offStatus} |\n`;
    });

    response += `\n> **Gợi ý tra cứu tiếp:** Bạn có thể hỏi *"Kiểm tra tài sản của [Tên nhân viên]"* hoặc *"Phân tích hồ sơ thôi việc của nhân viên này"* để xem chi tiết.`;
    return { reply: response, sources };
  }

  // 2. FILTER OFFBOARDING REQUESTS (Lọc hồ sơ thôi việc theo trạng thái, mức rủi ro, nhân viên)
  const isRequestFilter =
    lower.includes('hồ sơ') ||
    lower.includes('thôi việc') ||
    lower.includes('nghỉ việc') ||
    lower.includes('offboarding') ||
    lower.includes('đang xử lý') ||
    lower.includes('chờ duyệt') ||
    lower.includes('rủi ro cao');

  if (isRequestFilter && !lower.includes('quy trình bàn giao') && !lower.includes('sop')) {
    const whereClause = {};
    let filterDesc = 'Tất cả hồ sơ thôi việc';

    if (lower.includes('đang xử lý') || lower.includes('in_progress')) {
      whereClause.status = 'IN_PROGRESS';
      filterDesc = 'Trạng thái: Đang xử lý (IN_PROGRESS)';
    } else if (lower.includes('chờ duyệt') || lower.includes('pending')) {
      whereClause.status = { in: ['SUBMITTED', 'PENDING_APPROVAL'] };
      filterDesc = 'Trạng thái: Đang chờ phê duyệt';
    } else if (lower.includes('hoàn thành') || lower.includes('completed')) {
      whereClause.status = 'COMPLETED';
      filterDesc = 'Trạng thái: Đã hoàn tất (COMPLETED)';
    } else if (lower.includes('cao') || lower.includes('rủi ro cao') || lower.includes('high') || lower.includes('critical')) {
      whereClause.riskLevel = { in: ['HIGH', 'CRITICAL'] };
      filterDesc = 'Mức rủi ro: CAO / NGUY HIỂM';
    }

    // Specific request code
    const reqMatch = query.match(/OFF-[\w-]+/i);
    if (reqMatch) {
      whereClause.requestCode = { contains: reqMatch[0] };
      filterDesc = `Mã hồ sơ: ${reqMatch[0]}`;
    }

    const requests = await prisma.offboardingRequest.findMany({
      where: whereClause,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    sources.push(`Lọc Hồ sơ: ${filterDesc} (${requests.length} hồ sơ)`);

    let response = `### 📋 Kết quả Lọc Hồ sơ Thôi việc: **${filterDesc}**\n\n`;
    response += `Hệ thống ghi nhận **${requests.length} hồ sơ** thỏa mãn điều kiện:\n\n`;

    if (requests.length === 0) {
      response += `Không tìm thấy hồ sơ nào phù hợp với bộ lọc này.\n`;
      return { reply: response, sources };
    }

    response += `| Mã hồ sơ | Nhân viên | Phòng ban | Trạng thái | Mức rủi ro | Ngày làm việc cuối | Tài sản chưa trả | Quyền chưa khóa |\n`;
    response += `| --- | --- | --- | --- | --- | --- | --- | --- |\n`;

    requests.forEach((r) => {
      const lastDate = r.lastWorkingDate ? new Date(r.lastWorkingDate).toLocaleDateString('vi-VN') : 'Chưa định';
      const unreturned = r.employee.assignments.length > 0 ? `${r.employee.assignments.length} thiết bị` : '✅ Đã trả hết';
      const pendingAccounts = r.revocations.filter((rv) => rv.status !== 'REVOKED').length;
      const accText = pendingAccounts > 0 ? `⏳ ${pendingAccounts} tài khoản` : '✅ Đã khóa hết';

      response += `| **${r.requestCode}** | ${r.employee.fullName} (${r.employee.employeeCode}) | ${r.employee.department?.name || 'N/A'} | \`${r.status}\` | \`${r.riskLevel || 'LOW'}\` | ${lastDate} | ${unreturned} | ${accText} |\n`;
    });

    // Detail for first request
    if (requests.length > 0) {
      const first = requests[0];
      response += `\n#### 📌 Chi tiết tiến độ hồ sơ tiêu biểu: **${first.requestCode}** (${first.employee.fullName})\n`;
      response += `- **Nhiệm vụ bàn giao:** ${first.tasks.filter((t) => t.status === 'COMPLETED').length}/${first.tasks.length} đầu việc hoàn thành.\n`;
      if (first.approvals.length > 0) {
        response += `- **Tiến độ phê duyệt đa cấp:**\n`;
        first.approvals.forEach((ap) => {
          const map = { PENDING: '⏳ Chờ duyệt', APPROVED: '✅ Đã duyệt', REJECTED: '❌ Từ chối' };
          response += `  + Bước ${ap.step} (${ap.approver.fullName}): ${map[ap.status] || ap.status}\n`;
        });
      }
    }

    return { reply: response, sources };
  }

  // 3. FILTER ASSETS (Lọc tài sản thiết bị theo trạng thái cấp phát, người giữ)
  const isAssetFilter =
    lower.includes('tài sản') ||
    lower.includes('thiết bị') ||
    lower.includes('laptop') ||
    lower.includes('máy tính') ||
    lower.includes('màn hình') ||
    lower.includes('thẻ từ') ||
    lower.includes('chưa thu hồi') ||
    lower.includes('thu hồi tài sản');

  if (isAssetFilter && !lower.includes('chính sách thu hồi tài sản')) {
    const whereClause = {};
    let filterDesc = 'Toàn bộ danh mục tài sản';

    if (lower.includes('chưa thu hồi') || lower.includes('đang cấp phát') || lower.includes('đang giữ') || lower.includes('assigned')) {
      whereClause.status = 'ASSIGNED';
      filterDesc = 'Tài sản đang cấp phát / Chưa thu hồi';
    } else if (lower.includes('trong kho') || lower.includes('sẵn sàng') || lower.includes('available')) {
      whereClause.status = 'AVAILABLE';
      filterDesc = 'Tài sản sẵn sàng trong kho';
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        assignments: {
          include: { employee: { include: { department: true } } },
          where: { returnedAt: null },
        },
      },
      orderBy: { assetCode: 'asc' },
    });

    sources.push(`Lọc Tài sản: ${filterDesc} (${assets.length} thiết bị)`);

    let response = `### 💻 Kết quả Lọc Tài sản & Thiết bị: **${filterDesc}**\n\n`;
    response += `Hệ thống ghi nhận **${assets.length} thiết bị**:\n\n`;

    response += `| Mã tài sản | Tên thiết bị | Danh mục | Trạng thái | Người đang giữ | Mã NV | Phòng ban |\n`;
    response += `| --- | --- | --- | --- | --- | --- | --- |\n`;

    assets.forEach((a) => {
      const holder = a.assignments.length > 0 ? a.assignments[0].employee : null;
      const holderName = holder ? holder.fullName : '🟢 Trong kho';
      const holderCode = holder ? holder.employeeCode : '-';
      const holderDept = holder?.department ? holder.department.name : '-';

      response += `| **${a.assetCode}** | ${a.name} | ${a.category} | \`${a.status}\` | **${holderName}** | ${holderCode} | ${holderDept} |\n`;
    });

    response += `\n> **Quy chế bàn giao (POL-02):** Tất cả thiết bị phải được kiểm tra số Serial, hiện trạng vật lý và hoàn tất biên bản thu hồi trước khi phê duyệt bước IT.`;
    return { reply: response, sources };
  }

  // 4. FILTER ACCOUNTS (Lọc tài khoản hệ thống & quyền truy cập cloud)
  const isAccountFilter =
    lower.includes('tài khoản') ||
    lower.includes('truy cập') ||
    lower.includes('quyền') ||
    lower.includes('aws') ||
    lower.includes('github') ||
    lower.includes('google workspace') ||
    lower.includes('khóa quyền');

  if (isAccountFilter && !lower.includes('thời điểm thu hồi')) {
    const whereClause = {};
    let filterDesc = 'Danh mục tài khoản hệ thống';

    if (lower.includes('chưa thu hồi') || lower.includes('chờ khóa') || lower.includes('pending')) {
      filterDesc = 'Tài khoản đang chờ thu hồi quyền (PENDING)';
    }

    const accounts = await prisma.accessAccount.findMany({
      where: whereClause,
      include: {
        revocations: {
          include: { request: { include: { employee: true } } },
        },
      },
    });

    sources.push(`Lọc Quyền truy cập: ${filterDesc} (${accounts.length} tài khoản)`);

    let response = `### 🔐 Kết quả Lọc Tài khoản & Quyền truy cập Hệ thống\n\n`;
    response += `Hệ thống quản lý **${accounts.length} tài khoản trọng yếu**:\n\n`;

    response += `| Hệ thống | Tên tài khoản | Mã nhân viên | Nhân viên sở hữu | Trạng thái thu hồi | Hạn chót thu hồi |\n`;
    response += `| --- | --- | --- | --- | --- | --- |\n`;

    accounts.forEach((acc) => {
      const rev = acc.revocations.length > 0 ? acc.revocations[0] : null;
      const empName = rev?.request?.employee?.fullName || 'N/A';
      const revStatus = rev ? `\`${rev.status}\`` : '`ACTIVE`';
      const deadline = rev?.request?.lastWorkingDate
        ? `${new Date(rev.request.lastWorkingDate).toLocaleDateString('vi-VN')} lúc 17h30`
        : '17h30 ngày làm việc cuối';

      response += `| **${acc.systemName}** | ${acc.accountName} | ${acc.employeeCode} | ${empName} | ${revStatus} | ${deadline} |\n`;
    });

    response += `\n> **Quy chuẩn an toàn (SEC-03):** Toàn bộ tài khoản AWS IAM, GitHub Enterprise và Google Workspace phải được chuyển sang chế độ vô hiệu hóa đúng **17h30 ngày làm việc cuối cùng**.`;
    return { reply: response, sources };
  }

  // 5. FILTER RESIGNATIONS (Lọc đơn xin thôi việc)
  if (lower.includes('đơn xin nghỉ') || lower.includes('đơn từ chức') || lower.includes('resignation')) {
    const resignations = await prisma.resignationRequest.findMany({
      include: { employee: { include: { department: true } } },
      orderBy: { createdAt: 'desc' },
    });

    sources.push(`Lọc Đơn xin nghỉ: ${resignations.length} đơn`);

    let response = `### 📄 Kết quả Lọc Đơn xin Thôi việc trên Hệ thống\n\n`;
    response += `Hệ thống ghi nhận **${resignations.length} đơn từ chức**:\n\n`;

    response += `| Mã đơn | Nhân viên | Phòng ban | Ngày nộp đơn | Ngày dự kiến nghỉ | Trạng thái duyệt | Lý do |\n`;
    response += `| --- | --- | --- | --- | --- | --- | --- |\n`;

    resignations.forEach((r) => {
      const resignDate = new Date(r.resignationDate).toLocaleDateString('vi-VN');
      const lastDate = new Date(r.lastWorkingDate).toLocaleDateString('vi-VN');
      response += `| **${r.requestCode}** | ${r.employee.fullName} | ${r.employee.department?.name || 'N/A'} | ${resignDate} | ${lastDate} | \`${r.status}\` | ${r.reason || 'N/A'} |\n`;
    });

    return { reply: response, sources };
  }

  // 6. FILTER FINANCIAL RECONCILIATIONS (Lọc công nợ, đối soát tài chính)
  if (lower.includes('công nợ') || lower.includes('tài chính') || lower.includes('tạm ứng') || lower.includes('quyết toán')) {
    const finances = await prisma.financialReconciliation.findMany({
      include: { request: { include: { employee: true } } },
    });

    sources.push(`Lọc Tài chính: ${finances.length} hồ sơ đối soát`);

    let response = `### 💰 Kết quả Lọc Đối soát Tài chính & Công nợ\n\n`;
    response += `Hệ thống ghi nhận **${finances.length} hồ sơ đối soát tài chính**:\n\n`;

    response += `| Mã hồ sơ | Nhân viên | Tiền tạm ứng | Khoản nợ công ty | Chi phí chưa quyết toán | Trạng thái |\n`;
    response += `| --- | --- | --- | --- | --- | --- |\n`;

    finances.forEach((f) => {
      const emp = f.request?.employee?.fullName || 'N/A';
      response += `| **${f.request?.requestCode || 'N/A'}** | ${emp} | ${Number(f.advanceAmount).toLocaleString('vi-VN')} đ | ${Number(f.debtAmount).toLocaleString('vi-VN')} đ | ${Number(f.unsettledExpense).toLocaleString('vi-VN')} đ | \`${f.status}\` |\n`;
    });

    response += `\n> **Chính sách (FIN-04):** Toàn bộ các khoản tạm ứng và số dư nợ phải đạt trạng thái \`CLEARED\` (bằng 0 hoặc đã khấu trừ vào kỳ lương cuối) trước khi duyệt bước Kế toán.`;
    return { reply: response, sources };
  }

  // 7. FILTER EXCEPTIONS (Lọc sự cố & ngoại lệ quy trình)
  if (lower.includes('ngoại lệ') || lower.includes('sự cố') || lower.includes('exception') || lower.includes('mất tài sản')) {
    const exceptions = await prisma.processException.findMany({
      include: { request: { include: { employee: true } } },
      orderBy: { createdAt: 'desc' },
    });

    sources.push(`Lọc Ngoại lệ: ${exceptions.length} phiếu`);

    let response = `### ⚠️ Kết quả Lọc Phiếu Ngoại lệ & Sự cố Quy trình\n\n`;
    response += `Hệ thống ghi nhận **${exceptions.length} trường hợp ngoại lệ**:\n\n`;

    response += `| Tiêu đề sự cố | Phân loại | Mức ưu tiên | Trạng thái | Hồ sơ liên quan | Nhân viên |\n`;
    response += `| --- | --- | --- | --- | --- | --- |\n`;

    exceptions.forEach((ex) => {
      response += `| **${ex.title}** | \`${ex.type}\` | \`${ex.priority}\` | \`${ex.status}\` | **${ex.request?.requestCode || 'N/A'}** | ${ex.request?.employee?.fullName || 'N/A'} |\n`;
    });

    return { reply: response, sources };
  }

  // If no specific filter triggered, return null to continue general synthesis
  return null;
}

// Retrieve General System Context for fallback or LLM
async function gatherSystemContext(query) {
  const lower = query.toLowerCase().trim();
  const context = {
    matchedRequests: [],
    matchedEmployees: [],
    matchedAssets: [],
    matchedAccounts: [],
    matchedKnowledge: [],
    statistics: null,
    sources: [],
  };

  // Check for Request Code regex
  const reqMatch = query.match(/OFF-[\w-]+/i);
  const requestWhere = reqMatch ? { requestCode: { contains: reqMatch[0] } } : {};

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
    },
    orderBy: { createdAt: 'desc' },
  });

  if (offRequests.length > 0) {
    context.matchedRequests = offRequests;
    offRequests.forEach((r) => {
      context.sources.push(`Hồ sơ: ${r.requestCode} (${r.employee.fullName})`);
    });
  }

  // Employees lookup
  const allEmployees = await prisma.employee.findMany({
    include: {
      department: true,
      assignments: { include: { asset: true }, where: { returnedAt: null } },
      requests: { select: { requestCode: true, status: true, riskLevel: true } },
    },
  });

  const matchingEmps = allEmployees.filter((emp) => {
    const nameLower = emp.fullName.toLowerCase();
    const codeLower = emp.employeeCode.toLowerCase();
    const parts = nameLower.split(' ');
    const lastName = parts[parts.length - 1];
    return (
      lower.includes(nameLower) ||
      lower.includes(codeLower) ||
      (lastName.length >= 2 && lower.includes(lastName))
    );
  });

  if (matchingEmps.length > 0) {
    context.matchedEmployees = matchingEmps;
    matchingEmps.forEach((e) => context.sources.push(`Nhân viên: ${e.fullName} (${e.employeeCode})`));
  }

  // Assets lookup
  const assets = await prisma.asset.findMany({
    include: { assignments: { include: { employee: true }, where: { returnedAt: null } } },
    take: 10,
  });
  context.matchedAssets = assets;

  // Accounts lookup
  const accounts = await prisma.accessAccount.findMany({
    include: { revocations: true },
    take: 10,
  });
  context.matchedAccounts = accounts;

  // Knowledge base
  await ensureKnowledgeBase();
  const allKnowledge = await prisma.knowledgeChunk.findMany();
  context.matchedKnowledge = allKnowledge;

  // Statistics
  const [totalEmployees, totalRequests, totalAssets, assignedAssets, pendingApprovals] = await Promise.all([
    prisma.employee.count(),
    prisma.offboardingRequest.count(),
    prisma.asset.count(),
    prisma.asset.count({ where: { status: 'ASSIGNED' } }),
    prisma.approval.count({ where: { status: 'PENDING' } }),
  ]);

  context.statistics = {
    totalEmployees,
    totalRequests,
    totalAssets,
    assignedAssets,
    pendingApprovals,
  };

  context.sources = [...new Set(context.sources)];
  return context;
}

// Format system context into text
function buildContextString(systemCtx) {
  const parts = [];

  if (systemCtx.statistics) {
    const s = systemCtx.statistics;
    parts.push(`[THỐNG KÊ TOÀN BỘ HỆ THỐNG]:
- Tổng số nhân sự: ${s.totalEmployees}
- Tổng hồ sơ thôi việc: ${s.totalRequests}
- Tổng tài sản thiết bị: ${s.totalAssets} (Đang cấp phát: ${s.assignedAssets})
- Phê duyệt đang chờ: ${s.pendingApprovals}`);
  }

  if (systemCtx.matchedRequests.length > 0) {
    parts.push(`[DANH SÁCH HỒ SƠ THÔI VIỆC]:`);
    systemCtx.matchedRequests.forEach((r) => {
      const unreturned = r.employee.assignments.map((a) => a.asset.name).join(', ') || 'Đã hoàn tất thu hồi';
      const revs = r.revocations.map((rv) => `${rv.account.systemName}: ${rv.status}`).join('; ') || 'Không có';
      parts.push(`- Hồ sơ ${r.requestCode}: Nhân viên ${r.employee.fullName} (${r.employee.employeeCode}) | Phòng: ${r.employee.department?.name} | Trạng thái: ${r.status} | Rủi ro: ${r.riskLevel || 'N/A'} | Tài sản chưa trả: ${unreturned} | Quyền tài khoản: ${revs}`);
    });
  }

  if (systemCtx.matchedEmployees.length > 0) {
    parts.push(`[DANH SÁCH NHÂN VIÊN]:`);
    systemCtx.matchedEmployees.forEach((e) => {
      parts.push(`- ${e.employeeCode}: ${e.fullName} | Phòng: ${e.department?.name} | Chức danh: ${e.jobTitle || 'N/A'} | Tài sản đang giữ: ${e.assignments.length} thiết bị`);
    });
  }

  if (systemCtx.matchedKnowledge.length > 0) {
    parts.push(`[QUY CHẾ NỘI BỘ (RAG KNOWLEDGE)]:`);
    systemCtx.matchedKnowledge.forEach((k) => {
      parts.push(`--- ${k.sourceName} ---\n${k.content}`);
    });
  }

  return parts.join('\n\n');
}

// General Synthesis Engine
function synthesizeGeneralResponse(query, systemCtx) {
  const lower = query.toLowerCase();

  // Overview / Stats
  if (lower.includes('thống kê') || lower.includes('tổng quan') || lower.includes('bao nhiêu')) {
    const s = systemCtx.statistics;
    let res = `### 📊 Tổng quan Dữ liệu Toàn Hệ thống EXITCONTROL\n\n`;
    res += `* **Tổng số nhân sự:** **${s.totalEmployees}** nhân sự thuộc các phòng ban (TECH, HR, FINANCE, BIZ, BOD)\n`;
    res += `* **Hồ sơ thôi việc:** **${s.totalRequests}** hồ sơ đang được quản lý\n`;
    res += `* **Quản trị tài sản:** **${s.totalAssets}** thiết bị vật lý (**${s.assignedAssets}** đang cấp phát)\n`;
    res += `* **Phê duyệt đang chờ:** **${s.pendingApprovals}** bước duyệt cần xử lý\n\n`;

    if (systemCtx.matchedRequests.length > 0) {
      res += `#### 📋 Danh sách hồ sơ gần nhất:\n`;
      systemCtx.matchedRequests.forEach((r) => {
        res += `- **${r.requestCode}**: ${r.employee.fullName} (${r.employee.jobTitle || 'Nhân viên'}) - Trạng thái: \`${r.status}\` - Rủi ro: \`${r.riskLevel || 'LOW'}\`\n`;
      });
    }
    return res;
  }

  // Quy trình bàn giao SOP-01
  if (lower.includes('quy trình') || lower.includes('bàn giao') || lower.includes('sop')) {
    let res = `### 📖 Quy chế Bàn giao công việc & Quy trình Thôi việc Chuẩn\n\n`;
    res += `Căn cứ theo tài liệu quy chuẩn **SOP-01 (Nexora ExitControl)**, quy trình thôi việc bao gồm **6 giai đoạn** chính:\n\n`;
    res += `1. **Tiếp nhận & Đăng ký hồ sơ:** Nhân viên nộp đơn hoặc Quản lý trực tiếp tạo hồ sơ thôi việc trên hệ thống.\n`;
    res += `2. **Tự động sinh nhiệm vụ:** Hệ thống phân bổ danh mục đầu việc theo phòng ban (kỹ thuật, hành chính, tài chính).\n`;
    res += `3. **Bàn giao chuyên môn & Mã nguồn:** Bàn giao tài liệu kiến trúc, quyền admin repo GitHub, Confluence cho người kế nhiệm trước tối thiểu 03 ngày.\n`;
    res += `4. **Kiểm định & Thu hồi tài sản:** IT kiểm tra số Serial, hiện trạng laptop, màn hình, thẻ từ và lập biên bản có chữ ký.\n`;
    res += `5. **Vô hiệu hóa quyền truy cập:** Khóa tài khoản Cloud AWS, thu hồi quyền GitHub Enterprise, vô hiệu hóa email lúc **17h30 ngày cuối cùng**.\n`;
    res += `6. **Phê duyệt đa cấp:** Tuần tự qua 4 bước: Manager -> IT Support -> Kế toán (đối soát công nợ) -> Trưởng phòng HR.\n`;
    return res;
  }

  // Chính sách tài sản POL-02
  if (lower.includes('chính sách') && lower.includes('tài sản')) {
    let res = `### 💻 Chính sách Quản lý & Thu hồi Tài sản (POL-02)\n\n`;
    res += `1. **Nghĩa vụ hoàn trả:** Nhân viên phải hoàn trả tất cả tài sản (Laptop, Màn hình, Thẻ từ) trước hoặc trong ngày làm việc cuối.\n`;
    res += `2. **Kiểm định hiện trạng:** IT kiểm tra số serial, màn hình, bàn phím và thân vỏ thiết bị.\n`;
    res += `3. **Biên bản thu hồi:** Bắt buộc có chữ ký xác nhận của đại diện IT và nhân viên bàn giao.\n`;
    res += `4. **Trường hợp mất mát/hư hỏng:** Tạo phiếu ngoại lệ (\`ASSET_LOST\`) để khấu trừ giá trị vào quyết toán tài chính.\n`;
    return res;
  }

  // Fallback comprehensive help
  let res = `Tôi là Trợ lý AI EXITCONTROL (Hệ thống RAG & Lọc Dữ liệu Thời gian thực).\n\n`;
  res += `Bạn có thể yêu cầu tôi **lọc hoặc tìm kiếm bất kỳ thông tin nào** trên hệ thống web:\n\n`;
  res += `* 👥 **Lọc nhân sự:** *"Lọc danh sách nhân viên phòng Kỹ thuật (TECH)"*, *"Những ai đang làm ở phòng Nhân sự?"*\n`;
  res += `* 📋 **Lọc hồ sơ:** *"Lọc các hồ sơ thôi việc đang xử lý"*, *"Hồ sơ nào có mức rủi ro cao?"*\n`;
  res += `* 💻 **Lọc tài sản:** *"Lọc các tài sản chưa thu hồi"*, *"Ai đang giữ máy tính MacBook Pro?"*\n`;
  res += `* 🔐 **Lọc tài khoản:** *"Lọc danh sách tài khoản AWS và GitHub cần khóa"*\n`;
  res += `* 💰 **Lọc tài chính:** *"Lọc đối soát công nợ và tạm ứng của nhân viên"*\n`;
  res += `* ⚠️ **Lọc ngoại lệ:** *"Lọc các sự cố ngoại lệ chưa được giải quyết"*\n`;
  res += `* 📊 **Thống kê:** *"Thống kê tổng quan dữ liệu toàn hệ thống"*\n`;
  return res;
}

// Call external Gemini API if available
async function callGeminiAPI(systemContextText, userMessage) {
  const apiKey = ENV.AI_API_KEY;
  if (!apiKey || apiKey === 'mock_ai_api_key' || apiKey.startsWith('your_')) {
    return null;
  }

  const model = ENV.AI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Bạn là Trợ lý AI chuyên trách quản trị hệ thống và kiểm soát thôi việc doanh nghiệp EXITCONTROL.
Dưới đây là DỮ LIỆU THỰC TẾ TRÍCH XUẤT TỪ CƠ SỞ DỮ LIỆU HỆ THỐNG VÀ KHO TRI THỨC NỘI BỘ (RAG):

${systemContextText}

YÊU CẦU:
1. Trả lời câu hỏi hoặc yêu cầu lọc dữ liệu của người dùng dựa TRỰC TIẾP và CHÍNH XÁC trên dữ liệu hệ thống ở trên.
2. Trình bày kết quả lọc dưới dạng bảng Markdown hoặc danh sách có cấu trúc rõ ràng.
3. Trích dẫn rõ mã hồ sơ, tên nhân viên, mã tài sản và phòng ban liên quan.

Câu hỏi/Yêu cầu lọc của người dùng: "${userMessage}"`;

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

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    return null;
  }
}

// Main Chat & Filter Engine Entrypoint
export const chatWithAI = async (message, context = {}, currentUser = null) => {
  if (!message || typeof message !== 'string') {
    return {
      reply: 'Vui lòng nhập nội dung câu hỏi hoặc yêu cầu lọc dữ liệu.',
      disclaimer: 'Khuyến cáo: Câu trả lời của AI chỉ mang tính chất tham khảo.',
      sources: [],
    };
  }

  try {
    // 1. Check for specific Data Filter Query
    const filterResult = await executeFilterQuery(message);
    if (filterResult) {
      return {
        reply: filterResult.reply,
        sources: filterResult.sources || [],
        disclaimer: 'Dữ liệu được truy xuất trực tiếp từ cơ sở dữ liệu hệ thống thời gian thực.',
      };
    }

    // 2. Gather general context
    const systemContext = await gatherSystemContext(message);
    const contextString = buildContextString(systemContext);

    // 3. Attempt Gemini API if configured
    let reply = await callGeminiAPI(contextString, message);

    // 4. Fallback to general synthesizer
    if (!reply) {
      reply = synthesizeGeneralResponse(message, systemContext);
    }

    return {
      reply,
      sources: systemContext.sources || [],
      disclaimer: 'Dữ liệu được trích xuất trực tiếp từ hệ thống EXITCONTROL và kho tri thức quy chế nội bộ.',
    };
  } catch (error) {
    console.error('Lỗi xử lý chatWithAI:', error);
    return {
      reply: `Đã xảy ra lỗi khi truy xuất dữ liệu hệ thống: ${error.message}. Vui lòng thử lại.`,
      sources: [],
      disclaimer: 'Thông báo lỗi hệ thống.',
    };
  }
};
