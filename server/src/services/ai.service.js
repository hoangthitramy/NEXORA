import prisma from '../config/database.js';

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

  // Risk heuristics / AI analysis logic
  const risks = [];
  const suggestions = [];
  const missingInfo = [];

  // Check unreturned assets
  const unreturnedAssets = request.employee.assignments;
  if (unreturnedAssets.length > 0) {
    risks.push({
      type: 'ASSET',
      description: `Nhân viên vẫn đang giữ ${unreturnedAssets.length} tài sản chưa thu hồi (${unreturnedAssets.map(a => a.asset.name).join(', ')})`,
      severity: 'HIGH',
    });
    suggestions.push('Bộ phận IT và Quản trị tài sản cần lên lịch kiểm tra tình trạng vật lý và nhận lại thiết bị trước ngày làm việc cuối.');
  }

  // Check critical access accounts
  const criticalAccounts = request.revocations.filter((r) =>
    r.account.systemName.includes('AWS') || r.account.systemName.includes('GitHub') || r.account.systemName.includes('Cloud')
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

  // Update request riskLevel
  await prisma.offboardingRequest.update({
    where: { id: requestId },
    data: { riskLevel },
  });

  // Save AI analysis result
  const analysis = await prisma.aIAnalysis.create({
    data: {
      requestId,
      status: 'COMPLETED',
      riskLevel,
      summary,
      suggestions,
      missingInfo,
      modelName: 'gemini-1.5-flash',
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

export const chatWithAI = async (message, context = {}) => {
  // Helpful HR & Offboarding compliance responses
  let reply = '';
  const lower = message.toLowerCase();

  if (lower.includes('quy trình') || lower.includes('bàn giao') || lower.includes('offboarding')) {
    reply = `Quy trình nghỉ việc chuẩn tại EXITCONTROL bao gồm 6 giai đoạn:
1. Tiếp nhận và tạo hồ sơ thôi việc.
2. Tự động sinh danh sách nhiệm vụ từ mẫu quy trình.
3. Bàn giao công việc và mã nguồn cho người kế nhiệm.
4. Kiểm định và thu hồi tài sản thiết bị.
5. Vô hiệu hóa tài khoản và quyền truy cập hệ thống.
6. Phê duyệt đa cấp (Manager -> IT -> Kế toán -> HR).`;
  } else if (lower.includes('tài sản') || lower.includes('laptop') || lower.includes('thiết bị')) {
    reply = 'Về quy định thu hồi tài sản: Nhân viên phải hoàn trả tất cả thiết bị (Laptop, Màn hình, Thẻ bảo mật) trước hoặc trong ngày làm việc cuối cùng. Bộ phận IT có trách nhiệm kiểm tra hiện trạng và lập biên bản bàn giao có chữ ký.';
  } else if (lower.includes('tài khoản') || lower.includes('quyền') || lower.includes('aws') || lower.includes('github')) {
    reply = 'Về bảo mật tài khoản: Các tài khoản cloud (AWS, GCP, GitHub Enterprise) và hòm thư doanh nghiệp (Google Workspace) phải được chuyển sang chế độ vô hiệu hóa hoặc thu hồi quyền truy cập lúc 17h30 ngày làm việc cuối cùng, tránh rủi ro rò rỉ dữ liệu mã nguồn.';
  } else {
    reply = `Tôi là Trợ lý AI EXITCONTROL. Tôi có thể hỗ trợ bạn phân tích rủi ro hồ sơ nghỉ việc, đối soát danh mục tài sản/tài khoản cần thu hồi, hoặc tra cứu các quy định bàn giao nhân sự nội bộ. Bạn có câu hỏi cụ thể nào về hồ sơ hay quy trình không?`;
  }

  return {
    reply,
    disclaimer: 'Khuyến cáo: Câu trả lời của AI chỉ mang tính chất tham khảo và hỗ trợ ra quyết định. Mọi phê duyệt chính thức thuộc về người có thẩm quyền.',
  };
};
