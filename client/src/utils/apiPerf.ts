import { AxiosResponse } from 'axios';

export type ParsedServerTiming = {
  name: string;
  durationMs: number;
};

export type ApiPerfNetwork = {
  totalMs: number;
  ttfbMs: number;
  downloadMs: number;
  dnsMs: number;
  connectMs: number;
};

export type ApiPerfReport = {
  label: string;
  url: string;
  serverPhases: ParsedServerTiming[];
  serverTotalMs: number;
  network?: ApiPerfNetwork;
  unaccountedMs?: number;
};

const PERF_PATHS = ['/api/books/mine', '/api/authors/by-name/'];

export function isInstrumentedApiUrl(url: string | undefined) {
  if (!url) {
    return false;
  }
  return PERF_PATHS.some(path => url.includes(path));
}

export function parseServerTimingHeader(header: string | undefined): ParsedServerTiming[] {
  if (!header?.trim()) {
    return [];
  }
  return header.split(',').flatMap(part => {
    const trimmed = part.trim();
    const nameMatch = trimmed.match(/^([a-zA-Z0-9_-]+)/);
    const durMatch = trimmed.match(/dur=([0-9.]+)/);
    if (!nameMatch || !durMatch) {
      return [];
    }
    return [{ name: nameMatch[1], durationMs: Number(durMatch[1]) }];
  });
}

function findLatestResource(urlFragment: string): PerformanceResourceTiming | undefined {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const matches = entries.filter(entry => entry.name.includes(urlFragment));
  return matches[matches.length - 1];
}

function summarizeNetwork(entry: PerformanceResourceTiming): ApiPerfNetwork {
  return {
    totalMs: entry.duration,
    dnsMs: entry.domainLookupEnd - entry.domainLookupStart,
    connectMs: entry.connectEnd - entry.connectStart,
    ttfbMs: entry.responseStart - entry.requestStart,
    downloadMs: entry.responseEnd - entry.responseStart,
  };
}

export function buildApiPerfReport(label: string, response: AxiosResponse): ApiPerfReport {
  const url = response.config.url || label;
  const headerPhases = parseServerTimingHeader(response.headers['server-timing'] as string | undefined);
  const resource = findLatestResource(url);
  const resourcePhases =
    resource?.serverTiming?.map(entry => ({
      name: entry.name,
      durationMs: entry.duration,
    })) ?? [];
  const serverPhases = headerPhases.length ? headerPhases : resourcePhases;
  const serverTotalMs = serverPhases.reduce((sum, phase) => sum + phase.durationMs, 0);
  const network = resource ? summarizeNetwork(resource) : undefined;
  const unaccountedMs =
    network && serverTotalMs > 0 ? Math.max(0, network.totalMs - serverTotalMs) : undefined;

  return {
    label,
    url,
    serverPhases,
    serverTotalMs,
    network,
    unaccountedMs,
  };
}

export function logApiPerf(label: string, response: AxiosResponse) {
  const report = buildApiPerfReport(label, response);
  performance.mark(`fivis-api:${label}:done`);
  console.info('[fivis-perf]', report);
  return report;
}

export function markPageDataReady(page: 'my-books' | 'author', detail?: Record<string, unknown>) {
  const markName = `fivis-page:${page}:data-ready`;
  performance.mark(markName);
  console.info('[fivis-perf]', { page, mark: markName, ...detail });
}
