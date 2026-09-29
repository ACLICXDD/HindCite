import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BrandConfig, ToastNotification } from '../types';
import {
  LOOPWISE_BRAND,
  isMockMode,
  setMockMode,
  runProbe,
  ingestLogs,
} from '../api';

interface AppContextType {
  brand: BrandConfig;
  isMock: boolean;
  setMock: (enabled: boolean) => void;
  lastUpdated: Date;
  updateLastUpdated: () => void;
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  // Global action triggers for TopBar and Pages
  isRunningProbe: boolean;
  probeDurationSeconds: number;
  triggerRunProbe: () => Promise<void>;
  isIngestingLogs: boolean;
  triggerIngestLogs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [brand] = useState<BrandConfig>(LOOPWISE_BRAND);
  const [isMock, setIsMockState] = useState<boolean>(isMockMode());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Action states
  const [isRunningProbe, setIsRunningProbe] = useState(false);
  const [probeDurationSeconds, setProbeDurationSeconds] = useState(0);
  const [isIngestingLogs, setIsIngestingLogs] = useState(false);

  const setMock = (enabled: boolean) => {
    setMockMode(enabled);
    setIsMockState(enabled);
    queryClient.invalidateQueries();
    showToast({
      type: 'info',
      title: enabled ? 'Mock Mode Activated' : 'Live API Mode Activated',
      message: enabled
        ? 'Using realistic 25-day synthetic data for Loopwise CRM'
        : 'Connecting directly to FastAPI backend',
    });
  };

  const updateLastUpdated = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastNotification, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Probe timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunningProbe) {
      setProbeDurationSeconds(0);
      interval = setInterval(() => {
        setProbeDurationSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunningProbe]);

  // Global action: Run Probe
  const triggerRunProbe = async () => {
    if (isRunningProbe) return;
    setIsRunningProbe(true);
    try {
      const res = await runProbe();
      queryClient.invalidateQueries();
      updateLastUpdated();
      showToast({
        type: 'success',
        title: 'Probe Cycle Complete',
        message: `Successfully executed ${res.probes_run} probes across Groq answer engines.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error during probe execution';
      showToast({
        type: 'error',
        title: 'Probe Cycle Failed',
        message: msg,
      });
    } finally {
      setIsRunningProbe(false);
    }
  };

  // Global action: Ingest Logs
  const triggerIngestLogs = async () => {
    if (isIngestingLogs) return;
    setIsIngestingLogs(true);
    try {
      const res = await ingestLogs();
      if (res.error) {
        throw new Error(res.error);
      }
      queryClient.invalidateQueries();
      updateLastUpdated();
      showToast({
        type: 'success',
        title: 'Server Logs Ingested',
        message: 'Parsed crawler visits and referral sessions. Mental model refreshing.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not process access.log';
      showToast({
        type: 'error',
        title: 'Log Ingestion Failed',
        message: msg,
      });
    } finally {
      setIsIngestingLogs(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        brand,
        isMock,
        setMock,
        lastUpdated,
        updateLastUpdated,
        toasts,
        showToast,
        removeToast,
        isRunningProbe,
        probeDurationSeconds,
        triggerRunProbe,
        isIngestingLogs,
        triggerIngestLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
