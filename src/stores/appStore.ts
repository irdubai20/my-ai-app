// ===================================
// Zustand Store - حالت کلی برنامه
// ===================================
import { create } from 'zustand';
import type { SystemHealth, ScanStatus, Alert, MarketData } from '@/types';
import { getSettings, getAlerts, saveAlerts } from '@/lib/storage';
import type { AppSettings } from '@/types';
import { addAlert } from '@/lib/storage';

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Settings
  settings: AppSettings;
  loadSettings: () => void;
  updateSettings: (settings: AppSettings) => void;

  // System Health
  health: SystemHealth;
  setHealth: (health: Partial<SystemHealth>) => void;
  
  // Scanner
  scanStatus: ScanStatus;
  setScanStatus: (status: ScanStatus) => void;
  lastScanAt: Date | null;
  setLastScanAt: (date: Date | null) => void;

  // Alerts
  alerts: Alert[];
  unreadCount: number;
  loadAlerts: () => void;
  markAllRead: () => void;
  addNewAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'read' | 'sent_telegram'>) => void;

  // Market Data
  marketData: MarketData[];
  marketDataSource: 'live' | 'cache' | 'unavailable';
  setMarketData: (data: MarketData[], source: 'live' | 'cache' | 'unavailable') => void;
  lastMarketUpdate: Date | null;

  // Active page  
  activePage: string;
  setActivePage: (page: string) => void;
}

const DEFAULT_HEALTH: SystemHealth = {
  api: { status: 'در حال بررسی' },
  database: { status: 'پیکربندی نشده', message: 'نیاز به Backend' },
  redis: { status: 'پیکربندی نشده', message: 'نیاز به Backend' },
  queue: { status: 'پیکربندی نشده', message: 'نیاز به Backend' },
  rpc_bsc: { status: 'در حال بررسی' },
  rpc_eth: { status: 'در حال بررسی' },
  rpc_base: { status: 'در حال بررسی' },
  telegram: { status: 'پیکربندی نشده' },
  storage: { status: 'متصل', message: 'localStorage' },
};

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  settings: getSettings(),
  loadSettings: () => set({ settings: getSettings() }),
  updateSettings: (settings) => {
    set({ settings });
    import('@/lib/storage').then(m => m.saveSettings(settings));
  },

  health: DEFAULT_HEALTH,
  setHealth: (health) => set(state => ({ health: { ...state.health, ...health } })),

  scanStatus: 'آماده',
  setScanStatus: (scanStatus) => set({ scanStatus }),
  lastScanAt: null,
  setLastScanAt: (date) => set({ lastScanAt: date }),

  alerts: [],
  unreadCount: 0,
  loadAlerts: () => {
    const alerts = getAlerts();
    set({ alerts, unreadCount: alerts.filter(a => !a.read).length });
  },
  markAllRead: () => {
    import('@/lib/storage').then(m => m.markAlertsRead());
    set(state => ({
      alerts: state.alerts.map(a => ({ ...a, read: true })),
      unreadCount: 0,
    }));
  },
  addNewAlert: (alert) => {
    const newAlert = addAlert(alert);
    set(state => ({
      alerts: [newAlert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    }));
  },

  marketData: [],
  marketDataSource: 'unavailable',
  setMarketData: (data, source) => set({ marketData: data, marketDataSource: source, lastMarketUpdate: new Date() }),
  lastMarketUpdate: null,

  activePage: '/',
  setActivePage: (page) => set({ activePage: page }),
}));
