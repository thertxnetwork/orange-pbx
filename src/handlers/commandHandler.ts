import TelegramBot, { Message } from 'node-telegram-bot-api';
import authService from '../services/authService';
import { MenuBuilder } from '../menus/menuBuilder';

export class CommandHandler {
  private bot: TelegramBot;

  constructor(bot: TelegramBot) {
    this.bot = bot;
  }

  /**
   * Handle /start command
   */
  public async handleStart(msg: Message): Promise<void> {
    const chatId = msg.chat.id;

    if (authService.isAuthenticated(chatId)) {
      await this.bot.sendMessage(
        chatId,
        '🎉 Welcome back to Phoenix PBX!\n\nChoose an option from the menu below:',
        { reply_markup: MenuBuilder.mainMenu() }
      );
    } else {
      await this.bot.sendMessage(
        chatId,
        '👋 Welcome to Phoenix PBX Bot!\n\n' +
          'This bot allows you to manage your VoIP system via Telegram.\n\n' +
          '🔐 Please login to continue:\n\n' +
          'Send your credentials in this format:\n' +
          '<code>/login username password</code>',
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Handle /login command
   */
  public async handleLogin(msg: Message): Promise<void> {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const parts = text.split(' ');

    if (parts.length !== 3) {
      await this.bot.sendMessage(
        chatId,
        '❌ Invalid format!\n\n' +
          'Please use: <code>/login username password</code>\n\n' +
          'Example: <code>/login admin mypassword</code>',
        { parse_mode: 'HTML' }
      );
      return;
    }

    const [, username, password] = parts;

    const result = await authService.login(chatId, username, password);

    if (result.success) {
      await this.bot.sendMessage(
        chatId,
        `${result.message}\n\n📱 Phoenix PBX at your fingertips!`,
        { reply_markup: MenuBuilder.mainMenu() }
      );
    } else {
      await this.bot.sendMessage(chatId, result.message);
    }

    // Delete the message containing password
    try {
      await this.bot.deleteMessage(chatId, msg.message_id);
    } catch (error) {
      // Ignore error if can't delete
    }
  }

  /**
   * Handle /menu command
   */
  public async handleMenu(msg: Message): Promise<void> {
    const chatId = msg.chat.id;

    if (!authService.isAuthenticated(chatId)) {
      await this.bot.sendMessage(
        chatId,
        '❌ Please login first!\n\nUse: <code>/login username password</code>',
        { parse_mode: 'HTML' }
      );
      return;
    }

    await this.bot.sendMessage(
      chatId,
      '📋 Main Menu\n\nChoose an option:',
      { reply_markup: MenuBuilder.mainMenu() }
    );
  }

  /**
   * Handle /help command
   */
  public async handleHelp(msg: Message): Promise<void> {
    const chatId = msg.chat.id;

    const helpText = `
🤖 <b>Phoenix PBX Bot - Help</b>

<b>Available Commands:</b>

/start - Start the bot
/login - Login to your account
/menu - Show main menu
/help - Show this help message

<b>Features:</b>

📊 Dashboard - View system statistics
📞 Calls - Manage and view calls
👥 Customers - Manage customers
📈 Reports - View reports
⚙️ Settings - Bot settings

<b>Need help?</b>
Contact your system administrator.
    `;

    await this.bot.sendMessage(chatId, helpText.trim(), { parse_mode: 'HTML' });
  }
}
