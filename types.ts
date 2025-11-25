export enum GameState {
  START = 'START',
  MAP = 'MAP',
  CHECKPOINT = 'CHECKPOINT',
  VICTORY = 'VICTORY'
}

export interface Question {
  id: string;
  sentence_start: string;
  verb1_prompt: string;
  sentence_middle: string;
  verb2_prompt: string;
  sentence_end: string;
  answer1: string;
  answer2: string;
  explanation: string;
}

export interface Checkpoint {
  id: number;
  name: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  x: number; // Percentage for map positioning
  y: number; // Percentage for map positioning
}