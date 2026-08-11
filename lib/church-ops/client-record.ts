'use client';

import { ACTIVE_CHURCH_STORAGE_KEY } from '@/components/ministry/ChurchWorkspaceSelector';

export type ChurchOpsClassification = 'INTERNAL' | 'SENSITIVE_OPERATIONAL';

export type ChurchOpsLoadResult<T> = {
  value: T;
  churchId: string;
  source: 'shared' | 'church-local' | 'private-local' | 'default';
  version?: number;
  message: string;
  migrationRequired?: boolean;
};

export type ChurchOpsSaveResult = {
  churchId: string;
  shared: boolean;
  version?: number;
  message: string;
  migrationRequired?: boolean;
};

type LoadOptions<T> = {
  churchId?: string;
  module: string;
  recordKey: string;
  localStoragePrefix: string;
  defaultValue: T;
  normalize: (value: unknown) => T;
  legacyLocalStorageKey?: string;
  legacyScopedLocalStorageKey?: string;
};

type SaveOptions<T> = {
  churchId?: string;
  module: string;
  recordKey: string;
  title: string;
  classification?: ChurchOpsClassification;
  localStoragePrefix: string;
  value: T;
};

export function getActiveChurchId() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ACTIVE_CHURCH_STORAGE_KEY) || '';
}

export function churchScopedLocalKey(prefix: string, churchId: string) {
  return `${prefix}:${churchId || 'private'}`;
}

function readLocal<T>(key: string, normalize: (value: unknown) => T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function readChurchLocalFallback<T>(options: LoadOptions<T>, scopedKey: string) {
  const current = readLocal(scopedKey, options.normalize);
  if (current) return current;
  if (options.legacyScopedLocalStorageKey) return readLocal(options.legacyScopedLocalStorageKey, options.normalize);
  return null;
}

export async function loadChurchOperationalRecord<T>(options: LoadOptions<T>): Promise<ChurchOpsLoadResult<T>> {
  const churchId = options.churchId ?? getActiveChurchId();
  const scopedKey = churchScopedLocalKey(options.localStoragePrefix, churchId);

  if (!churchId) {
    const local = readLocal(scopedKey, options.normalize);
    if (local) return { value: local, churchId: '', source: 'private-local', message: 'Private browser draft' };

    if (options.legacyLocalStorageKey) {
      const legacy = readLocal(options.legacyLocalStorageKey, options.normalize);
      if (legacy) return { value: legacy, churchId: '', source: 'private-local', message: 'Private legacy browser draft' };
    }

    return { value: options.defaultValue, churchId: '', source: 'default', message: 'New private browser draft' };
  }

  try {
    const params = new URLSearchParams({ churchId, module: options.module, key: options.recordKey });
    const response = await fetch(`/api/church-ops/records?${params.toString()}`, { cache: 'no-store' });
    const data = await response.json();

    if (response.ok && data?.record?.payload) {
      const value = options.normalize(data.record.payload);
      writeLocal(scopedKey, value);
      return { value, churchId, source: 'shared', version: Number(data.record.version) || 1, message: `Shared church record · v${Number(data.record.version) || 1}` };
    }

    if (response.status === 404) {
      const local = readChurchLocalFallback(options, scopedKey);
      if (local) return { value: local, churchId, source: 'church-local', message: 'Church-scoped browser draft · not shared yet' };
      return { value: options.defaultValue, churchId, source: 'default', message: 'New shared church record' };
    }

    const local = readChurchLocalFallback(options, scopedKey);
    return {
      value: local ?? options.defaultValue,
      churchId,
      source: local ? 'church-local' : 'default',
      message: data?.migrationRequired ? 'Shared persistence waiting for database migration' : data?.error || 'Shared sync unavailable · using church-scoped browser draft',
      migrationRequired: Boolean(data?.migrationRequired),
    };
  } catch {
    const local = readChurchLocalFallback(options, scopedKey);
    return { value: local ?? options.defaultValue, churchId, source: local ? 'church-local' : 'default', message: 'Shared sync unavailable · using church-scoped browser draft' };
  }
}

export async function saveChurchOperationalRecord<T>(options: SaveOptions<T>): Promise<ChurchOpsSaveResult> {
  const churchId = options.churchId ?? getActiveChurchId();
  const scopedKey = churchScopedLocalKey(options.localStoragePrefix, churchId);
  writeLocal(scopedKey, options.value);

  if (!churchId) return { churchId: '', shared: false, message: 'Private browser draft saved' };

  try {
    const response = await fetch('/api/church-ops/records', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ churchId, module: options.module, key: options.recordKey, title: options.title, classification: options.classification || 'INTERNAL', payload: options.value }),
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        churchId,
        shared: false,
        message: data?.migrationRequired ? 'Saved in this browser; shared database migration is still required' : data?.error || 'Saved in this browser; shared sync failed',
        migrationRequired: Boolean(data?.migrationRequired),
      };
    }

    const version = Number(data?.record?.version) || 1;
    return { churchId, shared: true, version, message: `Saved to active church · v${version}` };
  } catch {
    return { churchId, shared: false, message: 'Saved in this browser; shared sync is unavailable' };
  }
}

export function subscribeToChurchWorkspace(callback: (churchId: string) => void) {
  const listener = (event: Event) => {
    const custom = event as CustomEvent<{ churchId?: string }>;
    callback(custom.detail?.churchId || '');
  };
  window.addEventListener('digital-church-workspace-change', listener);
  return () => window.removeEventListener('digital-church-workspace-change', listener);
}
