import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/exitcontrol',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'exitcontrol_default_access_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'exitcontrol_default_refresh_secret',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
