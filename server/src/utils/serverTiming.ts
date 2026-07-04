import { Response } from 'express';

export type ServerTimingPhase = {
  name: string;
  durMs: number;
};

export function appendServerTiming(res: Response, phases: ServerTimingPhase[]) {
  const value = phases
    .filter(phase => Number.isFinite(phase.durMs) && phase.durMs >= 0)
    .map(phase => `${phase.name};dur=${phase.durMs.toFixed(2)}`)
    .join(', ');
  if (!value) {
    return;
  }
  res.append('Server-Timing', value);
  res.append('Access-Control-Expose-Headers', 'Server-Timing');
}

export function elapsedMs(start: number) {
  return performance.now() - start;
}
