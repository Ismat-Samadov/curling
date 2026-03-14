// Core game types for the Curling game

export type Team = 'player' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GamePhase =
  | 'menu'
  | 'aiming'
  | 'power'
  | 'ai_turn'
  | 'simulating'
  | 'scoring'
  | 'end_screen';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Stone {
  id: string;
  team: Team;
  position: Vec2;
  velocity: Vec2;
  /** Angular velocity in radians/frame — drives the curl */
  angularVelocity: number;
  /** Cumulative rotation angle for rendering spin */
  rotation: number;
  /** Whether the stone is still in play (on sheet) */
  active: boolean;
}

export interface EndScore {
  end: number;
  player: number;
  ai: number;
  /** Which team scored this end */
  scorer: Team | 'blank';
}

export interface GameState {
  phase: GamePhase;
  difficulty: Difficulty;
  currentEnd: number; // 1-based, max = totalEnds
  totalEnds: number;
  /** Stones thrown so far this end */
  stonesThrown: number;
  /** Total stones per end per team */
  stonesPerTeam: number;
  /** Which team has the hammer (last rock advantage) */
  hammerTeam: Team;
  /** Whose turn it currently is */
  currentThrower: Team;
  stones: Stone[]; // All stones currently on the sheet
  scores: EndScore[];
  totalScore: { player: number; ai: number };
  /** Aiming angle in radians (0 = straight up sheet) */
  aimAngle: number;
  /** Power 0–1 */
  power: number;
  /** Curl direction: +1 = clockwise, -1 = counter-clockwise */
  curlDirection: 1 | -1;
  /** Is game paused */
  paused: boolean;
  /** Show end-of-end scoring animation */
  showEndScoring: boolean;
  /** Sound enabled */
  soundEnabled: boolean;
  /** Music enabled */
  musicEnabled: boolean;
}
