import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCommit,
  Radio,
  MessageSquareCode,
  Settings,
  Sparkles,
  Database,
  ExternalLink,
  Bot,
  MousePointerClick,
  Grid,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { brand, isMock } = useApp();

  const citationNavItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      to: '/timeline',
      label: 'Timeline Arc',
      icon: GitCommit,
      badge: '25d',
    },
    {
      to: '/probes',
      label: 'Live Probes',
      icon: Radio,
    },
    {
      to: '/chat',
      label: 'Ask CiteWatch',
      icon: MessageSquareCode,
      highlight: true,
    },
  ];

  const aiSeoNavItems = [
    {
      to: '/crawlers',
      label: 'AI Crawlers',
      icon: Bot,
      badge: 'Bots',
    },
    {
      to: '/referrals-search',
      label: 'AI Referrals & Search',
      icon: MousePointerClick,
    },
    {
      to: '/visibility-matrix',
      label: 'Query Matrix',
      icon: Grid,
      badge: 'SoV',
    },
    {
      to: '/optimization-impact',
      label: 'Optimization Impact',
      icon: Rocket,
      highlight: true,
    },
    {
      to: '/accuracy',
      label: 'Accuracy & Truth',
      icon: ShieldCheck,
    },
  ];

  const systemNavItems = [
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-45 flex flex-col w-64 border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* App Header & Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-foreground">
                  CiteWatch
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  GEO
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-none">
                AI Citation & SEO Monitor
              </p>
            </div>
          </div>
        </div>

        {/* Monitored Brand Card */}
        <div className="px-4 py-3 border-b border-border/60 bg-secondary/30 shrink-0">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Monitored Target
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-foreground">
                {brand.name}
              </span>
            </div>
            <Badge variant="outline" size="sm" className="text-[10px] py-0">
              {brand.ground_truth.price}
            </Badge>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono truncate">{brand.domain}</span>
            <span className="text-[10px] text-emerald-400/80">FAQ Schema OK</span>
          </div>
        </div>

        {/* Nav Links Scroll Area */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {/* Section 1: Citation Intelligence */}
          <div>
            <div className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Citation Intelligence
            </div>
            <div className="space-y-0.5">
              {citationNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive
                              ? 'text-emerald-400'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.highlight && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                        {item.badge && (
                          <span
                            className={cn(
                              'text-[9px] px-1.5 py-0.5 rounded font-mono',
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Section 2: AI SEO Engine */}
          <div>
            <div className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              AI SEO Engine
            </div>
            <div className="space-y-0.5">
              {aiSeoNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive
                              ? 'text-emerald-400'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.highlight && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                        {item.badge && (
                          <span
                            className={cn(
                              'text-[9px] px-1.5 py-0.5 rounded font-mono',
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Section 3: Settings */}
          <div>
            <div className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              System
            </div>
            <div className="space-y-0.5">
              {systemNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive
                              ? 'text-emerald-400'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Memory Layer State Card */}
        <div className="p-3 m-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-foreground">
              Hindsight Memory
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Bank: <code className="text-emerald-400">{brand.bank_id}</code>
          </p>
          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-border/50 text-[10px]">
            <span className="text-muted-foreground">Mode:</span>
            {isMock ? (
              <Badge variant="amber" size="sm">
                Mock Simulation
              </Badge>
            ) : (
              <Badge variant="emerald" size="sm">
                Live Backend
              </Badge>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Consolidated</span>
          </div>
          <a
            href="https://hindsight.vectorize.io"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            Hindsight <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </aside>
    </>
  );
};
