// ===================================
// مدیریت تنظیمات در localStorage
// ===================================
import type { AppSettings, PromptVersion, Alert, ScanRun } from '@/types';
import { DEFAULT_SETTINGS, MASTER_PROMPT_DEFAULT } from '@/constants';
import { generateId } from '@/lib/utils';

const KEYS = {
  SETTINGS: 'smr_settings',
  PROMPTS: 'smr_prompts',
  ALERTS: 'smr_alerts',
  SCAN_RUNS: 'smr_scan_runs',
  SIGNALS: 'smr_signals',
};

// -------- Settings --------
export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// -------- Prompt Versions --------
export function getPromptVersions(): PromptVersion[] {
  try {
    const raw = localStorage.getItem(KEYS.PROMPTS);
    if (raw) {
      const parsed = JSON.parse(raw) as PromptVersion[];
      return parsed.map(p => ({ ...p, createdAt: new Date(p.createdAt) }));
    }
  } catch {}
  // Default version
  const defaultVersion: PromptVersion = {
    id: generateId(),
    version: 'v1.0.0',
    content: MASTER_PROMPT_DEFAULT,
    createdAt: new Date(),
    createdBy: 'مهندس موسی بعاجی',
  };
  savePromptVersions([defaultVersion]);
  return [defaultVersion];
}

export function savePromptVersions(versions: PromptVersion[]): void {
  localStorage.setItem(KEYS.PROMPTS, JSON.stringify(versions));
}

export function addPromptVersion(content: string, description: string): PromptVersion {
  const versions = getPromptVersions();
  const latest = versions[0];
  const vParts = latest?.version.replace('v', '').split('.').map(Number) ?? [1, 0, 0];
  vParts[2]++;
  const newVersion: PromptVersion = {
    id: generateId(),
    version: `v${vParts.join('.')}`,
    content,
    createdAt: new Date(),
    createdBy: 'کاربر',
    description,
  };
  const updated = [newVersion, ...versions];
  savePromptVersions(updated);
  return newVersion;
}

// -------- Alerts --------
export function getAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(KEYS.ALERTS);
    if (raw) {
      const parsed = JSON.parse(raw) as Alert[];
      return parsed.map(a => ({ ...a, createdAt: new Date(a.createdAt) }));
    }
  } catch {}
  return [];
}

export function saveAlerts(alerts: Alert[]): void {
  const limited = alerts.slice(0, 200); // max 200 alerts
  localStorage.setItem(KEYS.ALERTS, JSON.stringify(limited));
}

export function addAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'read' | 'sent_telegram'>): Alert {
  const newAlert: Alert = {
    ...alert,
    id: generateId(),
    createdAt: new Date(),
    read: false,
    sent_telegram: false,
  };
  const alerts = getAlerts();
  saveAlerts([newAlert, ...alerts]);
  return newAlert;
}

export function markAlertsRead(): void {
  const alerts = getAlerts();
  saveAlerts(alerts.map(a => ({ ...a, read: true })));
}

// -------- Scan Runs --------
export function getScanRuns(): ScanRun[] {
  try {
    const raw = localStorage.getItem(KEYS.SCAN_RUNS);
    if (raw) {
      const parsed = JSON.parse(raw) as ScanRun[];
      return parsed.map(r => ({
        ...r,
        startedAt: new Date(r.startedAt),
        endedAt: r.endedAt ? new Date(r.endedAt) : undefined,
      }));
    }
  } catch {}
  return [];
}

export function saveScanRuns(runs: ScanRun[]): void {
  const limited = runs.slice(0, 50);
  localStorage.setItem(KEYS.SCAN_RUNS, JSON.stringify(limited));
}

export function addScanRun(run: Omit<ScanRun, 'id'>): ScanRun {
  const newRun = { ...run, id: generateId() };
  const runs = getScanRuns();
  saveScanRuns([newRun, ...runs]);
  return newRun;
}

export function updateScanRun(id: string, updates: Partial<ScanRun>): void {
  const runs = getScanRuns();
  const updated = runs.map(r => r.id === id ? { ...r, ...updates } : r);
  saveScanRuns(updated);
}
