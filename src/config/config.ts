import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    botName: process.env.BOT_NAME || 'Phoenix PBX Bot',
  },
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'mbilling',
    user: process.env.DB_USER || 'mbillingUser',
    password: process.env.DB_PASSWORD || '',
  },
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT || '3600'),
  },
  bot: {
    version: process.env.BOT_VERSION || '1.0.0',
  },
};

export default config;
