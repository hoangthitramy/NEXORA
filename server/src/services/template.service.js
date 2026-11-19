import prisma from '../config/database.js';

export const getTemplates = async () => {
  return await prisma.taskTemplate.findMany({
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { requests: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTemplateById = async (id) => {
  return await prisma.taskTemplate.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
};

export const createTemplate = async (data) => {
  const { name, description, items } = data;
  return await prisma.taskTemplate.create({
    data: {
      name,
      description,
      items: {
        create: items.map((item, idx) => ({
          title: item.title,
          description: item.description,
          department: item.department,
          isRequired: item.isRequired ?? true,
          sortOrder: idx + 1,
        })),
      },
    },
    include: { items: true },
  });
};
