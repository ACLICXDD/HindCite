import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Search,
  ExternalLink,
  Bot,
  MousePointerClick,
  Eye,
  Award,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { fetchDailyReferralsAndSearch, fetchSearchConsoleTopQueries } from '../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

export const ReferralsSearchPage: React.FC = () => {
  const {
    data: dailyData,
    isLoading: loadingDaily,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: ['daily-referrals-search'],
    queryFn: fetchDailyReferralsAndSearch,
    staleTime: 30000,
  });

  const {
    data: topQueries,
    isLoading: loadingQueries,
    refetch: refetchQueries,
  } = useQuery({
    queryKey: ['sc-top-queries'],
    queryFn: fetchSearchConsoleTopQueries,
    staleTime: 30000,
  });

  const isLoading = loadingDaily || loadingQueries;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  // Derived summaries
  const latest = dailyData && dailyData.length > 0 ? dailyData[dailyData.length - 1] : null;
  const totalAiReferrals = (dailyData || []).reduce((acc, curr) => acc + curr.totalAiReferrals, 0);
  const totalSearchClicks = (dailyData || []).reduce((acc, curr) => acc + curr.classicSearchClicks, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              AI Referrals & Search Traffic
            </h1>
            <Badge variant="emerald" size="sm">
              Attribution & Search Console
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Measures sessions arriving directly from AI answer engines (ChatGPT, Perplexity) alongside Google Search Console organic rankings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchDaily();
            refetchQueries();
          }}
          className="text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Traffic Data
        </Button>
      </div>

      {/* Small Multiples: Search Console Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Impressions Card */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Search Impressions (Latest)
            </span>
            <Eye className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {latest?.classicImpressions.toLocaleString() || '588'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+96% growth over 25 days</span>
          </div>
        </Card>

        {/* Organic Clicks Card */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Classic Search Clicks (25d)
            </span>
            <MousePointerClick className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {totalSearchClicks.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Scaled from 12 to 34 clicks/day</span>
          </div>
        </Card>

        {/* Avg Position Card */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Search Position
            </span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {latest?.classicAvgRank ? `${latest.classicAvgRank}` : '5.1'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
            <span>Improved from position 8.5 to {latest?.classicAvgRank}</span>
          </div>
        </Card>
      </div>

      {/* Chart 1: AI Referrals by Engine over Time */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Visits Referred from AI Engines</CardTitle>
              <CardDescription>
                Sessions from users clicking source links inside ChatGPT, Perplexity, Gemini, and Copilot.
              </CardDescription>
            </div>
            <Badge variant="emerald" size="sm">
              {totalAiReferrals} Total AI Referrals
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            {data.date}
                          </p>
                          <div className="flex justify-between gap-4 text-emerald-400">
                            <span>chatgpt.com:</span>
                            <span className="font-mono font-semibold">{data.chatgpt}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-sky-400">
                            <span>perplexity.ai:</span>
                            <span className="font-mono font-semibold">{data.perplexity}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-purple-400">
                            <span>gemini.google.com:</span>
                            <span className="font-mono font-semibold">{data.gemini}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-amber-400">
                            <span>copilot:</span>
                            <span className="font-mono font-semibold">{data.copilot}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar dataKey="chatgpt" stackId="a" fill="#10b981" name="ChatGPT" />
                <Bar dataKey="perplexity" stackId="a" fill="#0ea5e9" name="Perplexity" />
                <Bar dataKey="gemini" stackId="a" fill="#a855f7" name="Gemini" />
                <Bar dataKey="copilot" stackId="a" fill="#f59e0b" name="Copilot" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison: AI Traffic vs Classic Search Traffic */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>Side-by-Side: AI Traffic vs. Classic Organic Search</span>
              </CardTitle>
              <CardDescription>
                Compare session acceleration from Generative Engines vs traditional Google Search clicks.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>AI Referrals (ChatGPT/Perplexity)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-sky-400">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>Classic Google Organic Clicks</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            {data.date}
                          </p>
                          <div className="flex justify-between gap-4 text-emerald-400">
                            <span>AI Referrals:</span>
                            <span className="font-mono font-bold">{data.totalAiReferrals}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-sky-400">
                            <span>Classic Search Clicks:</span>
                            <span className="font-mono font-bold">{data.classicSearchClicks}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalAiReferrals"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  name="AI Referrals"
                />
                <Line
                  type="monotone"
                  dataKey="classicSearchClicks"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  name="Classic Organic Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Search Console Queries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Top Organic Queries (Google Search Console)</CardTitle>
              <CardDescription>
                Exported performance data highlighting queries where AI engine citations and classic search overlap.
              </CardDescription>
            </div>
            <Badge variant="outline" size="sm">
              Search Console CSV
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2.5 font-semibold">Search Query</th>
                  <th className="pb-2.5 font-semibold text-right">Impressions</th>
                  <th className="pb-2.5 font-semibold text-right">Clicks</th>
                  <th className="pb-2.5 font-semibold text-right">CTR (%)</th>
                  <th className="pb-2.5 font-semibold text-right">Avg Position</th>
                  <th className="pb-2.5 font-semibold text-right">AI Engine Citation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {topQueries?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-2.5 font-mono text-foreground font-medium">
                      "{row.query}"
                    </td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">
                      {row.impressions.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-foreground">
                      {row.clicks}
                    </td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">
                      {row.ctr}%
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-sky-400">
                      {row.avgPosition}
                    </td>
                    <td className="py-2.5 text-right">
                      {row.aiOverlap ? (
                        <Badge variant="emerald" size="sm">
                          Cited in AI Answers
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          Classic Only
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
