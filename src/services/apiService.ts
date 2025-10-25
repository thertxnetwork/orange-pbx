import axios from 'axios';
import { User, Call, Customer, DashboardStats } from '../database/models';

const API_URL = 'http://93.127.206.104/mbilling/bot-api/';

class ApiService {
  /**
   * Make API request
   */
  private async request<T>(action: string, data?: any): Promise<T> {
    try {
      const response = await axios.post(
        `${API_URL}?action=${action}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'API request failed');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'API error');
      } else if (error.request) {
        throw new Error('No response from server');
      } else {
        throw error;
      }
    }
  }

  /**
   * Login user
   */
  public async login(username: string, password: string): Promise<User> {
    return this.request<User>('login', { username, password });
  }

  /**
   * Get dashboard statistics
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('dashboard');
  }

  /**
   * Get recent calls
   */
  public async getRecentCalls(limit: number = 10): Promise<Call[]> {
    return this.request<Call[]>('recentCalls', { limit });
  }

  /**
   * Get customers
   */
  public async getCustomers(limit: number = 10, offset: number = 0): Promise<Customer[]> {
    return this.request<Customer[]>('customers', { limit, offset });
  }

  /**
   * Search calls
   */
  public async searchCalls(criteria: {
    callerid?: string;
    dst?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<Call[]> {
    return this.request<Call[]>('searchCalls', criteria);
  }
}

export default new ApiService();
