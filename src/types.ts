export type Difficulty = 'beginner' | 'intermediate';

export interface GameConfig {
  rows: number;
  cols: number;
  label: string;
}

export const DIFFICULTIES: Record<Difficulty, GameConfig> = {
  beginner: { rows: 5, cols: 5, label: '초급 (5x5)' },
  intermediate: { rows: 10, cols: 10, label: '중급 (10x10)' },
};

export interface CardData {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  playerName: string;
  difficulty: Difficulty;
  cards: CardData[];
  flippedIndices: number[];
  moves: number;
  isGameOver: boolean;
  startTime: number | null;
  endTime: number | null;
}
