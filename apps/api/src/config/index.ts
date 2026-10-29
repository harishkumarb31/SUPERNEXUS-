import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'regulaflow-super-secret-jwt-key-sih-2026-production-grade',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: path.resolve(__dirname, '../../uploads'),
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '15728640', 10), // 15MB
  groqApiKey: process.env.GROQ_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'llama-3.1-70b-versatile',
  aiProvider: process.env.AI_PROVIDER || 'local-grounded',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
