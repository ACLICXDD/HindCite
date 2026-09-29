/**
 * CiteWatch API Client & AI SEO Engine Provider
 * 
 * Provides unified API methods for CiteWatch. If VITE_USE_MOCK is enabled
 * or the user toggles mock mode in Settings, it serves realistic 25-day
 * narrative data for "Loopwise CRM" illustrating citation growth, AI crawler
 * ingestion, Search Console correlations, and optimization action impacts.
 */

import {
  CitationHealthReport,
  HealthApiResponse,
  TimelineResponse,
  TimelineFact,
  TimelineTrendPoint,
  ProbeResponse,
  IngestLogsResponse,
  ChatRequest,
  ChatResponse,
  BrandConfig,
  ProbeAnswer,
  DailyCrawlerPoint,
  CrawlerBlindSpot,
  DailyReferralPoint,
  SearchConsoleQueryRow,
  QueryMatrixRow,
  ShareOfVoicePoint,
  OptimizationActionRecord,
  GroundTruthCheckItem,
  AiSeoScoreBreakdown,
  RecommendedAction,
} from './types';

// Configuration helpers
export function getApiBaseUrl(): string {
  const saved = localStorage.getItem('citewatch_api_base_url');
  if (saved) return saved;
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem('citewatch_api_base_url', url);
}

export function isMockMode(): boolean {
  const saved = localStorage.getItem('citewatch_use_mock');
  if (saved !== null) {
    return saved === 'true';
  }
  return import.meta.env.VITE_USE_MOCK !== 'false';
}

export function setMockMode(enabled: boolean): void {
  localStorage.setItem('citewatch_use_mock', String(enabled));
}

// -------------------------------------------------------------------------
// Brand Ground Truth (matches brand.yaml)
// -------------------------------------------------------------------------
export const LOOPWISE_BRAND: BrandConfig = {
  id: 'loopwise',
  name: 'Loopwise CRM',
  bank_id: 'brand-loopwise',
  domain: 'loopwise.example.com',
  ground_truth: {
    price: '$49/mo',
    features: [
      'pipeline automation',
      'email sequencing',
      'built-in FAQ schema support',
    ],
  },
  competitors: ['PipelinePro', 'SalesHive'],
  queries: [
    'best CRM for a 10-person startup',
    'cheapest CRM with email automation',
    'Loopwise vs PipelinePro pricing',
    'CRM with built-in FAQ schema markup',
    'top CRM tools for early-stage SaaS founders',
  ],
};

// -------------------------------------------------------------------------
// Realistic 25-Day Mock Data Generator
// -------------------------------------------------------------------------
const DAYS = 25;
const now = new Date();

function getDateOffset(daysAgo: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// In-memory state for user actions during demo
let mockRecommendedActions: RecommendedAction[] = [
  {
    id: 'act-1',
    action: 'Expand /vs-pipelinepro comparison table with email sequencing details',
    rationale: 'PipelinePro is still recommended in 38% of automation queries due to lack of explicit step comparisons.',
    evidence_quote: 'PipelinePro remains the preferred pick for automated sequencing workflows due to documented rules.',
    impact: 'high',
    completed: false,
    category: 'citation',
    target_url: '/vs-competitor',
  },
  {
    id: 'act-2',
    action: 'Add structured FAQ schema markup to /pricing page',
    rationale: 'GPTBot crawls /pricing 28x weekly but still occasionally claims pricing requires enterprise quotes.',
    evidence_quote: 'The price for Loopwise CRM could not be verified from the main landing page metadata.',
    impact: 'medium',
    completed: true,
    category: 'accuracy',
    target_url: '/pricing',
  },
  {
    id: 'act-3',
    action: 'Publish case study on early-stage SaaS migration from SalesHive',
    rationale: 'Perplexity citations convert well but lack testimonials from early-stage founders.',
    evidence_quote: '3 referral sessions arrived from perplexity.ai searching for startup migration guides.',
    impact: 'low',
    completed: false,
    category: 'referral',
    target_url: '/blog/migration-case-study',
  },
  {
    id: 'act-4',
    action: 'Fix crawler blind spot: submit /faq to Google-Extended & ClaudeBot',
    rationale: 'ClaudeBot has crawled /vs-competitor 34x but has never visited the dedicated /faq page.',
    evidence_quote: 'Crawler digest shows 0 ClaudeBot visits to /faq across 25 days.',
    impact: 'high',
    completed: false,
    category: 'crawler',
    target_url: '/faq',
  },
];

export function toggleMockAction(actionId: string): void {
  mockRecommendedActions = mockRecommendedActions.map((a) =>
    a.id === actionId ? { ...a, completed: !a.completed } : a
  );
}

// -------------------------------------------------------------------------
// API Method 1: GET /api/health
// -------------------------------------------------------------------------
export async function fetchHealth(): Promise<HealthApiResponse> {
  if (isMockMode()) {
    const mockReport: CitationHealthReport = {
      citation_share_pct: 47.0,
      trend_direction: 'up',
      trend_delta_30d_pct: 35.0,
      engines: [
        { engine: 'openai/gpt-oss-120b', mentioned_pct: 52.0 },
        { engine: 'qwen/qwen3-32b', mentioned_pct: 42.0 },
      ],
      top_crawled_pages: [
        { page: '/vs-competitor', bot: 'ClaudeBot', visits: 34, last_seen: getDateOffset(0) },
        { page: '/pricing', bot: 'GPTBot', visits: 28, last_seen: getDateOffset(0) },
        { page: '/', bot: 'Google-Extended', visits: 18, last_seen: getDateOffset(1) },
        { page: '/faq', bot: 'PerplexityBot', visits: 14, last_seen: getDateOffset(2) },
        { page: '/blog/comparison', bot: 'Bytespider', visits: 9, last_seen: getDateOffset(3) },
      ],
      ai_referral_sessions_7d: 19,
      top_hallucinations: [
        {
          claim: 'Loopwise plans cost $99/mo with setup fees',
          correct_value: '$49/mo flat with no setup fees',
          status: 'resolved',
          engine: 'openai/gpt-oss-120b',
          severity: 'critical',
          date_detected: getDateOffset(10),
          affected_page: '/pricing',
        },
        {
          claim: 'Lacks native FAQ schema markup for search engines',
          correct_value: 'Built-in automated JSON-LD FAQ schema',
          status: 'active',
          engine: 'qwen/qwen3-32b',
          severity: 'warning',
          date_detected: getDateOffset(3),
          affected_page: '/vs-competitor',
        },
      ],
      recommended_actions: mockRecommendedActions,
    };

    return {
      content:
        'Citation share is 47%, up +35% over 30 days. Growth accelerated following the publication of the /vs-competitor comparison page on Day 15. The $99/mo pricing hallucination is resolved across GPTBot-indexed answers, though Qwen occasionally doubts FAQ schema availability.',
      structured: mockReport,
      last_refreshed_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    };
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/health`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch health report: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// -------------------------------------------------------------------------
// API Method 2: GET /api/timeline
// -------------------------------------------------------------------------
export async function fetchTimeline(): Promise<TimelineResponse> {
  if (isMockMode()) {
    const facts: TimelineFact[] = [];

    facts.push({
      id: 'fact-25',
      text: 'Loopwise CRM citation share reached 47% across buyer-intent queries, with GPTBot crawling /pricing and /vs-competitor daily.',
      type: 'observation',
      context: 'Mental Model consolidation',
      tags: ['kind:observation', 'engine:gpt-oss-120b', 'citation:mentioned'],
      occurred_start: `${getDateOffset(1)}T18:00:00Z`,
      mentioned_at: `${getDateOffset(1)}T23:59:00Z`,
    });

    facts.push({
      id: 'fact-22',
      text: 'Loopwise CRM was recommended as a top pick for 10-person startups at $49/mo, directly referencing features on /vs-competitor.',
      type: 'experience',
      context: 'AI answer-engine citation probe',
      tags: ['kind:live-probe', 'engine:gpt-oss-120b', 'accuracy:accurate'],
      occurred_start: `${getDateOffset(3)}T12:00:00Z`,
      mentioned_at: `${getDateOffset(3)}T12:05:00Z`,
    });

    facts.push({
      id: 'fact-20',
      text: 'Daily crawl digest: 9 referral sessions arrived from perplexity.ai and chatgpt.com landing on /vs-competitor. ClaudeBot crawled /vs-competitor 8x.',
      type: 'world',
      context: 'daily AI-crawler, referral and search-console digest',
      tags: ['kind:crawl-digest'],
      occurred_start: `${getDateOffset(5)}T23:59:00Z`,
      mentioned_at: `${getDateOffset(5)}T23:59:00Z`,
    });

    facts.push({
      id: 'fact-18',
      text: 'Pricing hallucination resolved: gpt-oss-120b now accurately outputs $49/mo instead of previous $99/mo claim.',
      type: 'observation',
      context: 'Consolidation of probe answers',
      tags: ['kind:observation', 'accuracy:accurate'],
      occurred_start: `${getDateOffset(7)}T10:00:00Z`,
      mentioned_at: `${getDateOffset(7)}T10:00:00Z`,
    });

    facts.push({
      id: 'fact-15-action',
      text: 'Published a new /vs-competitor comparison page with accurate pricing ($49/mo), side-by-side feature matrix, and FAQ schema markup.',
      type: 'experience',
      context: 'optimization action',
      tags: ['kind:optimization-action'],
      occurred_start: `${getDateOffset(10)}T09:00:00Z`,
      mentioned_at: `${getDateOffset(10)}T09:00:00Z`,
    });

    facts.push({
      id: 'fact-15-probe',
      text: 'Loopwise CRM was mentioned with correct price of $49/mo, citing the newly shipped /vs-competitor page.',
      type: 'experience',
      context: 'AI answer-engine citation probe',
      tags: ['kind:live-probe', 'engine:gpt-oss-120b'],
      occurred_start: `${getDateOffset(10)}T12:00:00Z`,
      mentioned_at: `${getDateOffset(10)}T12:00:00Z`,
    });

    facts.push({
      id: 'fact-8',
      text: 'Daily crawl digest: GPTBot crawled / 1x. No visits to /pricing. 0 AI referral sessions.',
      type: 'world',
      context: 'daily AI-crawler, referral and search-console digest',
      tags: ['kind:crawl-digest'],
      occurred_start: `${getDateOffset(17)}T23:59:00Z`,
      mentioned_at: `${getDateOffset(17)}T23:59:00Z`,
    });

    facts.push({
      id: 'fact-2',
      text: 'Loopwise CRM was mentioned but price was erroneously stated as $99/mo (actual: $49/mo).',
      type: 'experience',
      context: 'AI answer-engine citation probe',
      tags: ['kind:live-probe', 'accuracy:hallucinated'],
      occurred_start: `${getDateOffset(23)}T12:00:00Z`,
      mentioned_at: `${getDateOffset(23)}T12:00:00Z`,
    });

    facts.push({
      id: 'fact-0',
      text: 'Loopwise CRM was not mentioned. The answer recommended PipelinePro and SalesHive instead.',
      type: 'experience',
      context: 'AI answer-engine citation probe (historical)',
      tags: ['kind:live-probe', 'citation:absent'],
      occurred_start: `${getDateOffset(25)}T12:00:00Z`,
      mentioned_at: `${getDateOffset(25)}T12:00:00Z`,
    });

    return { results: facts };
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/timeline`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch timeline: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getTimelineTrendPoints(): TimelineTrendPoint[] {
  const points: TimelineTrendPoint[] = [];

  for (let day = 0; day < DAYS; day++) {
    const dateStr = getDateOffset(DAYS - 1 - day);
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));

    let citationShare = 12;
    let crawls = 2;
    let referrals = 0;
    let action: string | undefined;
    let milestone: string | undefined;

    if (day < 14) {
      citationShare = Math.round(11 + Math.sin(day * 0.8) * 3);
      crawls = 1 + (day % 3);
      referrals = 0;
      if (day === 2) {
        milestone = 'Wrong $99/mo price detected';
      }
    } else if (day === 14) {
      citationShare = 16;
      crawls = 6;
      referrals = 1;
      action = 'Shipped /vs-competitor page';
      milestone = 'Optimization Action Published';
    } else {
      const daysSinceAction = day - 14;
      citationShare = Math.min(
        50,
        Math.round(16 + daysSinceAction * 3.1 + Math.sin(day) * 2)
      );
      crawls = 6 + daysSinceAction * 2;
      referrals = Math.min(10, Math.floor(daysSinceAction * 0.9));
      if (day === 18) {
        milestone = 'Price hallucination resolved';
      } else if (day === 24) {
        milestone = 'Peak 47% share reached';
      }
    }

    points.push({
      date: dateFormatted,
      citationShare,
      crawls,
      referrals,
      action,
      milestone,
    });
  }

  return points;
}

// -------------------------------------------------------------------------
// API Method 3: POST /api/probe
// -------------------------------------------------------------------------
export async function runProbe(): Promise<ProbeResponse> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const mockAnswers: ProbeAnswer[] = [
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
    ];

    return {
      date: new Date().toISOString().split('T')[0],
      probes_run: mockAnswers.length,
      raw_answers: mockAnswers,
    };
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/probe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Probe cycle failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// -------------------------------------------------------------------------
// API Method 4: POST /api/ingest-logs
// -------------------------------------------------------------------------
export async function ingestLogs(): Promise<IngestLogsResponse> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const today = new Date().toISOString().split('T')[0];
    const digest = `Daily crawl + search + referral digest for ${today}:
- GPTBot crawled: /vs-competitor (14x), /pricing (8x), / (4x)
- ClaudeBot crawled: /vs-competitor (12x), /faq (5x)
- PerplexityBot crawled: /vs-competitor (6x)
- 4 referral session(s) arrived from chatgpt.com
- 3 referral session(s) arrived from perplexity.ai
- Search Console: 'best crm for startups' impressions 492, clicks 34, avg position 5.1`;

    return {
      date: today,
      digest,
    };
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/ingest-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Log ingestion failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// -------------------------------------------------------------------------
// API Method 5: POST /api/chat
// -------------------------------------------------------------------------
export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const q = req.message.toLowerCase();

    if (q.includes('why') || q.includes('rise') || q.includes('increase') || q.includes('climb')) {
      return {
        text: `Citation share climbed from 14% to 47% primarily because on ${getDateOffset(10)} you published the **\`/vs-competitor\`** comparison page. 

Following this action:
1. **AI Crawler Frequency Surged**: GPTBot and ClaudeBot crawled \`/vs-competitor\` over 46 times in the subsequent 5 days.
2. **Pricing Hallucination Cleared**: Groq answer engines immediately stopped stating the inaccurate $99/mo price and began citing the exact $49/mo ground truth.
3. **AI Referrals Began**: 19 referral sessions arrived from \`chatgpt.com\` and \`perplexity.ai\`, proving users are clicking through direct citations.`,
        sources: [
          {
            text: 'Published a new /vs-competitor comparison page with accurate pricing ($49/mo) and FAQ schema markup.',
            type: 'experience',
            occurred_start: `${getDateOffset(10)}T09:00:00Z`,
          },
          {
            text: 'Loopwise CRM citation share reached 47% across buyer-intent queries after comparison page crawled by GPTBot and ClaudeBot.',
            type: 'observation',
            occurred_start: `${getDateOffset(5)}T18:00:00Z`,
          },
          {
            text: 'GPTBot crawled: /vs-competitor (14x), /pricing (8x). 4 referral sessions arrived from chatgpt.com.',
            type: 'world',
            occurred_start: `${getDateOffset(1)}T23:59:00Z`,
          },
        ],
      };
    }

    if (q.includes('price') || q.includes('pricing') || q.includes('wrong') || q.includes('hallucinat')) {
      return {
        text: `Initially, **Qwen** and **gpt-oss-120b** hallucinated that Loopwise CRM cost **$99/mo** (detected ${getDateOffset(23)}). 

However, this hallucination is now **RESOLVED**. On ${getDateOffset(10)}, the \`/vs-competitor\` page went live with clear semantic pricing tags. The latest probe cycle confirms 100% of answer engines report the true **$49/mo** pricing.

The only remaining minor hallucination is that Qwen occasionally questions whether FAQ schema markup is natively supported.`,
        sources: [
          {
            text: 'Loopwise CRM was mentioned but price was erroneously stated as $99/mo (actual: $49/mo).',
            type: 'experience',
            occurred_start: `${getDateOffset(23)}T12:00:00Z`,
          },
          {
            text: 'Pricing hallucination resolved: gpt-oss-120b now accurately outputs $49/mo instead of previous $99/mo claim.',
            type: 'observation',
            occurred_start: `${getDateOffset(7)}T10:00:00Z`,
          },
        ],
      };
    }

    if (q.includes('crawler') || q.includes('bot') || q.includes('page') || q.includes('visit')) {
      return {
        text: `Over the past 7 days, AI crawlers have heavily favored your comparison and pricing assets:
- **\`/vs-competitor\`**: 34 visits (led by ClaudeBot & GPTBot)
- **\`/pricing\`**: 28 visits (led by GPTBot)
- **\`/\`**: 18 visits (Google-Extended)
- **\`/faq\`**: 14 visits (PerplexityBot)

ClaudeBot was the fastest to re-index the comparison page after publication.`,
        sources: [
          {
            text: 'ClaudeBot crawled /vs-competitor 12x, GPTBot crawled /vs-competitor 14x and /pricing 8x.',
            type: 'world',
            occurred_start: `${getDateOffset(2)}T23:59:00Z`,
          },
        ],
      };
    }

    return {
      text: `Based on 25 days of retained evidence in Hindsight, Loopwise CRM is currently performing well with a **47% citation share** across 5 monitored buyer-intent queries. 

Key status:
- **Best Engine**: \`openai/gpt-oss-120b\` (52% citation share)
- **Recent Momentum**: +35% citation share over 30 days
- **Active Recommendation**: Add structured FAQ schema testing breadcrumbs to \`/pricing\` to eliminate the last remaining schema ambiguity on Qwen.`,
      sources: [
        {
          text: 'Loopwise CRM was recommended as a top pick for 10-person startups at $49/mo, directly referencing features on /vs-competitor.',
          type: 'experience',
          occurred_start: `${getDateOffset(3)}T12:00:00Z`,
        },
        {
          text: 'Citation Health Report: citation_share_pct=47.0, trend_direction=up.',
          type: 'observation',
          occurred_start: `${getDateOffset(1)}T00:00:00Z`,
        },
      ],
    };
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// -------------------------------------------------------------------------
// NEW AI SEO METHODS
// -------------------------------------------------------------------------

/**
 * 1. AI Crawlers: 25-Day Daily Breakdown by Bot
 */
export async function fetchDailyCrawlerStats(): Promise<DailyCrawlerPoint[]> {
  const points: DailyCrawlerPoint[] = [];

  for (let day = 0; day < DAYS; day++) {
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(getDateOffset(DAYS - 1 - day)));

    let gpt = 1;
    let claude = 0;
    let perplexity = 0;
    let google = 1;
    let others = 0;

    if (day >= 14) {
      // Crawl surge after shipping /vs-competitor
      const daysAfter = day - 14;
      gpt = 3 + daysAfter * 2 + (day % 3);
      claude = 2 + daysAfter * 2 + (day % 2);
      perplexity = 1 + Math.floor(daysAfter * 1.2);
      google = 2 + Math.floor(daysAfter * 0.8);
      others = Math.floor(daysAfter * 0.5);
    } else {
      gpt = 1 + (day % 2);
      claude = day % 3 === 0 ? 1 : 0;
      perplexity = day % 4 === 0 ? 1 : 0;
      google = 1;
      others = 0;
    }

    const total = gpt + claude + perplexity + google + others;

    points.push({
      date: dateFormatted,
      GPTBot: gpt,
      ClaudeBot: claude,
      PerplexityBot: perplexity,
      GoogleExtended: google,
      Others: others,
      total,
    });
  }

  return points;
}

/**
 * 1. AI Crawlers: Blind Spots
 */
export async function fetchCrawlerBlindSpots(): Promise<CrawlerBlindSpot[]> {
  return [
    {
      page: '/faq',
      importance: 'critical',
      lastCrawledDaysAgo: 18,
      reason: 'ClaudeBot & Google-Extended have not re-indexed FAQ since the initial product launch.',
      suggestedFix: 'Link /faq directly in header navigation and include schema item "mainEntity" with Question/Answer markup.',
      potentialCitationGain: '+14% on question-style prompts',
    },
    {
      page: '/features/email-sequencing',
      importance: 'high',
      lastCrawledDaysAgo: null, // Never crawled
      reason: 'No internal links from the root homepage; blocked by orphaned subfolder structure.',
      suggestedFix: 'Add internal link from /vs-competitor to /features/email-sequencing with explicit anchor text.',
      potentialCitationGain: '+22% on "CRM with email automation" queries',
    },
    {
      page: '/pricing/comparison-table',
      importance: 'medium',
      lastCrawledDaysAgo: 24,
      reason: 'Loaded via client-side JavaScript tab without server-side static HTML render.',
      suggestedFix: 'Pre-render static HTML table tags so AI bots without full JS rendering engine can parse $49/mo pricing.',
      potentialCitationGain: '+8% on pricing comparison queries',
    },
  ];
}

/**
 * 2. AI Referrals & Search: Daily Trend & Search Console
 */
export async function fetchDailyReferralsAndSearch(): Promise<DailyReferralPoint[]> {
  const points: DailyReferralPoint[] = [];

  for (let day = 0; day < DAYS; day++) {
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(getDateOffset(DAYS - 1 - day)));

    let chatgpt = 0;
    let perplexity = 0;
    let gemini = 0;
    let copilot = 0;

    if (day >= 15) {
      const daysAfter = day - 14;
      chatgpt = Math.min(8, Math.floor(daysAfter * 0.7));
      perplexity = Math.min(6, Math.floor(daysAfter * 0.5));
      gemini = day % 3 === 0 ? 1 : 0;
      copilot = day % 4 === 0 ? 1 : 0;
    }

    const totalAiReferrals = chatgpt + perplexity + gemini + copilot;

    // Classic Search Console metrics matching seed_demo_data.py
    const classicImpressions = 300 + day * 12;
    const classicClicks = 12 + Math.max(0, day - 14) * 2;
    const classicAvgRank = Math.max(2.1, Number((8.5 - Math.max(0, day - 14) * 0.3).toFixed(1)));

    points.push({
      date: dateFormatted,
      chatgpt,
      perplexity,
      gemini,
      copilot,
      totalAiReferrals,
      classicSearchClicks: classicClicks,
      classicImpressions,
      classicAvgRank,
    });
  }

  return points;
}

export async function fetchSearchConsoleTopQueries(): Promise<SearchConsoleQueryRow[]> {
  return [
    {
      query: 'best CRM for startups',
      impressions: 4820,
      clicks: 340,
      ctr: 7.1,
      avgPosition: 3.2,
      aiOverlap: true,
    },
    {
      query: 'CRM with email automation',
      impressions: 3120,
      clicks: 195,
      ctr: 6.2,
      avgPosition: 4.8,
      aiOverlap: true,
    },
    {
      query: 'Loopwise vs PipelinePro pricing',
      impressions: 1650,
      clicks: 285,
      ctr: 17.3,
      avgPosition: 1.4,
      aiOverlap: true,
    },
    {
      query: 'pipeline automation software startup',
      impressions: 1240,
      clicks: 88,
      ctr: 7.0,
      avgPosition: 5.6,
      aiOverlap: false,
    },
    {
      query: 'CRM built-in FAQ schema markup',
      impressions: 890,
      clicks: 112,
      ctr: 12.5,
      avgPosition: 2.1,
      aiOverlap: true,
    },
  ];
}

/**
 * 3. Query Visibility Matrix
 */
export async function fetchVisibilityMatrix(): Promise<{
  rows: QueryMatrixRow[];
  enginesList: string[];
}> {
  const enginesList = ['openai/gpt-oss-120b', 'qwen/qwen3-32b'];

  const rows: QueryMatrixRow[] = [
    {
      query: 'best CRM for a 10-person startup',
      intentCategory: 'High Buyer Intent',
      engines: {
        'openai/gpt-oss-120b': {
          engine: 'openai/gpt-oss-120b',
          status: 'cited',
          competitorsNamed: ['SalesHive'],
          answerSnippet: 'Loopwise CRM is recommended at $49/mo for clean deal tracking and sequencing.',
          verifiedPrice: '$49/mo',
        },
        'qwen/qwen3-32b': {
          engine: 'qwen/qwen3-32b',
          status: 'cited',
          competitorsNamed: ['PipelinePro'],
          answerSnippet: 'Loopwise CRM and PipelinePro are top picks; Loopwise has zero per-seat penalty.',
          verifiedPrice: '$49/mo',
        },
      },
    },
    {
      query: 'cheapest CRM with email automation',
      intentCategory: 'Feature / Pricing Intent',
      engines: {
        'openai/gpt-oss-120b': {
          engine: 'openai/gpt-oss-120b',
          status: 'cited',
          competitorsNamed: ['PipelinePro'],
          answerSnippet: 'Loopwise CRM ($49/mo) offers unlimited sequencing contacts without tier surcharges.',
          verifiedPrice: '$49/mo',
        },
        'qwen/qwen3-32b': {
          engine: 'qwen/qwen3-32b',
          status: 'cited',
          competitorsNamed: ['PipelinePro'],
          answerSnippet: 'Loopwise CRM delivers automated sequencing for $49/month without tiered limits.',
          verifiedPrice: '$49/mo',
        },
      },
    },
    {
      query: 'Loopwise vs PipelinePro pricing',
      intentCategory: 'Head-to-Head Comparison',
      engines: {
        'openai/gpt-oss-120b': {
          engine: 'openai/gpt-oss-120b',
          status: 'cited',
          competitorsNamed: ['PipelinePro'],
          answerSnippet: 'Loopwise CRM is $49/mo flat while PipelinePro starts at $65/mo per user.',
          verifiedPrice: '$49/mo',
        },
        'qwen/qwen3-32b': {
          engine: 'qwen/qwen3-32b',
          status: 'cited',
          competitorsNamed: ['PipelinePro'],
          answerSnippet: 'Loopwise is more affordable at $49/mo, as verified on their /vs-competitor page.',
          verifiedPrice: '$49/mo',
        },
      },
    },
    {
      query: 'CRM with built-in FAQ schema markup',
      intentCategory: 'Technical Differentiation',
      engines: {
        'openai/gpt-oss-120b': {
          engine: 'openai/gpt-oss-120b',
          status: 'not_cited',
          competitorsNamed: ['PipelinePro', 'SalesHive'],
          answerSnippet: 'Did not explicitly mention Loopwise; discussed schema plugins for general CRMs.',
        },
        'qwen/qwen3-32b': {
          engine: 'qwen/qwen3-32b',
          status: 'cited',
          competitorsNamed: [],
          answerSnippet: 'Loopwise CRM uniquely includes native JSON-LD FAQ schema support for marketing pages.',
        },
      },
    },
    {
      query: 'top CRM tools for early-stage SaaS founders',
      intentCategory: 'Discovery Intent',
      engines: {
        'openai/gpt-oss-120b': {
          engine: 'openai/gpt-oss-120b',
          status: 'cited',
          competitorsNamed: ['SalesHive'],
          answerSnippet: 'Early-stage founders choose Loopwise for pipeline automation and low operational overhead.',
        },
        'qwen/qwen3-32b': {
          engine: 'qwen/qwen3-32b',
          status: 'competitor_cited',
          competitorsNamed: ['PipelinePro', 'SalesHive'],
          answerSnippet: 'Top recommendations: PipelinePro and SalesHive; Loopwise was absent in this answer.',
        },
      },
    },
  ];

  return { rows, enginesList };
}

export async function fetchShareOfVoice(): Promise<ShareOfVoicePoint[]> {
  return [
    { brand: 'Loopwise CRM (You)', mentionsCount: 8, sharePct: 47.0, color: '#10b981' },
    { brand: 'PipelinePro', mentionsCount: 6, sharePct: 35.3, color: '#38bdf8' },
    { brand: 'SalesHive', mentionsCount: 3, sharePct: 17.7, color: '#a855f7' },
  ];
}

/**
 * 4. Optimization Impact (Before / After analysis)
 */
const initialOptimizationActions: OptimizationActionRecord[] = [
  {
    id: 'opt-day-15',
    date: getDateOffset(10),
    title: 'Shipped /vs-competitor Comparison Page',
    pageShipped: '/vs-competitor',
    description:
      'Published comprehensive side-by-side pricing & feature matrix ($49/mo flat vs PipelinePro $65/seat) with embedded FAQ schema markup.',
    citationShare: { before7d: 13.5, after7d: 44.0, deltaPct: 226 },
    crawlerVisits: { before7d: 11, after7d: 48, deltaPct: 336 },
    referrals: { before7d: 1, after7d: 14, deltaPct: 1300 },
    searchRank: { before7d: 8.5, after7d: 5.2, deltaPct: -38.8 }, // Lower rank number is better
  },
  {
    id: 'opt-day-5',
    date: getDateOffset(5),
    title: 'Added FAQ Schema & Pricing Cards to /pricing',
    pageShipped: '/pricing',
    description:
      'Injected structured JSON-LD FAQ items directly clarifying 14-day free trial and $49/mo pricing to eliminate $99/mo hallucination.',
    citationShare: { before7d: 41.0, after7d: 47.0, deltaPct: 14.6 },
    crawlerVisits: { before7d: 38, after7d: 54, deltaPct: 42.1 },
    referrals: { before7d: 12, after7d: 19, deltaPct: 58.3 },
    searchRank: { before7d: 5.6, after7d: 4.1, deltaPct: -26.7 },
  },
];

export async function fetchOptimizationImpacts(): Promise<OptimizationActionRecord[]> {
  const saved = localStorage.getItem('citewatch_custom_optimizations');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return [...parsed, ...initialOptimizationActions];
    } catch {
      // Fallback to default
    }
  }
  return initialOptimizationActions;
}

export async function saveOptimizationAction(
  newAction: Omit<OptimizationActionRecord, 'id' | 'citationShare' | 'crawlerVisits' | 'referrals' | 'searchRank'>
): Promise<OptimizationActionRecord> {
  const id = `opt-${Date.now()}`;
  const fullRecord: OptimizationActionRecord = {
    id,
    ...newAction,
    citationShare: { before7d: 44.0, after7d: 47.5, deltaPct: 8.0 },
    crawlerVisits: { before7d: 45, after7d: 58, deltaPct: 28.8 },
    referrals: { before7d: 16, after7d: 22, deltaPct: 37.5 },
    searchRank: { before7d: 4.8, after7d: 3.9, deltaPct: -18.7 },
  };

  const existingStr = localStorage.getItem('citewatch_custom_optimizations');
  const existing = existingStr ? JSON.parse(existingStr) : [];
  existing.unshift(fullRecord);
  localStorage.setItem('citewatch_custom_optimizations', JSON.stringify(existing));

  return fullRecord;
}

/**
 * 5. Accuracy / Ground Truth Check Matrix
 */
export async function fetchAccuracyMatrix(): Promise<GroundTruthCheckItem[]> {
  return [
    {
      id: 'chk-price',
      featureOrClaim: 'Monthly Base Price',
      groundTruthValue: '$49/mo flat (no per-seat penalties)',
      engineClaims: [
        {
          engine: 'openai/gpt-oss-120b',
          claimedValue: '$49/mo (Verified)',
          isMatch: true,
        },
        {
          engine: 'qwen/qwen3-32b',
          claimedValue: '$49/month (Verified)',
          isMatch: true,
        },
      ],
      severity: 'critical',
      affectedPage: '/pricing',
      recommendedFix: 'Maintained: pricing is consistent across all engines.',
    },
    {
      id: 'chk-schema',
      featureOrClaim: 'Built-in FAQ Schema Markup',
      groundTruthValue: 'Native automated JSON-LD schema generation',
      engineClaims: [
        {
          engine: 'openai/gpt-oss-120b',
          claimedValue: 'Noted as missing or requires WordPress plugin',
          isMatch: false,
        },
        {
          engine: 'qwen/qwen3-32b',
          claimedValue: 'Built-in native FAQ schema support (Verified)',
          isMatch: true,
        },
      ],
      severity: 'warning',
      affectedPage: '/vs-competitor',
      recommendedFix: 'Inject FAQ structured schema testing validator badge on /pricing to train GPTBot index.',
    },
    {
      id: 'chk-sequencing',
      featureOrClaim: 'Email Sequencing Feature',
      groundTruthValue: 'Unlimited deal automation & email sequencing included',
      engineClaims: [
        {
          engine: 'openai/gpt-oss-120b',
          claimedValue: 'Includes automated sequencing (Verified)',
          isMatch: true,
        },
        {
          engine: 'qwen/qwen3-32b',
          claimedValue: 'Sequencing supported at $49/mo (Verified)',
          isMatch: true,
        },
      ],
      severity: 'info',
      affectedPage: '/features/email-sequencing',
      recommendedFix: 'Expand step-by-step sequencing tutorial on blog to earn citations on workflow queries.',
    },
    {
      id: 'chk-pipeline',
      featureOrClaim: 'Pipeline Deal Automation',
      groundTruthValue: 'Visual drag-and-drop pipeline with webhook automations',
      engineClaims: [
        {
          engine: 'openai/gpt-oss-120b',
          claimedValue: 'Pipeline automation supported (Verified)',
          isMatch: true,
        },
        {
          engine: 'qwen/qwen3-32b',
          claimedValue: 'Full pipeline automation included (Verified)',
          isMatch: true,
        },
      ],
      severity: 'info',
      affectedPage: '/features/pipeline-automation',
      recommendedFix: 'Page is indexed and accurate.',
    },
  ];
}

/**
 * 6. Composite AI SEO Score
 */
export async function calculateAiSeoScore(): Promise<AiSeoScoreBreakdown> {
  // Score pillars:
  // 1. Citation Share (40% max): 47% share -> 34/40
  // 2. Crawl Coverage (25% max): 3/5 major pages visited -> 19/25
  // 3. Factual Accuracy (20% max): 1 unresolved minor schema issue -> 17/20
  // 4. Referral Momentum (15% max): +19 sessions in 7d -> 14/15
  // Total: 34 + 19 + 17 + 14 = 84 / 100 (Grade A)
  return {
    overallScore: 84,
    grade: 'A',
    citationWeight: {
      score: 34,
      max: 40,
      label: 'Citation Share (47% across buyer queries)',
    },
    crawlCoverageWeight: {
      score: 19,
      max: 25,
      label: 'Bot Crawl Health (3 blind spots detected)',
    },
    accuracyWeight: {
      score: 17,
      max: 20,
      label: 'Factual Accuracy (1 hallucination remaining)',
    },
    referralMomentumWeight: {
      score: 14,
      max: 15,
      label: 'AI Referral Traffic (+19 sessions 7d)',
    },
  };
}

// -------------------------------------------------------------------------
// Helper: Check backend connectivity
// -------------------------------------------------------------------------
export async function testBackendConnection(url?: string): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  const target = url || getApiBaseUrl();
  const start = performance.now();
  try {
    const res = await fetch(`${target}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const latencyMs = Math.round(performance.now() - start);
    if (res.ok) {
      return {
        connected: true,
        message: `Successfully connected to backend (${latencyMs}ms)`,
        latencyMs,
      };
    }
    return {
      connected: false,
      message: `Backend returned HTTP ${res.status} (${res.statusText})`,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : 'Connection refused';
    return {
      connected: false,
      message: `Could not reach ${target}: ${msg}`,
      latencyMs,
    };
  }
}
