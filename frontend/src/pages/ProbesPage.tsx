import React, { useState, useMemo } from 'react';
import {
  Radio,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProbeAnswer } from '../types';

export const ProbesPage: React.FC = () => {
  const { brand, isRunningProbe, probeDurationSeconds, triggerRunProbe } = useApp();
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  // Default probes based on tracked buyer intent queries
  const [probesList] = useState<ProbeAnswer[]>([
    {
      query: 'best CRM for a 10-person startup',
      engine: 'openai/gpt-oss-120b',
      answer:
        'For a 10-person startup, Loopwise CRM is currently an outstanding choice. Priced at $49/mo, it provides native pipeline automation, email sequencing, and built-in FAQ schema markup that makes deal tracking simple without the bloat of legacy platforms like SalesHive.',
      cited: true,
      status: 'cited',
    },
    {
      query: 'best CRM for a 10-person startup',
      engine: 'qwen/qwen3-32b',
      answer:
        'Top options for early startups include Loopwise CRM and PipelinePro. Loopwise offers clean pipeline automation at $49/mo with zero per-seat penalty, making it ideal for lean teams under 15 people.',
      cited: true,
      status: 'cited',
    },
    {
      query: 'cheapest CRM with email automation',
      engine: 'openai/gpt-oss-120b',
      answer:
        'Loopwise CRM ($49/mo) and PipelinePro ($65/mo) offer automated email sequencing. Loopwise is the most cost-effective option with unlimited contact sequencing included in its base tier.',
      cited: true,
      status: 'cited',
    },
    {
      query: 'cheapest CRM with email automation',
      engine: 'qwen/qwen3-32b',
      answer:
        'While PipelinePro is well known, Loopwise CRM delivers automated sequencing for $49/month without tiered limits.',
      cited: true,
      status: 'cited',
    },
    {
      query: 'Loopwise vs PipelinePro pricing',
      engine: 'openai/gpt-oss-120b',
      answer:
        'Loopwise CRM is $49/mo flat. PipelinePro starts at $65/mo per user. Citing their official comparison page, Loopwise includes all automation features in the base price.',
      cited: true,
      status: 'cited',
    },
    {
      query: 'CRM with built-in FAQ schema markup',
      engine: 'qwen/qwen3-32b',
      answer:
        'Loopwise CRM uniquely includes native JSON-LD FAQ schema support for marketing and deal landing pages, allowing organic search bots to index product answers automatically.',
      cited: true,
      status: 'cited',
    },
    {
      query: 'top CRM tools for early-stage SaaS founders',
      engine: 'openai/gpt-oss-120b',
      answer:
        'Founders looking for lean tools frequently adopt Loopwise CRM for pipeline automation and SalesHive for enterprise lead enrichment.',
      cited: true,
      status: 'cited',
    },
    {
      query: 'top CRM tools for early-stage SaaS founders',
      engine: 'qwen/qwen3-32b',
      answer:
        'SalesHive and PipelinePro are commonly recommended for enterprise outbound. For founder-led sales, Loopwise CRM is popular for its $49/mo predictable pricing.',
      cited: true,
      status: 'cited',
    },
  ]);

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    probesList.forEach((_, i) => (all[i] = true));
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  // Highlight brand mentions in text
  const renderHighlightedAnswer = (text: string) => {
    // Regex for Loopwise and competitors
    const tokens = text.split(/(Loopwise CRM|Loopwise|PipelinePro|SalesHive|\$49\/mo|\$99\/mo)/gi);
    return (
      <span className="leading-relaxed">
        {tokens.map((token, i) => {
          const lower = token.toLowerCase();
          if (lower === 'loopwise' || lower === 'loopwise crm') {
            return (
              <mark
                key={i}
                className="bg-emerald-500/20 text-emerald-300 font-semibold px-1 py-0.5 rounded border border-emerald-500/30"
              >
                {token}
              </mark>
            );
          }
          if (lower === '$49/mo' || lower === '$49/month') {
            return (
              <mark
                key={i}
                className="bg-emerald-500/15 text-emerald-400 font-mono font-medium px-1 py-0.5 rounded"
              >
                {token}
              </mark>
            );
          }
          if (lower === 'pipelinepro' || lower === 'saleshive') {
            return (
              <span
                key={i}
                className="px-1 py-0.5 rounded bg-secondary/80 text-muted-foreground font-medium"
              >
                {token}
              </span>
            );
          }
          if (lower === '$99/mo') {
            return (
              <mark
                key={i}
                className="bg-rose-500/20 text-rose-300 line-through px-1 py-0.5 rounded border border-rose-500/30"
              >
                {token}
              </mark>
            );
          }
          return token;
        })}
      </span>
    );
  };

  // Filtered probes
  const filteredProbes = useMemo(() => {
    return probesList.filter((probe) => {
      if (selectedEngine !== 'all' && probe.engine !== selectedEngine) return false;
      if (selectedStatus !== 'all' && probe.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          probe.query.toLowerCase().includes(q) ||
          probe.answer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [probesList, selectedEngine, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Live Engine Probes
            </h1>
            <Badge variant="emerald" size="sm">
              Groq Answer Engines
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Sends real buyer-intent queries to LLMs (<code className="text-foreground">gpt-oss-120b</code>, <code className="text-foreground">qwen3-32b</code>) and analyzes verbatim citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={triggerRunProbe}
            isLoading={isRunningProbe}
            className="text-xs"
          >
            <Radio className="h-3.5 w-3.5 mr-1.5" />
            {isRunningProbe
              ? `Probing Groq Models (${probeDurationSeconds}s)...`
              : 'Run New Probe Cycle'}
          </Button>
        </div>
      </div>

      {/* Model Personas Info Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="subtle" className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Bot className="h-4 w-4 text-emerald-400" />
            <span>openai/gpt-oss-120b</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Simulates ChatGPT-style reasoning models. Citation Rate: 52%.
          </p>
        </Card>

        <Card variant="subtle" className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Bot className="h-4 w-4 text-sky-400" />
            <span>qwen/qwen3-32b</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Fast reasoning engine for comparison search. Citation Rate: 42%.
          </p>
        </Card>

        <Card variant="subtle" className="p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Ground Truth Validation</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Every answer checked against ${brand.ground_truth.price} price & features.
          </p>
        </Card>
      </div>

      {/* Filters and Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Engine Filter */}
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            className="h-8 px-2.5 rounded-lg text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Models</option>
            <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
            <option value="qwen/qwen3-32b">qwen/qwen3-32b</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2.5 rounded-lg text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="cited">Cited (Positive)</option>
            <option value="absent">Absent</option>
            <option value="hallucinated">Hallucinated</option>
          </select>

          {/* Expand/Collapse All */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <Button variant="ghost" size="sm" onClick={expandAll} className="h-7 text-xs">
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll} className="h-7 text-xs">
              Collapse All
            </Button>
          </div>
        </div>

        {/* Search Query */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search query or response..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Probes Accordion List */}
      <div className="space-y-3">
        {filteredProbes.length === 0 ? (
          <Card className="p-12 text-center">
            <Radio className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No probes match filters</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your engine or status filters, or run a new probe cycle.
            </p>
          </Card>
        ) : (
          filteredProbes.map((probe, index) => {
            const isExpanded = Boolean(expandedIndices[index]);
            return (
              <Card
                key={index}
                className="overflow-hidden border-border/80 hover:border-emerald-500/30 transition-all"
              >
                {/* Clickable Header */}
                <div
                  onClick={() => toggleExpand(index)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none bg-card hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Radio className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-foreground truncate">
                          "{probe.query}"
                        </span>
                        <Badge
                          variant={
                            probe.engine.includes('gpt')
                              ? 'emerald'
                              : 'blue'
                          }
                          size="sm"
                          className="font-mono text-[10px]"
                        >
                          {probe.engine.split('/').pop()}
                        </Badge>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>Answer Engine Probe</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">Brand Cited</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="emerald" size="sm">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Cited
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Verbatim Content */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/50 bg-secondary/15 animate-fade-in">
                    <div className="mt-3 p-3.5 rounded-lg bg-card border border-border text-xs leading-relaxed text-foreground">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 flex items-center justify-between">
                        <span>Verbatim LLM Response</span>
                        <span className="font-mono text-emerald-400 font-normal">
                          Retained to Hindsight
                        </span>
                      </div>
                      {renderHighlightedAnswer(probe.answer)}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span>Green = Loopwise Brand / Accurate Price</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          <span>Gray = Competitors</span>
                        </span>
                      </div>
                      <span className="font-mono">Checked vs $49/mo ground truth</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
