
export enum GameMode {
  SOLO = 'SOLO',
  VS_FRIEND = 'VS_FRIEND',
  VS_COMPUTER = 'VS_COMPUTER'
}

export enum GameState {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  EVALUATION = 'EVALUATION',
  FINISHED = 'FINISHED'
}

export interface Player {
  id: string;
  name: string;
  score: number;
  shotsTaken: number;
  shotsMade: number;
}

export interface ShotResult {
  success: boolean;
  angle: number;
  power: number;
  distance: number;
  timestamp: number;
  playerId: string;
}

export interface GameSettings {
  initialTime: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
}
