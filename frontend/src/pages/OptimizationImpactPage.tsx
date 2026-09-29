import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Rocket,
  TrendingUp,
  Bot,
  ExternalLink,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  Globe,
  Award,
  CheckCircle2,
  FileCode,
  X,
} from 'lucide-react';
import { fetchOptimizationImpacts, saveOptimizationAction } from '../api';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';
import { OptimizationActionRecord } from '../types';

export const OptimizationImpactPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    pageShipped: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const {
    data: actions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['optimization-actions'],
    queryFn: fetchOptimizationImpacts,
  });

  const mutation = useMutation({
    mutationFn: saveOptimizationAction,
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: ['optimization-actions'] });
      setIsModalOpen(false);
      setFormData({
        title: '',
        pageShipped: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      showToast({
        type: 'success',
        title: 'Optimization Action Logged',
        message: `Correlating impacts for "${newRecord.title}" in Hindsight memory.`,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.pageShipped) return;
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Optimization Impact
            </h1>
            <Badge variant="emerald" size="sm">
              7-Day Before & After
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Validates cause and effect: correlates shipping comparison pages or schema changes with subsequent crawler surges and citation growth.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Log Optimization Action
        </Button>
      </div>

      {/* Actions Feed */}
      <div className="space-y-6">
        {actions?.map((action: OptimizationActionRecord) => (
          <Card key={action.id} className="p-5 border-border/80 hover:border-emerald-500/40 transition-all">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {action.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono text-emerald-400 font-medium">
                      {action.pageShipped}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(action.date)}
                    </span>
                  </div>
                </div>
              </div>

              <Badge variant="emerald" size="sm">
                Consolidated in Hindsight
              </Badge>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed my-3.5">
              {action.description}
            </p>

            {/* 7-Day Before vs. 7-Day After Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {/* Metric 1: Citation Share */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Citation Share
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{action.citationShare.before7d}%</span>
                    <span className="mx-1 text-muted-foreground/60">→</span>
                    <span className="font-mono font-bold text-foreground">
                      {action.citationShare.after7d}%
                    </span>
                  </div>
                  <Badge variant="emerald" size="sm" className="text-[10px]">
                    +{action.citationShare.deltaPct}%
                  </Badge>
                </div>
              </div>

              {/* Metric 2: Crawler Visits */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  AI Bot Crawls (7d)
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{action.crawlerVisits.before7d}</span>
                    <span className="mx-1 text-muted-foreground/60">→</span>
                    <span className="font-mono font-bold text-foreground">
                      {action.crawlerVisits.after7d}
                    </span>
                  </div>
                  <Badge variant="blue" size="sm" className="text-[10px]">
                    +{action.crawlerVisits.deltaPct}%
                  </Badge>
                </div>
              </div>

              {/* Metric 3: AI Referrals */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  AI Referrals (7d)
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{action.referrals.before7d}</span>
                    <span className="mx-1 text-muted-foreground/60">→</span>
                    <span className="font-mono font-bold text-foreground">
                      {action.referrals.after7d}
                    </span>
                  </div>
                  <Badge variant="purple" size="sm" className="text-[10px]">
                    +{action.referrals.deltaPct}%
                  </Badge>
                </div>
              </div>

              {/* Metric 4: Search Console Rank */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Avg Organic Position
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{action.searchRank.before7d}</span>
                    <span className="mx-1 text-muted-foreground/60">→</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {action.searchRank.after7d}
                    </span>
                  </div>
                  <Badge variant="emerald" size="sm" className="text-[10px]">
                    Improved
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Add New Optimization Action Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-foreground">
                Log Optimization Action
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Record a newly published landing page, comparison matrix, or schema fix. CiteWatch will monitor and calculate the before/after delta.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">
                  Action Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shipped /pricing FAQ JSON-LD Schema"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Target Page URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/features/email-sequencing"
                    value={formData.pageShipped}
                    onChange={(e) =>
                      setFormData({ ...formData, pageShipped: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1.5">
                    Date Shipped
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">
                  Description & Changes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe ground-truth facts, schema tags, or comparison copy added..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={mutation.isPending}
                >
                  Save & Correlate
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
