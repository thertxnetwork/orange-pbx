import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import authService from '../services/authService';
import pbxService from '../services/pbxService';
import { MenuBuilder } from '../menus/menuBuilder';
import { Formatter } from '../utils/formatter';

export class CallbackHandler {
  private bot: TelegramBot;

  constructor(bot: TelegramBot) {
    this.bot = bot;
  }

  /**
   * Handle callback queries
   */
  public async handle(query: CallbackQuery): Promise<void> {
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;
    const data = query.data;

    if (!chatId || !messageId || !data) return;

    // Check authentication for protected actions
    if (!data.startsWith('action_logout') && !authService.isAuthenticated(chatId)) {
      await this.bot.answerCallbackQuery(query.id, {
        text: '❌ Session expired. Please /login again',
        show_alert: true,
      });
      return;
    }

    // Route to appropriate handler
    if (data.startsWith('menu_')) {
      await this.handleMenu(chatId, messageId, data, query.id);
    } else if (data.startsWith('calls_')) {
      await this.handleCalls(chatId, messageId, data, query.id);
    } else if (data.startsWith('customers_')) {
      await this.handleCustomers(chatId, messageId, data, query.id);
    } else if (data.startsWith('action_')) {
      await this.handleAction(chatId, messageId, data, query.id);
    } else if (data === 'noop') {
      await this.bot.answerCallbackQuery(query.id);
    }
  }

  /**
   * Handle menu callbacks
   */
  private async handleMenu(chatId: number, messageId: number, data: string, queryId: string): Promise<void> {
    await this.bot.answerCallbackQuery(queryId);

    switch (data) {
      case 'menu_main':
        await this.bot.editMessageText(
          '📋 Main Menu\n\nChoose an option:',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: MenuBuilder.mainMenu(),
          }
        );
        break;

      case 'menu_dashboard':
        await this.showDashboard(chatId, messageId);
        break;

      case 'menu_calls':
        await this.bot.editMessageText(
          '📞 Calls Management\n\nChoose an option:',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: MenuBuilder.callsMenu(),
          }
        );
        break;

      case 'menu_customers':
        await this.bot.editMessageText(
          '👥 Customer Management\n\nChoose an option:',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: MenuBuilder.customersMenu(),
          }
        );
        break;

      case 'menu_reports':
        await this.bot.editMessageText(
          '📈 Reports\n\n🚧 Coming soon...',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: MenuBuilder.backToMain(),
          }
        );
        break;

      case 'menu_settings':
        await this.bot.editMessageText(
          '⚙️ Settings\n\n🚧 Coming soon...',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: MenuBuilder.backToMain(),
          }
        );
        break;
    }
  }

  /**
   * Show dashboard
   */
  private async showDashboard(chatId: number, messageId: number): Promise<void> {
    const stats = await pbxService.getDashboardStats();

    const dashboardText = `
📊 <b>Dashboard Statistics</b>

📞 <b>Total Calls Today:</b> ${Formatter.number(stats.totalCalls)}
⏱️ <b>Total Duration:</b> ${Formatter.number(stats.totalDuration)} minutes

👥 <b>Active Customers:</b> ${Formatter.number(stats.activeCustomers)}
💰 <b>Revenue Today:</b> ${Formatter.currency(stats.revenueToday)}
🔌 <b>Active Trunks:</b> ${Formatter.number(stats.activeTrunks)}

<i>Last updated: ${new Date().toLocaleTimeString()}</i>
    `.trim();

    await this.bot.editMessageText(dashboardText, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: MenuBuilder.refresh('menu_dashboard'),
    });
  }

  /**
   * Handle calls callbacks
   */
  private async handleCalls(chatId: number, messageId: number, data: string, queryId: string): Promise<void> {
    await this.bot.answerCallbackQuery(queryId);

    switch (data) {
      case 'calls_recent':
        await this.showRecentCalls(chatId, messageId);
        break;

      case 'calls_today':
        await this.showTodayCalls(chatId, messageId);
        break;

      case 'calls_search':
        await this.bot.editMessageText(
          '🔍 Call Search\n\n🚧 Coming soon...\n\nYou will be able to search calls by:\n- Caller ID\n- Destination\n- Date range',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: MenuBuilder.backToMain(),
          }
        );
        break;
    }
  }

  /**
   * Show recent calls
   */
  private async showRecentCalls(chatId: number, messageId: number): Promise<void> {
    const calls = await pbxService.getRecentCalls(5);

    if (calls.length === 0) {
      await this.bot.editMessageText('📞 No recent calls found.', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: MenuBuilder.backToMain(),
      });
      return;
    }

    let text = '📞 <b>Recent Calls</b>\n\n';

    calls.forEach((call, index) => {
      text += `<b>${index + 1}.</b> `;
      text += `${Formatter.callStatus(call.terminatecauseid)}\n`;
      text += `📅 ${Formatter.dateTime(call.starttime)}\n`;
      text += `📞 From: ${call.callerid || 'Unknown'}\n`;
      text += `📱 To: ${call.dst || 'N/A'}\n`;
      text += `⏱️ Duration: ${Formatter.duration(call.sessiontime)}\n`;
      text += `💰 Cost: ${Formatter.currency(call.buycost)}\n\n`;
    });

    await this.bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: MenuBuilder.backToMain(),
    });
  }

  /**
   * Show today's calls
   */
  private async showTodayCalls(chatId: number, messageId: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const calls = await pbxService.searchCalls({ dateFrom: today, dateTo: today, limit: 5 });

    if (calls.length === 0) {
      await this.bot.editMessageText('📞 No calls today.', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: MenuBuilder.backToMain(),
      });
      return;
    }

    let text = `📞 <b>Today's Calls (${calls.length})</b>\n\n`;

    calls.forEach((call, index) => {
      text += `<b>${index + 1}.</b> `;
      text += `${Formatter.callStatus(call.terminatecauseid)} `;
      text += `${call.callerid} → ${call.dst} `;
      text += `(${Formatter.duration(call.sessiontime)})\n`;
    });

    await this.bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: MenuBuilder.backToMain(),
    });
  }

  /**
   * Handle customers callbacks
   */
  private async handleCustomers(chatId: number, messageId: number, data: string, queryId: string): Promise<void> {
    await this.bot.answerCallbackQuery(queryId);

    switch (data) {
      case 'customers_list':
        await this.showCustomersList(chatId, messageId);
        break;

      case 'customers_search':
      case 'customers_top':
        await this.bot.editMessageText(
          '🚧 Coming soon...',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: MenuBuilder.backToMain(),
          }
        );
        break;
    }
  }

  /**
   * Show customers list
   */
  private async showCustomersList(chatId: number, messageId: number): Promise<void> {
    const customers = await pbxService.getCustomers(5);

    if (customers.length === 0) {
      await this.bot.editMessageText('👥 No customers found.', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: MenuBuilder.backToMain(),
      });
      return;
    }

    let text = '👥 <b>Customers</b>\n\n';

    customers.forEach((customer, index) => {
      const status = customer.active === 1 ? '✅' : '❌';
      text += `<b>${index + 1}.</b> ${status} ${customer.username}\n`;
      text += `👤 ${customer.firstname} ${customer.lastname}\n`;
      text += `📧 ${customer.email || 'N/A'}\n`;
      text += `💰 Credit: ${Formatter.currency(customer.credit)}\n\n`;
    });

    await this.bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: MenuBuilder.backToMain(),
    });
  }

  /**
   * Handle actions
   */
  private async handleAction(chatId: number, messageId: number, data: string, queryId: string): Promise<void> {
    switch (data) {
      case 'action_logout':
        authService.logout(chatId);
        await this.bot.answerCallbackQuery(queryId, {
          text: '👋 Logged out successfully!',
          show_alert: true,
        });
        await this.bot.editMessageText(
          '👋 You have been logged out.\n\nUse /login to sign in again.',
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );
        break;

      default:
        await this.bot.answerCallbackQuery(queryId);
    }
  }
}
