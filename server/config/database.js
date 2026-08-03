import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

export const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'reservation_app',
};

export const createPool = () => {
  const client = new Client(dbConfig);
  return client;
};

export const query = async (text, params) => {
  const client = createPool();
  try {
    await client.connect();
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    await client.end();
  }
};

export const queryOne = async (text, params) => {
  const results = await query(text, params);
  return results[0] || null;
};
