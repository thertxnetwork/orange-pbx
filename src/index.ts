import TelegramBot from 'node-telegram-bot-api';
import config from './config/config';
import { CommandHandler } from './handlers/commandHandler';
import { CallbackHandler } from './handlers/callbackHandler';

class PhoenixBot {
  private bot: TelegramBot;
  private commandHandler: CommandHandler;
  private callbackHandler: CallbackHandler;

  constructor() {
    // Initialize bot with polling
    this.bot = new TelegramBot(config.telegram.token, {
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10,
        },
      },
    });

    // Initialize handlers
    this.commandHandler = new CommandHandler(this.bot);
    this.callbackHandler = new CallbackHandler(this.bot);

    // Setup listeners
    this.setupListeners();
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    // Handle commands
    this.bot.onText(/\/start/, (msg) => this.commandHandler.handleStart(msg));
    this.bot.onText(/\/login/, (msg) => this.commandHandler.handleLogin(msg));
    this.bot.onText(/\/menu/, (msg) => this.commandHandler.handleMenu(msg));
    this.bot.onText(/\/help/, (msg) => this.commandHandler.handleHelp(msg));

    // Handle callback queries (inline buttons)
    this.bot.on('callback_query', (query) => this.callbackHandler.handle(query));

    // Handle errors
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error.message);
    });

    this.bot.on('error', (error) => {
      console.error('Bot error:', error.message);
    });

    // Handle process termination
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Start the bot
   */
  public start(): void {
    console.log('🤖 Phoenix PBX Bot starting...');
    console.log(`📱 Bot: @${config.telegram.botName || 'Unknown'}`);
    console.log(`📊 Version: ${config.bot.version}`);
    console.log(`🗄️  Database: ${config.database.host}:${config.database.port}`);
    console.log('✅ Bot is running and listening for messages...');
  }

  /**
   * Graceful shutdown
   */
  private shutdown(): void {
    console.log('\n🛑 Shutting down bot...');
    this.bot.stopPolling();
    process.exit(0);
  }
}

// Start the bot
const phoenixBot = new PhoenixBot();
phoenixBot.start();

export default phoenixBot;
