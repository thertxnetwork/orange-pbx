import apiService from './apiService';
import { Call, Customer, DashboardStats } from '../database/models';

class PBXService {

  /**
   * Get dashboard statistics
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    return apiService.getDashboardStats();
  }

  /**
   * Get recent calls
   */
  public async getRecentCalls(limit: number = 10): Promise<Call[]> {
    return apiService.getRecentCalls(limit);
  }

  /**
   * Get customers
   */
  public async getCustomers(limit: number = 10, offset: number = 0): Promise<Customer[]> {
    return apiService.getCustomers(limit, offset);
  }

  /**
   * Search calls by criteria
   */
  public async searchCalls(criteria: { callerid?: string; destination?: string; dateFrom?: string; dateTo?: string; limit?: number }): Promise<Call[]> {
    return apiService.searchCalls({
      callerid: criteria.callerid,
      dst: criteria.destination,
      dateFrom: criteria.dateFrom,
      dateTo: criteria.dateTo,
      limit: criteria.limit
    });
  }
}

export default new PBXService();
