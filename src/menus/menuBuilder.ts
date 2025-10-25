import TelegramBot from 'node-telegram-bot-api';

export class MenuBuilder {
  /**
   * Main menu
   */
  static mainMenu(): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          { text: '📊 Dashboard', callback_data: 'menu_dashboard' },
          { text: '📞 Calls', callback_data: 'menu_calls' },
        ],
        [
          { text: '👥 Customers', callback_data: 'menu_customers' },
          { text: '📈 Reports', callback_data: 'menu_reports' },
        ],
        [
          { text: '⚙️ Settings', callback_data: 'menu_settings' },
          { text: '🚪 Logout', callback_data: 'action_logout' },
        ],
      ],
    };
  }

  /**
   * Back to main menu button
   */
  static backToMain(): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: [[{ text: '« Back to Menu', callback_data: 'menu_main' }]],
    };
  }

  /**
   * Calls menu
   */
  static callsMenu(): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [{ text: '📋 Recent Calls', callback_data: 'calls_recent' }],
        [{ text: '🔍 Search Calls', callback_data: 'calls_search' }],
        [{ text: '📅 Today\'s Calls', callback_data: 'calls_today' }],
        [{ text: '« Back', callback_data: 'menu_main' }],
      ],
    };
  }

  /**
   * Customers menu
   */
  static customersMenu(): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [{ text: '👥 List Customers', callback_data: 'customers_list' }],
        [{ text: '🔍 Search Customer', callback_data: 'customers_search' }],
        [{ text: '📊 Top Customers', callback_data: 'customers_top' }],
        [{ text: '« Back', callback_data: 'menu_main' }],
      ],
    };
  }

  /**
   * Pagination menu
   */
  static pagination(currentPage: number, totalPages: number, prefix: string): TelegramBot.InlineKeyboardMarkup {
    const keyboard: TelegramBot.InlineKeyboardButton[][] = [];

    const buttons: TelegramBot.InlineKeyboardButton[] = [];

    if (currentPage > 1) {
      buttons.push({ text: '« Prev', callback_data: `${prefix}_page_${currentPage - 1}` });
    }

    buttons.push({ text: `${currentPage}/${totalPages}`, callback_data: 'noop' });

    if (currentPage < totalPages) {
      buttons.push({ text: 'Next »', callback_data: `${prefix}_page_${currentPage + 1}` });
    }

    keyboard.push(buttons);
    keyboard.push([{ text: '« Back', callback_data: 'menu_main' }]);

    return { inline_keyboard: keyboard };
  }

  /**
   * Confirmation menu
   */
  static confirm(action: string): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          { text: '✅ Yes', callback_data: `confirm_${action}` },
          { text: '❌ No', callback_data: 'menu_main' },
        ],
      ],
    };
  }

  /**
   * Refresh menu
   */
  static refresh(action: string): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [{ text: '🔄 Refresh', callback_data: action }],
        [{ text: '« Back', callback_data: 'menu_main' }],
      ],
    };
  }
}
