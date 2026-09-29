import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import {
  Grid,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Filter,
  Users,
  Search,
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { fetchVisibilityMatrix, fetchShareOfVoice } from '../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { QueryMatrixRow, QueryMatrixCell } from '../types';

export const VisibilityMatrixPage: React.FC = () => {
  const [selectedCompetitorFilter, setSelectedCompetitorFilter] = useState<string>('all');
  const [activeCellDetail, setActiveCellDetail] = useState<{
    query: string;
    cell: QueryMatrixCell;
  } | null>(null);

  const {
    data: matrixData,
    isLoading: loadingMatrix,
    refetch: refetchMatrix,
  } = useQuery({
    queryKey: ['visibility-matrix'],
    queryFn: fetchVisibilityMatrix,
    staleTime: 30000,
  });

  const {
    data: shareOfVoiceData,
    isLoading: loadingSov,
    refetch: refetchSov,
  } = useQuery({
    queryKey: ['share-of-voice'],
    queryFn: fetchShareOfVoice,
    staleTime: 30000,
  });

  const isLoading = loadingMatrix || loadingSov;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const rows = matrixData?.rows || [];
  const enginesList = matrixData?.enginesList || [];

  // Filter rows based on competitor filter
  const filteredRows = rows.filter((row) => {
    if (selectedCompetitorFilter === 'all') return true;
    return Object.values(row.engines).some((cell) =>
      cell.competitorsNamed.includes(selectedCompetitorFilter)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Query Visibility Matrix
            </h1>
            <Badge variant="emerald" size="sm">
              Engine Matrix & Share of Voice
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Map of buyer-intent queries tested against AI answer engines. Hover or click cells to view answer snippets.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchMatrix();
            refetchSov();
          }}
          className="text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Matrix
        </Button>
      </div>

      {/* Share of Voice vs. Competitors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Share of Voice Bar Chart */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Share of Voice vs. Competitors</CardTitle>
                <CardDescription>
                  Percentage of total answer engine recommendations across all tracked buyer-intent queries.
                </CardDescription>
              </div>
              <Badge variant="emerald" size="sm">
                47% Market Lead
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shareOfVoiceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 60]}
                    unit="%"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    type="category"
                    dataKey="brand"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                    stroke="hsl(var(--border))"
                    width={130}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border bg-card p-2.5 shadow-xl text-xs space-y-1">
                            <p className="font-bold text-foreground">{data.brand}</p>
                            <p className="text-emerald-400 font-semibold">
                              Share of Voice: {data.sharePct}%
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                              Mentioned in {data.mentionsCount} queries
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sharePct" radius={[0, 6, 6, 0]} barSize={22}>
                    {shareOfVoiceData?.map((entry, index) => (
                      <Cell key={`sov-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Insights Box */}
        <Card className="lg:col-span-5 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Competitive Landscape</span>
            </div>
            <h4 className="mt-2 text-base font-bold text-foreground">
              PipelinePro is your closest rival
            </h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              PipelinePro appears in 35.3% of answers, specifically when the prompt queries "email sequencing". Loopwise overtakes them in startup pricing comparisons due to the <code className="text-emerald-400">/vs-competitor</code> page.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Competitor Filter:</span>
            <div className="flex gap-1.5">
              {['all', 'PipelinePro', 'SalesHive'].map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedCompetitorFilter(comp)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedCompetitorFilter === comp
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {comp === 'all' ? 'All' : comp}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* The Matrix Grid */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Query × Engine Matrix</CardTitle>
              <CardDescription>
                Click or hover over any status badge to inspect the engine's verbatim snippet.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Loopwise Cited
              </span>
              <span className="flex items-center gap-1 text-purple-400 font-medium">
                <Users className="h-3.5 w-3.5" /> Competitor Cited
              </span>
              <span className="flex items-center gap-1 text-muted-foreground font-medium">
                <XCircle className="h-3.5 w-3.5" /> Neither Cited
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-3 w-1/3">Target Query & Intent</th>
                  {enginesList.map((engine) => (
                    <th key={engine} className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-mono">{engine.split('/').pop()}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-foreground text-xs">
                        "{row.query}"
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        {row.intentCategory}
                      </div>
                    </td>

                    {enginesList.map((engine) => {
                      const cell = row.engines[engine];
                      if (!cell) {
                        return (
                          <td key={engine} className="py-3.5 px-3 text-center text-muted-foreground">
                            -
                          </td>
                        );
                      }

                      const isCited = cell.status === 'cited';
                      const isCompetitor = cell.status === 'competitor_cited';

                      return (
                        <td key={engine} className="py-3.5 px-3 text-center">
                          <button
                            onClick={() =>
                              setActiveCellDetail({ query: row.query, cell })
                            }
                            className={`px-3 py-1.5 rounded-lg border transition-all inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                              isCited
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : isCompetitor
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                                : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'
                            }`}
                          >
                            {isCited ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Cited</span>
                              </>
                            ) : isCompetitor ? (
                              <>
                                <Users className="h-3.5 w-3.5" />
                                <span>Competitor</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Not Cited</span>
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal/Detail Drawer for Selected Cell */}
      {activeCellDetail && (
        <Card className="p-4 border-emerald-500/40 bg-card shadow-xl animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Engine Inspection:
                </span>
                <Badge variant="emerald" size="sm" className="font-mono">
                  {activeCellDetail.cell.engine}
                </Badge>
                <Badge
                  variant={
                    activeCellDetail.cell.status === 'cited'
                      ? 'emerald'
                      : activeCellDetail.cell.status === 'competitor_cited'
                      ? 'purple'
                      : 'secondary'
                  }
                  size="sm"
                >
                  {activeCellDetail.cell.status === 'cited'
                    ? 'Loopwise Cited'
                    : activeCellDetail.cell.status === 'competitor_cited'
                    ? 'Competitor Pick'
                    : 'Absent'}
                </Badge>
              </div>

              <div className="mt-2 text-sm font-bold text-foreground">
                "{activeCellDetail.query}"
              </div>

              <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border text-xs leading-relaxed text-foreground font-sans">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                  Answer Snippet:
                </span>
                "{activeCellDetail.cell.answerSnippet}"
              </div>

              {activeCellDetail.cell.competitorsNamed.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Competitors named in answer:</span>
                  {activeCellDetail.cell.competitorsNamed.map((c, i) => (
                    <Badge key={i} variant="outline" size="sm">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCellDetail(null)}
              className="text-xs shrink-0"
            >
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
