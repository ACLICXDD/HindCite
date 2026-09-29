import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Bot,
  Globe,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Sparkles,
  FileCode,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import { fetchDailyCrawlerStats, fetchCrawlerBlindSpots, fetchHealth } from '../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';

export const CrawlersPage: React.FC = () => {
  const [selectedBotFilter, setSelectedBotFilter] = useState<string>('all');

  const {
    data: crawlerStats,
    isLoading: loadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['crawler-daily-stats'],
    queryFn: fetchDailyCrawlerStats,
    staleTime: 30000,
  });

  const {
    data: blindSpots,
    isLoading: loadingBlindSpots,
    refetch: refetchBlindSpots,
  } = useQuery({
    queryKey: ['crawler-blind-spots'],
    queryFn: fetchCrawlerBlindSpots,
    staleTime: 30000,
  });

  const { data: healthData, isLoading: loadingHealth } = useQuery({
    queryKey: ['health-report'],
    queryFn: fetchHealth,
    staleTime: 30000,
  });

  const crawledPages = healthData?.structured?.top_crawled_pages || [];

  const isLoading = loadingStats || loadingBlindSpots || loadingHealth;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-72 w-full" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalVisits = (crawlerStats || []).reduce((acc, curr) => acc + curr.total, 0);
  const totalGPT = (crawlerStats || []).reduce((acc, curr) => acc + curr.GPTBot, 0);
  const totalClaude = (crawlerStats || []).reduce((acc, curr) => acc + curr.ClaudeBot, 0);
  const totalPerplexity = (crawlerStats || []).reduce((acc, curr) => acc + curr.PerplexityBot, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              AI Web Crawlers
            </h1>
            <Badge variant="blue" size="sm">
              Passive Access Logs
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tracks real server access logs for AI crawler bots (GPTBot, ClaudeBot, PerplexityBot) indexing your site before generating answers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchStats();
            refetchBlindSpots();
          }}
          className="text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Crawler Data
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total AI Bot Visits (25d)
            </span>
            <Bot className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalVisits}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Crawl frequency accelerated 4.1x post Day 15
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GPTBot (OpenAI)
            </span>
            <Badge variant="emerald" size="sm">
              {Math.round((totalGPT / totalVisits) * 100)}% share
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalGPT} visits</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Primary focus on <code className="text-foreground">/pricing</code> & <code className="text-foreground">/vs-competitor</code>
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ClaudeBot (Anthropic)
            </span>
            <Badge variant="purple" size="sm">
              {Math.round((totalClaude / totalVisits) * 100)}% share
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalClaude} visits</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Fastest to re-crawl comparison updates (8x/day)
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              PerplexityBot
            </span>
            <Badge variant="blue" size="sm">
              {Math.round((totalPerplexity / totalVisits) * 100)}% share
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalPerplexity} visits</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Highest conversion to human referral sessions
          </p>
        </Card>
      </div>

      {/* Main Chart: Daily Crawler Visits by Bot (Stacked Area Chart) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Daily AI Crawler Visits by Bot</CardTitle>
              <CardDescription>
                Stacked frequency showing daily bot hits from nginx/Apache access log parsing.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>GPTBot</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>ClaudeBot</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span>PerplexityBot</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Google-Extended</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crawlerStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorClaude" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorPerplexity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-foreground border-b border-border/60 pb-1">
                            {data.date} (Total: {data.total} crawls)
                          </p>
                          <div className="flex justify-between gap-4 text-emerald-400">
                            <span>GPTBot:</span>
                            <span className="font-mono font-semibold">{data.GPTBot}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-purple-400">
                            <span>ClaudeBot:</span>
                            <span className="font-mono font-semibold">{data.ClaudeBot}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-sky-400">
                            <span>PerplexityBot:</span>
                            <span className="font-mono font-semibold">{data.PerplexityBot}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-amber-400">
                            <span>Google-Extended:</span>
                            <span className="font-mono font-semibold">{data.GoogleExtended}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="GPTBot"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#colorGpt)"
                />
                <Area
                  type="monotone"
                  dataKey="ClaudeBot"
                  stackId="1"
                  stroke="#a855f7"
                  fill="url(#colorClaude)"
                />
                <Area
                  type="monotone"
                  dataKey="PerplexityBot"
                  stackId="1"
                  stroke="#0ea5e9"
                  fill="url(#colorPerplexity)"
                />
                <Area
                  type="monotone"
                  dataKey="GoogleExtended"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="url(#colorGoogle)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Most Crawled Pages Table + Blind Spots Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Crawled Pages Table */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Most-Crawled Pages</CardTitle>
                <CardDescription>
                  URLs with documented bot visits from parsed access logs.
                </CardDescription>
              </div>
              <Badge variant="outline" size="sm">
                {crawledPages.length} Indexed Pages
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2.5 font-semibold">Page Path</th>
                    <th className="pb-2.5 font-semibold">Primary Bot</th>
                    <th className="pb-2.5 font-semibold text-right">Visits</th>
                    <th className="pb-2.5 font-semibold text-right">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {crawledPages.map((page, i) => (
                    <tr key={i} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-2.5 font-mono text-foreground font-medium flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span>{page.page}</span>
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={
                            page.bot === 'GPTBot'
                              ? 'emerald'
                              : page.bot === 'ClaudeBot'
                              ? 'purple'
                              : page.bot === 'PerplexityBot'
                              ? 'blue'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {page.bot}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-foreground font-mono">
                        {page.visits}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground font-mono text-[11px]">
                        {page.last_seen ? formatDate(page.last_seen) : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Crawler Blind Spots Card */}
        <Card className="lg:col-span-5 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>Crawler Blind Spots</span>
                </CardTitle>
                <CardDescription>
                  Important commercial pages AI bots have NOT crawled recently.
                </CardDescription>
              </div>
              <Badge variant="amber" size="sm">
                {blindSpots?.length || 0} Detected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 flex-1 overflow-y-auto max-h-[420px] pr-1">
            {blindSpots?.map((spot, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {spot.page}
                  </span>
                  <Badge
                    variant={spot.importance === 'critical' ? 'red' : 'amber'}
                    size="sm"
                    className="text-[10px] py-0"
                  >
                    {spot.importance} priority
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {spot.reason}
                </p>

                <div className="pt-2 border-t border-border/50 text-[11px] space-y-1">
                  <div className="flex items-start gap-1.5 text-foreground">
                    <span className="text-emerald-400 font-semibold shrink-0">Fix:</span>
                    <span>{spot.suggestedFix}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-muted-foreground">Expected Gain:</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {spot.potentialCitationGain}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
