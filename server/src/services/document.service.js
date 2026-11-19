import prisma from '../config/database.js';

export const getDocumentsByRequest = async (requestId) => {
  return await prisma.document.findMany({
    where: { requestId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createDocument = async (requestId, fileData, userId, userName) => {
  const doc = await prisma.document.create({
    data: {
      requestId,
      name: fileData.name,
      fileUrl: fileData.fileUrl,
      mimeType: fileData.mimeType,
      type: fileData.type || 'HANDOVER',
      uploadedBy: userName,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      requestId,
      userId,
      action: 'UPLOAD_DOCUMENT',
      entity: 'Document',
      entityId: doc.id,
      newValue: { name: doc.name, type: doc.type },
    },
  });

  return doc;
};

export const deleteDocument = async (documentId, userId) => {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) {
    const error = new Error('Không tìm thấy tài liệu');
    error.statusCode = 404;
    throw error;
  }

  await prisma.document.delete({ where: { id: documentId } });

  await prisma.auditLog.create({
    data: {
      requestId: doc.requestId,
      userId,
      action: 'DELETE_DOCUMENT',
      entity: 'Document',
      entityId: documentId,
      oldValue: { name: doc.name },
    },
  });

  return true;
};
