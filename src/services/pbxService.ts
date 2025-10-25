import Database from '../database/database';
import { Call, Customer, DashboardStats } from '../database/models';

class PBXService {
  private db = Database.getInstance();

  /**
   * Get dashboard statistics
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Total calls today
      const callsSql = 'SELECT COUNT(*) as count FROM pkg_cdr WHERE DATE(starttime) = ?';
      const callsResult = await this.db.query<any[]>(callsSql, [today]);
      const totalCalls = callsResult[0]?.count || 0;

      // Active customers
      const customersSql = 'SELECT COUNT(*) as count FROM pkg_user WHERE id_user_type = 3 AND active = 1';
      const customersResult = await this.db.query<any[]>(customersSql);
      const activeCustomers = customersResult[0]?.count || 0;

      // Revenue today
      const revenueSql = 'SELECT SUM(sessionbill * buycost) as revenue FROM pkg_cdr WHERE DATE(starttime) = ?';
      const revenueResult = await this.db.query<any[]>(revenueSql, [today]);
      const revenueToday = revenueResult[0]?.revenue || 0;

      // Active trunks
      const trunksSql = 'SELECT COUNT(*) as count FROM pkg_trunk WHERE status = 1';
      const trunksResult = await this.db.query<any[]>(trunksSql);
      const activeTrunks = trunksResult[0]?.count || 0;

      // Total duration today (in minutes)
      const durationSql = 'SELECT SUM(sessiontime) as duration FROM pkg_cdr WHERE DATE(starttime) = ?';
      const durationResult = await this.db.query<any[]>(durationSql, [today]);
      const totalDuration = Math.round((durationResult[0]?.duration || 0) / 60);

      return {
        totalCalls,
        activeCustomers,
        revenueToday,
        activeTrunks,
        totalDuration,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalCalls: 0,
        activeCustomers: 0,
        revenueToday: 0,
        activeTrunks: 0,
        totalDuration: 0,
      };
    }
  }

  /**
   * Get recent calls
   */
  public async getRecentCalls(limit: number = 10): Promise<Call[]> {
    try {
      const sql = `
        SELECT id, starttime, callerid, dst, sessiontime, buycost, terminatecauseid, trunk
        FROM pkg_cdr
        ORDER BY starttime DESC
        LIMIT ?
      `;
      return await this.db.query<Call[]>(sql, [limit]);
    } catch (error) {
      console.error('Error getting recent calls:', error);
      return [];
    }
  }

  /**
   * Get customers
   */
  public async getCustomers(limit: number = 10, offset: number = 0): Promise<Customer[]> {
    try {
      const sql = `
        SELECT id, username, firstname, lastname, email, phone1, credit, active, creationdate
        FROM pkg_user
        WHERE id_user_type = 3
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;
      return await this.db.query<Customer[]>(sql, [limit, offset]);
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  /**
   * Search calls by criteria
   */
  public async searchCalls(criteria: { callerid?: string; destination?: string; dateFrom?: string; dateTo?: string; limit?: number }): Promise<Call[]> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (criteria.callerid) {
        conditions.push('callerid LIKE ?');
        params.push(`%${criteria.callerid}%`);
      }

      if (criteria.destination) {
        conditions.push('dst LIKE ?');
        params.push(`%${criteria.destination}%`);
      }

      if (criteria.dateFrom) {
        conditions.push('DATE(starttime) >= ?');
        params.push(criteria.dateFrom);
      }

      if (criteria.dateTo) {
        conditions.push('DATE(starttime) <= ?');
        params.push(criteria.dateTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limit = criteria.limit || 10;

      const sql = `
        SELECT id, starttime, callerid, dst, sessiontime, buycost, terminatecauseid, trunk
        FROM pkg_cdr
        ${whereClause}
        ORDER BY starttime DESC
        LIMIT ?
      `;

      params.push(limit);

      return await this.db.query<Call[]>(sql, params);
    } catch (error) {
      console.error('Error searching calls:', error);
      return [];
    }
  }
}

export default new PBXService();
