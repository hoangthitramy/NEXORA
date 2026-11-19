import prisma from '../config/database.js';

export const getCommentsByRequest = async (requestId) => {
  return await prisma.comment.findMany({
    where: { requestId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const addComment = async (requestId, userId, content) => {
  return await prisma.comment.create({
    data: {
      requestId,
      userId,
      content,
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
};
