import prisma from '../config/database.js';

export const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
};

export const markAsRead = async (notificationId, userId) => {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};
