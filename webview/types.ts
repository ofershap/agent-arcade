export type SpriteData = string[][];

export interface Position {
  col: number;
  row: number;
}

export interface InteractiveObject {
  id: string;
  sprites: SpriteData[];
  position: Position;
  hitbox: { w: number; h: number };
  zY: number;
  state: Record<string, unknown>;
  onClick: (obj: InteractiveObject, office: OfficeState) => void;
  render: (ctx: CanvasRenderingContext2D, obj: InteractiveObject, tick: number, scale: number) => void;
}

export type AgentActivity = 'idle' | 'typing' | 'reading' | 'running' | 'editing' | 'searching' | 'celebrating' | 'walking';

export interface CharacterState {
  activity: AgentActivity;
  position: Position;
  targetPosition: Position | null;
  animFrame: number;
  speechBubble: string | null;
  speechBubbleTimer: number;
  facingDir: 'down' | 'up' | 'left' | 'right';
}

export interface OfficeState {
  objects: InteractiveObject[];
  character: CharacterState;
  dimmed: boolean;
  tick: number;
  agentStatus: string | null;
  hoveredObjectId: string | null;
}

export interface AgentMessage {
  type: 'agentStatus';
  activity: AgentActivity;
  statusText: string | null;
}
