export interface User {
  id: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;
  id_user_type: number;
  credit: number;
  active: number;
}

export interface Call {
  id: number;
  starttime: string;
  callerid: string;
  dst: string;
  sessiontime: number;
  buycost: number;
  terminatecauseid: number;
  trunk: string;
}

export interface Customer {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone1: string;
  credit: number;
  active: number;
  creationdate: string;
}

export interface DashboardStats {
  totalCalls: number;
  activeCustomers: number;
  revenueToday: number;
  activeTrunks: number;
  totalDuration: number;
}

export interface TelegramSession {
  chatId: number;
  userId?: number;
  username?: string;
  authenticated: boolean;
  loginTime?: number;
  state?: string;
}
