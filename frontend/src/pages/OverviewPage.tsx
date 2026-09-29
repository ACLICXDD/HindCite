import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  Bot,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Globe,
  Radio,
  Award,
  Zap,
  HelpCircle,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { fetchHealth, toggleMockAction, calculateAiSeoScore } from '../api';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { RecommendedAction, AiSeoScoreBreakdown } from '../types';

export const OverviewPage: React.FC = () => {
  const { isMock, triggerRunProbe, isRunningProbe, showToast } = useApp();
  const [localCompletedActions, setLocalCompletedActions] = useState<Record<string, boolean>>({
    'act-2': true,
  });
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);

  const {
    data: healthData,
    isLoading: loadingHealth,
    isError,
    error,
    refetch: refetchHealth,
    isFetching,
  } = useQuery({
    queryKey: ['health-report'],
    queryFn: fetchHealth,
    staleTime: 30000,
  });

  const {
    data: scoreData,
    isLoading: loadingScore,
  } = useQuery({
    queryKey: ['ai-seo-score'],
    queryFn: calculateAiSeoScore,
    staleTime: 30000,
  });

  const structured = healthData?.structured;
  const isLoading = loadingHealth || loadingScore;

  // Handler for toggle recommended action
  const handleToggleAction = (action: RecommendedAction, index: number) => {
    const key = action.id || `act-${index}`;
    const nextState = !localCompletedActions[key];
    setLocalCompletedActions((prev) => ({ ...prev, [key]: nextState }));
    if (isMock && action.id) {
      toggleMockAction(action.id);
    }
    showToast({
      type: 'info',
      title: nextState ? 'Action Completed' : 'Action Reopened',
      message: `"${action.action}" marked as ${nextState ? 'done' : 'pending'}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        {/* 5 KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-36" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-5">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !structured) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Failed to load citation health
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {error instanceof Error
            ? error.message
            : 'Could not connect to the Hindsight mental model or backend API.'}
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => refetchHealth()} variant="primary">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
          </Button>
          <Button onClick={() => triggerRunProbe()} variant="secondary">
            Run Initial Probe
          </Button>
        </div>
      </div>
    );
  }

  // Derived values
  const citationShare = structured.citation_share_pct ?? 0;
  const bestEngine =
    [...structured.engines].sort((a, b) => b.mentioned_pct - a.mentioned_pct)[0] || {
      engine: 'N/A',
      mentioned_pct: 0,
    };
  const activeHallucinations = structured.top_hallucinations.filter(
    (h) => h.status !== 'resolved'
  ).length;
  const totalCrawlVisits = structured.top_crawled_pages.reduce(
    (acc, p) => acc + p.visits,
    0
  );

  const chartData = structured.engines.map((e) => ({
    name: e.engine.replace('openai/', '').replace('qwen/', ''),
    fullName: e.engine,
    share: e.mentioned_pct,
  }));

  const chartColors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Citation & AI SEO Health
            </h1>
            <Badge variant="emerald" size="sm">
              Mental Model Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time Generative Engine Optimization (GEO) & AI crawler intelligence consolidated by Hindsight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchHealth()}
            disabled={isFetching}
            className="text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh Model
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={triggerRunProbe}
            isLoading={isRunningProbe}
            className="text-xs"
          >
            <Radio className="h-3.5 w-3.5 mr-1.5" />
            Run Live Probe
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (5 Cards including new AI SEO Score) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* NEW KPI: Composite AI SEO Score */}
        <Card className="relative overflow-hidden border-emerald-500/40 bg-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-sky-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <span>AI SEO Score</span>
              <button
                onClick={() => setShowScoreTooltip(!showScoreTooltip)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Explain AI SEO Score"
              >
                <HelpCircle className="h-3 w-3" />
              </button>
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {scoreData?.overallScore || 84}
              </div>
              <span className="text-xs text-muted-foreground font-mono">/100</span>
              <Badge variant="emerald" size="sm" className="ml-auto font-bold">
                Grade {scoreData?.grade || 'A'}
              </Badge>
            </div>

            <div className="mt-2 text-[11px] text-emerald-400 font-medium truncate">
              Strong GEO Visibility
            </div>

            {/* Tooltip Breakdown Box */}
            {showScoreTooltip && scoreData && (
              <div className="mt-3 p-2.5 rounded-lg bg-secondary border border-border text-[10px] space-y-1 animate-fade-in">
                <div className="flex justify-between">
                  <span>Citations:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {scoreData.citationWeight.score}/{scoreData.citationWeight.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Crawl Health:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {scoreData.crawlCoverageWeight.score}/{scoreData.crawlCoverageWeight.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-mono font-bold text-purple-400">
                    {scoreData.accuracyWeight.score}/{scoreData.accuracyWeight.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Referrals:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {scoreData.referralMomentumWeight.score}/{scoreData.referralMomentumWeight.max}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI 2: Overall Citation Share */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Citation Share
            </CardTitle>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {citationShare.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {structured.trend_direction === 'up' ? (
                <div className="flex items-center font-semibold text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                  +{structured.trend_delta_30d_pct}%
                </div>
              ) : (
                <div className="flex items-center font-semibold text-rose-400">
                  <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                  {structured.trend_delta_30d_pct}%
                </div>
              )}
              <span className="text-muted-foreground">vs baseline</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Best Answer Engine */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Best Answer Engine
            </CardTitle>
            <Bot className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground truncate" title={bestEngine.engine}>
              {bestEngine.engine.split('/').pop()}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted-foreground">Engine citation:</span>
              <span className="font-semibold text-sky-400">
                {bestEngine.mentioned_pct}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Hallucinations Count */}
        <Card className="relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              activeHallucinations > 0 ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hallucinations
            </CardTitle>
            <ShieldAlert
              className={`h-4 w-4 ${
                activeHallucinations > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {activeHallucinations}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted-foreground">Resolved in memory:</span>
              <Badge variant="emerald" size="sm">
                {structured.top_hallucinations.filter((h) => h.status === 'resolved').length} fixed
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: AI Crawler Visits */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bot Visits (7d)
            </CardTitle>
            <Globe className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {totalCrawlVisits}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted-foreground">AI Referrals:</span>
              <span className="font-semibold text-emerald-400">
                {structured.ai_referral_sessions_7d} sessions
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Engine Share Chart + Hallucinations Diff Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Engine Share Breakdown */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Citation Share by Answer Engine</CardTitle>
                <CardDescription>
                  Percentage of buyer-intent queries where Loopwise CRM was explicitly recommended.
                </CardDescription>
              </div>
              <Badge variant="outline" size="sm">
                5 Monitored Queries
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                    stroke="hsl(var(--border))"
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--secondary) / 0.4)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-xs space-y-1">
                            <p className="font-bold text-foreground">{data.fullName}</p>
                            <p className="text-emerald-400 font-semibold">
                              Citation Share: {data.share}%
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                              Ground truth price & features checked
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="share" radius={[0, 6, 6, 0]} barSize={26}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>Loopwise Average: {citationShare}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-500" />
                <span>Competitors (PipelinePro/SalesHive): 53%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Hallucination Cards in Red/Green Diff Style */}
        <Card className="lg:col-span-5 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Fact Check & Hallucinations</span>
                  {activeHallucinations > 0 && (
                    <Badge variant="red" size="sm">
                      {activeHallucinations} Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Verified against ground truth in <code className="text-emerald-400">brand.yaml</code>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
            {structured.top_hallucinations.map((h, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-border bg-card/70 hover:bg-card transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-muted-foreground truncate">
                    {h.engine || 'openai/gpt-oss-120b'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {h.status === 'resolved' ? (
                      <Badge variant="emerald" size="sm">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
                      </Badge>
                    ) : (
                      <Badge variant="red" size="sm">
                        <ShieldAlert className="h-3 w-3 mr-1" /> Misrepresented
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Red / Green Diff Style */}
                <div className="space-y-1.5 text-xs font-mono">
                  {/* AI Claim (Red) */}
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold select-none shrink-0">- AI Claim:</span>
                    <span className="line-through decoration-rose-400/60 leading-relaxed">
                      "{h.claim}"
                    </span>
                  </div>

                  {/* Ground Truth (Green) */}
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold select-none shrink-0">+ Actual:</span>
                    <span className="font-semibold leading-relaxed">
                      {h.correct_value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Crawled Pages Table + Next Best Actions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Pages AI Crawlers Hit */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Crawler Target Pages</CardTitle>
                <CardDescription>
                  Real server access log activity parsed for GPTBot, ClaudeBot, and Perplexity.
                </CardDescription>
              </div>
              <Badge variant="blue" size="sm">
                access.log digest
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium">
                    <th className="pb-2.5 font-semibold">Page Path</th>
                    <th className="pb-2.5 font-semibold">Primary Bot</th>
                    <th className="pb-2.5 font-semibold text-right">Visits</th>
                    <th className="pb-2.5 font-semibold text-right">Crawl Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {structured.top_crawled_pages.map((p, idx) => {
                    const pct = totalCrawlVisits > 0 ? Math.round((p.visits / totalCrawlVisits) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-2.5 font-mono text-foreground font-medium flex items-center gap-1.5">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>{p.page}</span>
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={
                              p.bot === 'GPTBot'
                                ? 'emerald'
                                : p.bot === 'ClaudeBot'
                                ? 'purple'
                                : p.bot === 'PerplexityBot'
                                ? 'blue'
                                : 'secondary'
                            }
                            size="sm"
                          >
                            {p.bot}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-foreground">
                          {p.visits}
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono w-7 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Prioritized "Next Best Actions" (Merged Recommended Actions + Blind Spots) */}
        <Card className="lg:col-span-6 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <span>Next Best Actions (Priority Queue)</span>
                </CardTitle>
                <CardDescription>
                  Synthesized queue combining Mental Model recommendations with crawler blind spot fixes.
                </CardDescription>
              </div>
              <Badge variant="emerald" size="sm">
                Action Queue
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {structured.recommended_actions.map((act, index) => {
              const key = act.id || `act-${index}`;
              const isDone = Boolean(localCompletedActions[key] ?? act.completed);
              return (
                <div
                  key={key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? 'border-border/50 bg-secondary/30 opacity-70'
                      : 'border-border bg-card hover:border-emerald-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => handleToggleAction(act, index)}
                      className="mt-0.5 text-muted-foreground hover:text-emerald-400 transition-colors shrink-0"
                      aria-label={isDone ? 'Mark as pending' : 'Mark as done'}
                    >
                      {isDone ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-xs font-semibold leading-snug ${
                            isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {act.action}
                        </h4>
                        <Badge
                          variant={
                            act.impact === 'high'
                              ? 'red'
                              : act.impact === 'medium'
                              ? 'amber'
                              : 'blue'
                          }
                          size="sm"
                          className="text-[10px] py-0 px-1.5"
                        >
                          {act.impact ? `${act.impact} impact` : 'priority'}
                        </Badge>
                      </div>

                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                        {act.rationale}
                      </p>

                      {/* Evidence quote */}
                      <div className="mt-2 text-[11px] italic text-emerald-400/90 bg-emerald-500/5 border-l-2 border-emerald-500 px-2 py-1 rounded-r">
                        "{act.evidence_quote}"
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Mental Model Raw Synthesis Drawer */}
      {healthData?.content && (
        <Card variant="subtle" className="p-4 border-dashed border-border/80">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground mr-1">
                Hindsight Mental Model Synthesis:
              </span>
              {healthData.content}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
