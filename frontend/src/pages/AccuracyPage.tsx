import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Bot,
  Sparkles,
  RefreshCw,
  ArrowRight,
  FileCode,
  Tag,
} from 'lucide-react';
import { fetchAccuracyMatrix } from '../api';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { GroundTruthCheckItem } from '../types';

export const AccuracyPage: React.FC = () => {
  const { brand } = useApp();

  const {
    data: items,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['accuracy-matrix'],
    queryFn: fetchAccuracyMatrix,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const mismatchesCount = (items || []).filter((item) =>
    item.engineClaims.some((claim) => !claim.isMatch)
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Factual Accuracy & Ground Truth
            </h1>
            <Badge variant="emerald" size="sm">
              brand.yaml Validation
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Audits answer engine responses against your official <code className="text-emerald-400">brand.yaml</code> ground-truth specifications to eliminate hallucinations.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Re-Check Accuracy
        </Button>
      </div>

      {/* Ground Truth Status Banner */}
      <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                3 of 4 Core Specifications Fully Verified
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Base price ($49/mo flat), pipeline automation, and email sequencing match 100% of tested Groq engine answers. 
                1 minor ambiguity remains regarding FAQ schema support on <code className="text-foreground">gpt-oss-120b</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={mismatchesCount === 0 ? 'emerald' : 'amber'} size="md">
              {mismatchesCount} Active Mismatch
            </Badge>
          </div>
        </div>
      </Card>

      {/* Accuracy Matrix Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Ground Truth vs. Answer Engine Claims</CardTitle>
              <CardDescription>
                Comparison of official product features with what LLMs state in verbatim answers.
              </CardDescription>
            </div>
            <Badge variant="outline" size="sm">
              Hindsight Evaluation
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-3 w-1/4">Feature / Claim</th>
                  <th className="py-3 px-3 w-1/4">Official Ground Truth</th>
                  <th className="py-3 px-3 w-1/3">Engine Verifications</th>
                  <th className="py-3 px-3 text-right">Target Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items?.map((item: GroundTruthCheckItem) => {
                  const hasMismatch = item.engineClaims.some((c) => !c.isMatch);

                  return (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Feature Name */}
                      <td className="py-4 px-3 align-top">
                        <div className="font-semibold text-foreground text-xs">
                          {item.featureOrClaim}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          <span>Page: {item.affectedPage}</span>
                        </div>
                      </td>

                      {/* Official Value */}
                      <td className="py-4 px-3 align-top font-mono">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold text-[11px] leading-relaxed">
                          {item.groundTruthValue}
                        </div>
                      </td>

                      {/* Engine Claims Breakdown */}
                      <td className="py-4 px-3 align-top space-y-2">
                        {item.engineClaims.map((claim, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-2 rounded-lg border text-[11px] flex items-start justify-between gap-2 ${
                              claim.isMatch
                                ? 'bg-secondary/40 border-border text-foreground'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            }`}
                          >
                            <div>
                              <span className="font-mono font-bold text-[10px] block opacity-80">
                                {claim.engine.split('/').pop()}:
                              </span>
                              <span>"{claim.claimedValue}"</span>
                            </div>

                            <div className="shrink-0 mt-0.5">
                              {claim.isMatch ? (
                                <Badge variant="emerald" size="sm" className="text-[9px] py-0">
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Match
                                </Badge>
                              ) : (
                                <Badge variant="red" size="sm" className="text-[9px] py-0">
                                  <XCircle className="h-2.5 w-2.5 mr-0.5" /> Mismatch
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </td>

                      {/* Recommendation & Target Page */}
                      <td className="py-4 px-3 align-top text-right">
                        <div className="text-[11px] text-muted-foreground leading-relaxed text-left">
                          {item.recommendedFix}
                        </div>
                        <div className="mt-2 text-right">
                          <span className="font-mono text-[10px] text-emerald-400 font-semibold bg-secondary px-2 py-1 rounded inline-block">
                            {item.affectedPage}
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
    </div>
  );
};
