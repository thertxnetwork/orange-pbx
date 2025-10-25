import crypto from 'crypto';
import Database from '../database/database';
import { User, TelegramSession } from '../database/models';
import config from '../config/config';

class AuthService {
  private sessions: Map<number, TelegramSession> = new Map();
  private db = Database.getInstance();

  /**
   * Authenticate user with username and password
   */
  public async login(chatId: number, username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const sql = 'SELECT * FROM pkg_user WHERE username = ? LIMIT 1';
      const users = await this.db.query<User[]>(sql, [username]);

      if (!users || users.length === 0) {
        return { success: false, message: '❌ User not found' };
      }

      const user = users[0];

      if (user.active !== 1) {
        return { success: false, message: '❌ Account is inactive' };
      }

      // Verify password (MagnusBilling uses SHA1)
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      if (user.password !== hashedPassword) {
        return { success: false, message: '❌ Invalid password' };
      }

      // Create session
      const session: TelegramSession = {
        chatId,
        userId: user.id,
        username: user.username,
        authenticated: true,
        loginTime: Date.now(),
      };

      this.sessions.set(chatId, session);

      return {
        success: true,
        message: `✅ Welcome ${user.firstname || user.username}!`,
        user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: '❌ Authentication failed' };
    }
  }

  /**
   * Logout user
   */
  public logout(chatId: number): void {
    this.sessions.delete(chatId);
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(chatId: number): boolean {
    const session = this.sessions.get(chatId);
    if (!session || !session.authenticated) {
      return false;
    }

    // Check session timeout
    if (session.loginTime) {
      const elapsed = Date.now() - session.loginTime;
      if (elapsed > config.session.timeout * 1000) {
        this.logout(chatId);
        return false;
      }
    }

    return true;
  }

  /**
   * Get session
   */
  public getSession(chatId: number): TelegramSession | undefined {
    return this.sessions.get(chatId);
  }

  /**
   * Update session state
   */
  public updateSessionState(chatId: number, state: string): void {
    const session = this.sessions.get(chatId);
    if (session) {
      session.state = state;
      this.sessions.set(chatId, session);
    }
  }

  /**
   * Clear session state
   */
  public clearSessionState(chatId: number): void {
    const session = this.sessions.get(chatId);
    if (session) {
      delete session.state;
      this.sessions.set(chatId, session);
    }
  }
}

export default new AuthService();
