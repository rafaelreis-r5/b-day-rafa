export interface Convidado {
  id: string;
  name: string;
  host?: string;
  isHost?: boolean;
  timestamp: number;
}

export interface GameResult {
  player: string;
  score: number;
  timestamp: number;
}

export interface Question {
  id: number;
  text: string;
  isTruth: boolean;
}

export enum AppView {
  HOME = 'HOME',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
