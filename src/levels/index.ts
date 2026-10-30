import type { MissionDef } from '../sim/types';

const files = import.meta.glob('./missions/**/*.json', { eager: true, import: 'default' }) as Record<string, MissionDef>;

/** Every mission, ordered by id so the Prologue comes first. */
export const MISSIONS: MissionDef[] = Object.values(files).sort((a, b) => a.id.localeCompare(b.id));

export const missionById = (id: string): MissionDef | undefined => MISSIONS.find((m) => m.id === id);

export const PROLOGUE: MissionDef[] = MISSIONS.filter((m) => m.region === 'prologue');
