import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { code: 'EXITCONTROL' },
    update: {},
    create: {
      name: 'Tập đoàn Công nghệ Nexora - ExitControl Systems',
      code: 'EXITCONTROL',
    },
  });

  console.log(`✅ Organization created: ${org.name}`);

  // 2. Departments
  const deptsData = [
    { name: 'Ban Giám Đốc', code: 'BOD' },
    { name: 'Phòng Nhân sự', code: 'HR' },
    { name: 'Phòng Kỹ thuật & Công nghệ', code: 'TECH' },
    { name: 'Phòng Kế toán & Tài chính', code: 'FINANCE' },
    { name: 'Phòng Kinh doanh & Marketing', code: 'BIZ' },
  ];

  const depts = {};
  for (const d of deptsData) {
    depts[d.code] = await prisma.department.upsert({
      where: {
        organizationId_code: {
          organizationId: org.id,
          code: d.code,
        },
      },
      update: {},
      create: {
        name: d.name,
        code: d.code,
        organizationId: org.id,
      },
    });
  }
  console.log('✅ Departments created');

  // 3. Roles
  const rolesList = ['Admin', 'HR', 'Manager', 'IT', 'Kế toán', 'Employee', 'Approver'];
  const roles = {};
  for (const rName of rolesList) {
    roles[rName] = await prisma.role.upsert({
      where: { name: rName },
      update: {},
      create: {
        name: rName,
        description: `Vai trò ${rName} trong hệ thống ExitControl`,
      },
    });
  }
  console.log('✅ Roles created');

  // 4. Default password hash
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Helper to create user + employee
  const usersToCreate = [
    {
      fullName: 'Quản trị viên Hệ thống',
      email: 'admin@exitcontrol.vn',
      role: 'Admin',
      deptCode: 'TECH',
      jobTitle: 'System Administrator',
      empCode: 'EMP001',
      phone: '0901000001',
    },
    {
      fullName: 'Nguyễn Thị Hoa',
      email: 'hr@exitcontrol.vn',
      role: 'HR',
      deptCode: 'HR',
      jobTitle: 'Trưởng phòng Nhân sự',
      empCode: 'EMP002',
      phone: '0901000002',
    },
    {
      fullName: 'Trần Văn Mạnh',
      email: 'manager@exitcontrol.vn',
      role: 'Manager',
      deptCode: 'TECH',
      jobTitle: 'Trưởng phòng Công nghệ (Engineering Manager)',
      empCode: 'EMP003',
      phone: '0901000003',
    },
    {
      fullName: 'Lê Hoàng Nam',
      email: 'it@exitcontrol.vn',
      role: 'IT',
      deptCode: 'TECH',
      jobTitle: 'Chuyên viên Quản trị Hệ thống IT',
      empCode: 'EMP004',
      phone: '0901000004',
    },
    {
      fullName: 'Phạm Thu Trang',
      email: 'ketoan@exitcontrol.vn',
      role: 'Kế toán',
      deptCode: 'FINANCE',
      jobTitle: 'Kế toán trưởng',
      empCode: 'EMP005',
      phone: '0901000005',
    },
    {
      fullName: 'Nguyễn Văn Bách',
      email: 'employee@exitcontrol.vn',
      role: 'Employee',
      deptCode: 'TECH',
      jobTitle: 'Senior Backend Engineer',
      empCode: 'EMP006',
      phone: '0901000006',
    },
  ];

  const createdUsers = {};
  const createdEmployees = {};

  for (const item of usersToCreate) {
    let user = await prisma.user.findUnique({ where: { email: item.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: item.fullName,
          email: item.email,
          passwordHash,
          organizationId: org.id,
        },
      });
    }

    // Assign Role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: roles[item.role].id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: roles[item.role].id,
      },
    });

    // Employee Record
    let emp = await prisma.employee.findUnique({ where: { employeeCode: item.empCode } });
    if (!emp) {
      emp = await prisma.employee.create({
        data: {
          employeeCode: item.empCode,
          fullName: item.fullName,
          email: item.email,
          phone: item.phone,
          jobTitle: item.jobTitle,
          organizationId: org.id,
          departmentId: depts[item.deptCode].id,
          userId: user.id,
        },
      });
    }

    createdUsers[item.role] = user;
    createdEmployees[item.role] = emp;
  }
  console.log('✅ Users & Employees created');

  // 5. Task Template & Items
  const template = await prisma.taskTemplate.upsert({
    where: { id: 'default-tech-template-uuid' },
    update: {},
    create: {
      id: 'default-tech-template-uuid',
      name: 'Quy trình chuẩn bàn giao Khối Công nghệ & Văn phòng',
      description: 'Mẫu checklist tiêu chuẩn gồm tài sản, mã nguồn, tài khoản hạ tầng và quyết toán tài chính',
      isActive: true,
      items: {
        create: [
          {
            title: 'Bàn giao tài liệu dự án, API specs và source code',
            description: 'Đảm bảo code đã push lên Git, documentation trên Confluence cập nhật đầy đủ',
            department: 'TECH',
            isRequired: true,
            sortOrder: 1,
          },
          {
            title: 'Bàn giao tài sản thiết bị (Laptop, Màn hình, Thẻ từ)',
            description: 'Kiểm tra tình trạng vật lý thiết bị trước khi ký biên bản',
            department: 'IT',
            isRequired: true,
            sortOrder: 2,
          },
          {
            title: 'Thu hồi quyền truy cập hệ thống (Google Workspace, GitHub, AWS, Slack)',
            description: 'Vô hiệu hóa 2FA và xóa SSH keys',
            department: 'IT',
            isRequired: true,
            sortOrder: 3,
          },
          {
            title: 'Đối soát và quyết toán tạm ứng, công nợ tài chính',
            description: 'Kiểm tra các khoản chi phí hoàn ứng và công nợ với doanh nghiệp',
            department: 'FINANCE',
            isRequired: true,
            sortOrder: 4,
          },
          {
            title: 'Phỏng vấn thôi việc (Exit Interview) & Chốt ngày chấm dứt HĐLĐ',
            description: 'Lắng nghe phản hồi từ nhân viên và hướng dẫn nhận sổ BHXH',
            department: 'HR',
            isRequired: true,
            sortOrder: 5,
          },
        ],
      },
    },
  });
  console.log(`✅ Task Template created: ${template.name}`);

  // 6. Assets & Assignment to employee
  const assetsData = [
    {
      assetCode: 'AST-MBP-01',
      name: 'MacBook Pro 14 M2 Pro 16GB / 512GB Space Gray',
      category: 'Laptop',
      serialNumber: 'C02G45T7MD6R',
      status: 'ASSIGNED',
    },
    {
      assetCode: 'AST-MN-02',
      name: 'Màn hình Dell UltraSharp 27 Inch 4K (U2723QE)',
      category: 'Màn hình',
      serialNumber: 'CN-0K790F-74261',
      status: 'ASSIGNED',
    },
    {
      assetCode: 'AST-KEY-03',
      name: 'Thẻ từ ra vào văn phòng Nexora Tầng 12',
      category: 'Thẻ bảo mật',
      serialNumber: 'NX-SEC-10492',
      status: 'ASSIGNED',
    },
  ];

  for (const ast of assetsData) {
    const createdAst = await prisma.asset.upsert({
      where: { assetCode: ast.assetCode },
      update: {},
      create: ast,
    });

    // Assign to Employee (EMP006)
    const existingAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId: createdAst.id,
        employeeId: createdEmployees['Employee'].id,
        returnedAt: null,
      },
    });

    if (!existingAssignment) {
      await prisma.assetAssignment.create({
        data: {
          assetId: createdAst.id,
          employeeId: createdEmployees['Employee'].id,
          condition: 'Hoạt động tốt, ngoại hình 98%',
          note: 'Cấp phát khi tiếp nhận công việc',
        },
      });
    }
  }
  console.log('✅ Assets & Assignments created');

  // 7. Access Accounts
  const accountsData = [
    {
      employeeCode: 'EMP006',
      systemName: 'Google Workspace',
      accountName: 'b.nguyen@exitcontrol.vn',
      email: 'b.nguyen@exitcontrol.vn',
      status: 'ACTIVE',
    },
    {
      employeeCode: 'EMP006',
      systemName: 'GitHub Enterprise',
      accountName: 'bach-nguyen-nexora',
      email: 'b.nguyen@exitcontrol.vn',
      status: 'ACTIVE',
    },
    {
      employeeCode: 'EMP006',
      systemName: 'AWS Cloud Production/Staging',
      accountName: 'iam/bach.nguyen',
      email: 'b.nguyen@exitcontrol.vn',
      status: 'ACTIVE',
    },
    {
      employeeCode: 'EMP006',
      systemName: 'Slack Nexora HQ',
      accountName: 'bach.nguyen',
      email: 'b.nguyen@exitcontrol.vn',
      status: 'ACTIVE',
    },
  ];

  const createdAccounts = [];
  for (const acc of accountsData) {
    let existing = await prisma.accessAccount.findFirst({
      where: {
        employeeCode: acc.employeeCode,
        systemName: acc.systemName,
      },
    });
    if (!existing) {
      existing = await prisma.accessAccount.create({ data: acc });
    }
    createdAccounts.push(existing);
  }
  console.log('✅ Access Accounts created');

  // 8. Sample Offboarding Request
  const reqCode = 'OFF-2026-001';
  let offRequest = await prisma.offboardingRequest.findUnique({
    where: { requestCode: reqCode },
  });

  if (!offRequest) {
    offRequest = await prisma.offboardingRequest.create({
      data: {
        requestCode: reqCode,
        employeeId: createdEmployees['Employee'].id,
        creatorId: createdUsers['HR'].id,
        templateId: template.id,
        reason: 'Có kế hoạch học tập nâng cao bằng Thạc sĩ và định hướng phát triển cá nhân',
        resignationDate: new Date('2026-11-15T00:00:00Z'),
        lastWorkingDate: new Date('2026-12-15T00:00:00Z'),
        status: 'IN_PROGRESS',
        riskLevel: 'MEDIUM',
      },
    });

    // Create Tasks for this Request
    const templateItems = await prisma.taskTemplateItem.findMany({
      where: { templateId: template.id },
      orderBy: { sortOrder: 'asc' },
    });

    for (const item of templateItems) {
      let assigneeId = createdUsers['Manager'].id;
      if (item.department === 'IT') assigneeId = createdUsers['IT'].id;
      if (item.department === 'FINANCE') assigneeId = createdUsers['Kế toán'].id;
      if (item.department === 'HR') assigneeId = createdUsers['HR'].id;

      await prisma.offboardingTask.create({
        data: {
          requestId: offRequest.id,
          templateItemId: item.id,
          assigneeId,
          title: item.title,
          description: item.description,
          dueDate: new Date('2026-12-10T17:00:00Z'),
          status: item.sortOrder === 1 ? 'IN_PROGRESS' : 'TODO',
        },
      });
    }

    // Create Handover record & items
    const handover = await prisma.handover.create({
      data: {
        requestId: offRequest.id,
        title: 'Biên bản bàn giao công việc & dự án Microservices Gateway',
        description: 'Bàn giao tài liệu thiết kế, sơ đồ luồng dữ liệu và hướng dẫn vận hành',
        status: 'IN_PROGRESS',
        items: {
          create: [
            {
              title: 'Source code & Repository Admin access: gateway-service, auth-service',
              description: 'Chuyển quyền Owner repo trên GitHub cho Tech Lead',
              receiver: 'Trần Văn Mạnh (Tech Lead)',
              status: 'PENDING',
            },
            {
              title: 'Tài liệu kiến trúc hệ thống và quy trình triển khai CI/CD',
              description: 'Link Confluence spaces và sơ đồ hạ tầng Docker/K8s',
              receiver: 'Trần Văn Mạnh (Tech Lead)',
              status: 'PENDING',
            },
          ],
        },
      },
    });

    // Create Access Revocations
    for (const acc of createdAccounts) {
      await prisma.accessRevocation.create({
        data: {
          requestId: offRequest.id,
          accountId: acc.id,
          status: 'PENDING',
          note: 'Thu hồi vào ngày làm việc cuối cùng 15/12/2026 lúc 17h30',
        },
      });
    }

    // Create Multi-step Approvals
    const approvalSteps = [
      { step: 1, approverId: createdUsers['Manager'].id, note: 'Kiểm tra hoàn tất bàn giao chuyên môn kỹ thuật' },
      { step: 2, approverId: createdUsers['IT'].id, note: 'Kiểm tra thu hồi toàn bộ thiết bị và tài khoản hạ tầng' },
      { step: 3, approverId: createdUsers['Kế toán'].id, note: 'Xác nhận công nợ, tạm ứng và hoàn ứng' },
      { step: 4, approverId: createdUsers['HR'].id, note: 'Phê duyệt hoàn tất hồ sơ nghỉ việc và trả sổ BHXH' },
    ];

    for (const step of approvalSteps) {
      await prisma.approval.create({
        data: {
          requestId: offRequest.id,
          approverId: step.approverId,
          step: step.step,
          status: 'PENDING',
          note: step.note,
        },
      });
    }

    // Create AI Analysis record
    await prisma.aIAnalysis.create({
      data: {
        requestId: offRequest.id,
        status: 'COMPLETED',
        riskLevel: 'MEDIUM',
        summary: 'Hồ sơ có quyền hạn truy cập cao (AWS IAM Cloud Production). Cần chú ý thu hồi quyền truy cập hạ tầng ngay sau ca làm việc cuối.',
        suggestions: [
          'Yêu cầu Lead IT rà soát SSH keys và Personal Access Token (PAT) trên GitHub cá nhân.',
          'Đối chiếu danh mục tài sản: 01 Laptop MacBook M2 Pro và 01 Màn hình Dell trước ngày 14/12.',
          'Xác nhận người nhận bàn giao chính thức cho microservices gateway.',
        ],
        missingInfo: [
          'Chưa có chữ ký xác nhận của người nhận bàn giao mã nguồn',
          'Chưa có biên bản kiểm định tình trạng vật lý của Laptop',
        ],
        modelName: 'gemini-1.5-flash',
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        requestId: offRequest.id,
        userId: createdUsers['HR'].id,
        action: 'CREATE_OFFBOARDING_REQUEST',
        entity: 'OffboardingRequest',
        entityId: offRequest.id,
        newValue: {
          requestCode: reqCode,
          employee: 'Nguyễn Văn Bách',
          lastWorkingDate: '2026-12-15',
        },
      },
    });
  }

  console.log(`✅ Sample Offboarding Request created: ${reqCode}`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
