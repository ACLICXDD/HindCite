import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  GitCommit,
  Sparkles,
  Calendar,
  Filter,
  CheckCircle2,
  Radio,
  FileText,
  Rocket,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { fetchTimeline, getTimelineTrendPoints } from '../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { TimelineFact } from '../types';
import { formatDate, formatTime } from '../lib/utils';

export const TimelinePage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: timelineData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['timeline-events'],
    queryFn: fetchTimeline,
    staleTime: 30000,
  });

  const chartSeries = useMemo(() => getTimelineTrendPoints(), []);

  // Filter memories
  const filteredFacts = useMemo(() => {
    if (!timelineData?.results) return [];
    return timelineData.results.filter((fact) => {
      // Type filtering
      if (filterType !== 'all') {
        if (filterType === 'observation' && fact.type !== 'observation') return false;
        if (filterType === 'experience' && fact.type !== 'experience') return false;
        if (filterType === 'crawl' && !fact.tags?.some((t) => t.includes('crawl-digest') || fact.type === 'world')) return false;
        if (filterType === 'action' && !fact.tags?.some((t) => t.includes('optimization-action'))) return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          fact.text.toLowerCase().includes(q) ||
          fact.context.toLowerCase().includes(q) ||
          fact.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [timelineData, filterType, searchQuery]);

  // Group facts by date
  const groupedByDay = useMemo(() => {
    const groups: Record<string, TimelineFact[]> = {};
    filteredFacts.forEach((fact) => {
      const dateKey = fact.occurred_start
        ? fact.occurred_start.split('T')[0]
        : 'Undated';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(fact);
    });
    return groups;
  }, [filteredFacts]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-72 w-full" />
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="text-rose-400 font-semibold mb-2">Error loading timeline</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Citation Arc & Memory Timeline
          </h1>
          <Badge variant="emerald" size="sm">
            25 Days Consolidated
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Cause-and-effect correlation across 25 days: see how shipping the <code className="text-emerald-400">/vs-competitor</code> comparison page triggered crawl surges and 3.9x citation growth.
        </p>
      </div>

      {/* Main Cause-and-Effect Trend Chart */}
      <Card className="overflow-hidden border-border/80">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Citation Share Over Time (%)</span>
                <span className="text-xs font-normal text-muted-foreground">
                  (With optimization milestone marker)
                </span>
              </CardTitle>
              <CardDescription>
                Consolidated from Groq probe runs and daily crawl/search digests.
              </CardDescription>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-foreground font-medium">Citation Share</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span className="text-muted-foreground">AI Bot Crawls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
                <span className="text-amber-400 font-medium">Shipped Page (Day 15)</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartSeries}
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="crawlsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  stroke="hsl(var(--border))"
                  tickMargin={8}
                />
                <YAxis
                  domain={[0, 60]}
                  unit="%"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1.5 max-w-xs">
                          <p className="font-semibold text-foreground border-b border-border/60 pb-1">
                            {data.date}
                          </p>
                          <div className="flex justify-between gap-4">
                            <span className="text-emerald-400 font-medium">Citation Share:</span>
                            <span className="font-bold text-foreground">{data.citationShare}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-sky-400 font-medium">AI Bot Crawls:</span>
                            <span className="font-bold text-foreground">{data.crawls} visits</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground font-medium">AI Referrals:</span>
                            <span className="font-bold text-foreground">{data.referrals}</span>
                          </div>
                          {data.action && (
                            <div className="mt-2 pt-1.5 border-t border-amber-500/30 text-[11px] text-amber-300 font-medium bg-amber-500/10 px-2 py-1 rounded">
                              🚀 Milestone: {data.action}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Vertical Milestone Marker for Shipped /vs-competitor page */}
                <ReferenceLine
                  x={chartSeries[14]?.date}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Shipped /vs-competitor',
                    position: 'insideTopLeft',
                    fill: '#f59e0b',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="citationShare"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#citationGradient)"
                  name="Citation Share"
                />
                <Area
                  type="monotone"
                  dataKey="crawls"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#crawlsGradient)"
                  name="Bot Crawls"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-secondary/40 border border-border/70 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Before Day 15:</span>
              <span>12-14% baseline citation share, absent or wrong $99/mo price.</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-400">After Day 15:</span>
              <span>Climbed to 47%, GPTBot/ClaudeBot visits 4x'd, pricing corrected.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar for Memories */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Type:
          </span>
          {[
            { id: 'all', label: 'All Evidence' },
            { id: 'observation', label: 'Observations' },
            { id: 'experience', label: 'Probes & Actions' },
            { id: 'crawl', label: 'Crawler Digests' },
            { id: 'action', label: 'Optimization Actions' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                filterType === chip.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search memory facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Activity Feed Grouped by Day */}
      <div className="space-y-6">
        {Object.keys(groupedByDay).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No memory facts matched your filter criteria.
            </p>
          </Card>
        ) : (
          Object.entries(groupedByDay).map(([date, facts]) => (
            <div key={date} className="space-y-3">
              {/* Date Header Stamp */}
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>{formatDate(date)}</span>
                <span className="text-[10px] font-normal text-muted-foreground/70 lowercase">
                  ({facts.length} recorded events)
                </span>
                <div className="flex-1 h-px bg-border/60 ml-2" />
              </div>

              {/* Facts Cards for this day */}
              <div className="space-y-3 pl-2 border-l border-border/80">
                {facts.map((fact) => {
                  const isAction = fact.tags?.some((t) => t.includes('optimization-action'));
                  const isProbe = fact.tags?.some((t) => t.includes('live-probe'));
                  const isCrawl = fact.tags?.some((t) => t.includes('crawl-digest'));
                  const isObservation = fact.type === 'observation';

                  return (
                    <Card
                      key={fact.id}
                      className={`relative p-4 transition-all hover:border-emerald-500/30 ${
                        isAction
                          ? 'border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-950/10'
                          : 'bg-card'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        {/* Memory Badge & Icon */}
                        <div className="flex items-center gap-2">
                          {isAction ? (
                            <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-300">
                              <Rocket className="h-4 w-4" />
                            </div>
                          ) : isObservation ? (
                            <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-300">
                              <Sparkles className="h-4 w-4" />
                            </div>
                          ) : isProbe ? (
                            <div className="p-1.5 rounded-md bg-sky-500/20 text-sky-300">
                              <Radio className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
                              <FileText className="h-4 w-4" />
                            </div>
                          )}

                          <div>
                            <span className="text-xs font-semibold text-foreground capitalize">
                              {isAction
                                ? 'Optimization Action Shipped'
                                : fact.type}
                            </span>
                            <span className="text-[11px] text-muted-foreground ml-2">
                              {fact.context}
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {formatTime(fact.occurred_start)}
                        </div>
                      </div>

                      {/* Content Text */}
                      <p className="mt-2.5 text-xs text-foreground leading-relaxed">
                        {fact.text}
                      </p>

                      {/* Tags row */}
                      {fact.tags && fact.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {fact.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border/40"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
