import type { Bias, NPC } from './types';
import { randomUUID } from './utils';

export const NPC_DOCUMENT_VERSION = 1;

interface NPCDocument {
  version: typeof NPC_DOCUMENT_VERSION;
  npcs: NPC[];
}

function createNPC(): NPC {
  return {
    id: randomUUID(),
    name: 'New NPC',
    portrait: null,
    biases: [],
    clockSegments: 6,
    clockFilled: 0,
    influencePoints: 0,
    notes: '',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeBias(raw: unknown): Bias | null {
  if (!isRecord(raw)) {
    return null;
  }

  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  if (!label) {
    return null;
  }

  const rawValue = typeof raw.value === 'number' && Number.isFinite(raw.value) ? raw.value : 0;
  const value = Math.max(-5, Math.min(5, Math.trunc(rawValue)));

  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : randomUUID(),
    label,
    value,
  };
}

export function normalizeNPC(raw: unknown): NPC {
  const base = createNPC();
  const source = isRecord(raw) ? raw : {};

  const npc: NPC = {
    ...base,
    id: typeof source.id === 'string' && source.id.length > 0 ? source.id : base.id,
  };

  if (typeof source.name === 'string') {
    npc.name = source.name;
  }

  if (source.portrait === null || typeof source.portrait === 'string') {
    npc.portrait = source.portrait;
  }

  if (Array.isArray(source.biases)) {
    npc.biases = source.biases
      .map((item) => normalizeBias(item))
      .filter((item): item is Bias => item !== null);
  }

  if (typeof source.clockSegments === 'number' && Number.isFinite(source.clockSegments)) {
    npc.clockSegments = Math.max(1, Math.floor(source.clockSegments));
  }

  if (typeof source.clockFilled === 'number' && Number.isFinite(source.clockFilled)) {
    npc.clockFilled = Math.max(0, Math.floor(source.clockFilled));
  }

  if (typeof source.influencePoints === 'number' && Number.isFinite(source.influencePoints)) {
    npc.influencePoints = Math.max(0, Math.floor(source.influencePoints));
  }

  if (typeof source.notes === 'string') {
    npc.notes = source.notes;
  }

  npc.clockFilled = Math.min(npc.clockFilled, npc.clockSegments);

  return npc;
}

function normalizeNPCList(items: unknown[]): NPC[] {
  return items
    .filter((item) => isRecord(item))
    .map((item) => normalizeNPC(item));
}

export function serializeNPCDocument(npcs: NPC[]): string {
  const document: NPCDocument = {
    version: NPC_DOCUMENT_VERSION,
    npcs,
  };

  return JSON.stringify(document, null, 2);
}

export function parseNPCDocument(raw: string): NPC[] {
  const parsed: unknown = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return normalizeNPCList(parsed);
  }

  if (isRecord(parsed) && Array.isArray(parsed.npcs)) {
    return normalizeNPCList(parsed.npcs);
  }

  return [];
}
