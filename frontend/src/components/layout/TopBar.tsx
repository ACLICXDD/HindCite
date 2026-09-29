import React from 'react';
import {
  Radio,
  FileText,
  Sun,
  Moon,
  Menu,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatRelativeTime } from '../../lib/utils';

interface TopBarProps {
  onToggleMobile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobile }) => {
  const {
    brand,
    lastUpdated,
    isRunningProbe,
    probeDurationSeconds,
    triggerRunProbe,
    isIngestingLogs,
    triggerIngestLogs,
    isMock,
  } = useApp();

  const { theme, setTheme, isDark } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-card/85 backdrop-blur-md">
      {/* Left side: Mobile Toggle + Brand Display */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleMobile}
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Brand:
            </span>
            <span className="text-sm font-bold text-foreground">
              {brand.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/80 border border-border/60 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3 text-emerald-400" />
            <span className="hidden xs:inline">Updated</span>
            <span>{formatRelativeTime(lastUpdated.toISOString())}</span>
          </div>

          {isMock && (
            <Badge variant="amber" size="sm" className="hidden md:inline-flex">
              Demo Simulation
            </Badge>
          )}
        </div>
      </div>

      {/* Right side: Probe & Ingest Actions + Theme toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ingest Logs Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={triggerIngestLogs}
          isLoading={isIngestingLogs}
          title="Digest access.log and Search Console rows into Hindsight memory"
          className="text-xs"
        >
          <FileText className="h-3.5 w-3.5 mr-1 text-sky-400" />
          <span className="hidden sm:inline">Ingest Logs</span>
          <span className="sm:hidden">Logs</span>
        </Button>

        {/* Run Probe Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={triggerRunProbe}
          isLoading={isRunningProbe}
          title="Dispatch buyer queries to Groq answer engines and retain evidence"
          className="text-xs"
        >
          <Radio className="h-3.5 w-3.5 mr-1 text-emerald-100" />
          <span>
            {isRunningProbe
              ? `Probing (${probeDurationSeconds}s)...`
              : 'Run Probe'}
          </span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Toggle color theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-300" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </Button>
      </div>
    </header>
  );
};
