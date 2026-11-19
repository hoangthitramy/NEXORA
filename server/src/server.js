import app from './app.js';
import { ENV } from './config/env.js';
import prisma from './config/database.js';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL Database via Prisma');

    app.listen(ENV.PORT, () => {
      console.log(`🚀 EXITCONTROL API Server running on port ${ENV.PORT}`);
      console.log(`📡 Base API URL: http://localhost:${ENV.PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
