export interface Bias {
  id: string;
  label: string;
  value: number; // -5 (strong negative) to +5 (strong positive)
}

export interface NPC {
  id: string;
  name: string;
  portrait: string | null; // base64 data URL or null
  biases: Bias[];
  clockSegments: number; // total segments in progress clock (4, 6, or 8)
  clockFilled: number;   // how many segments are filled
  influencePoints: number;
  notes: string;
}
