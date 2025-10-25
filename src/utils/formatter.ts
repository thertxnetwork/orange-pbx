export class Formatter {
  /**
   * Format currency
   */
  static currency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Format number with thousands separator
   */
  static number(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Format duration from seconds
   */
  static duration(seconds: number): string {
    if (!seconds || seconds === 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Format date/time
   */
  static dateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format date only
   */
  static date(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  }

  /**
   * Get call status emoji and text
   */
  static callStatus(status: number): string {
    const statusMap: Record<number, string> = {
      1: '✅ Answered',
      0: '❌ Failed',
      16: '⚠️ Busy',
      17: '📵 No Answer',
    };
    return statusMap[status] || '❓ Unknown';
  }

  /**
   * Truncate text
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Escape markdown special characters
   */
  static escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }
}
