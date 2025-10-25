import mysql from 'mysql2/promise';
import config from '../config/config';

class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }

  public async query<T = any>(sql: string, params?: any[]): Promise<T> {
    const [rows] = await this.pool.execute(sql, params);
    return rows as T;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default Database;
