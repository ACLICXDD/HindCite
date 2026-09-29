/**
 * CiteWatch Frontend TypeScript Type Definitions
 * 
 * Defines all data shapes received from the FastAPI backend and
 * Hindsight Memory Bank, as well as UI presentation types for
 * GEO (Generative Engine Optimization) and AI SEO monitoring.
 */

// -------------------------------------------------------------------------
// Brand Configuration
// -------------------------------------------------------------------------
export interface GroundTruth {
  price: string;
  features: string[];
}

export interface BrandConfig {
  id: string;
  name: string;
  bank_id: string;
  domain: string;
  ground_truth: GroundTruth;
  competitors: string[];
  queries: string[];
}

// -------------------------------------------------------------------------
// Mental Model & Health Report (GET /api/health)
// -------------------------------------------------------------------------
export interface EngineShare {
  engine: string;
  mentioned_pct: number;
}

export interface CrawledPage {
  page: string;
  bot: string;
  visits: number;
  last_seen?: string;
  bot_breakdown?: Record<string, number>;
}

export type HallucinationStatus = 'active' | 'investigating' | 'resolved' | string;
export type SeverityLevel = 'critical' | 'warning' | 'info';

export interface Hallucination {
  claim: string;
  correct_value: string;
  status: HallucinationStatus;
  engine?: string;
  severity?: SeverityLevel;
  date_detected?: string;
  affected_page?: string;
}

export type ActionImpact = 'high' | 'medium' | 'low';

export interface RecommendedAction {
  id?: string;
  action: string;
  rationale: string;
  evidence_quote: string;
  impact?: ActionImpact;
  completed?: boolean;
  category?: 'citation' | 'crawler' | 'accuracy' | 'referral';
  target_url?: string;
}

export interface CitationHealthReport {
  citation_share_pct: number;
  trend_direction: 'up' | 'down' | 'neutral' | string;
  trend_delta_30d_pct: number;
  engines: EngineShare[];
  top_crawled_pages: CrawledPage[];
  ai_referral_sessions_7d: number;
  top_hallucinations: Hallucination[];
  recommended_actions: RecommendedAction[];
}

export interface HealthApiResponse {
  content: string;
  structured: CitationHealthReport | null;
  last_refreshed_at: string | null;
}

// -------------------------------------------------------------------------
// Timeline & Memory Recall (GET /api/timeline)
// -------------------------------------------------------------------------
export type MemoryType = 'observation' | 'experience' | 'world' | string;

export interface TimelineFact {
  id: string;
  text: string;
  type: MemoryType;
  context: string;
  tags: string[];
  occurred_start: string;
  mentioned_at: string;
}

export interface TimelineResponse {
  results: TimelineFact[];
}

export interface TimelineTrendPoint {
  date: string;
  citationShare: number;
  crawls: number;
  referrals: number;
  action?: string;
  milestone?: string;
}

// -------------------------------------------------------------------------
// Live Probing (POST /api/probe)
// -------------------------------------------------------------------------
export interface ProbeAnswer {
  query: string;
  engine: string;
  answer: string;
  cited?: boolean;
  status?: 'cited' | 'absent' | 'hallucinated';
}

export interface ProbeResponse {
  date: string;
  probes_run: number;
  raw_answers: ProbeAnswer[];
}

// -------------------------------------------------------------------------
// Log Ingestion (POST /api/ingest-logs)
// -------------------------------------------------------------------------
export interface IngestLogsResponse {
  date: string;
  digest?: string;
  error?: string;
}

// -------------------------------------------------------------------------
// Conversational Chat (POST /api/chat)
// -------------------------------------------------------------------------
export interface ChatRequest {
  message: string;
}

export interface MemorySource {
  text: string;
  type: string;
  occurred_start: string;
}

export interface ChatResponse {
  text: string;
  sources: MemorySource[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: MemorySource[];
  timestamp: string;
  isLoading?: boolean;
  isError?: boolean;
}

// -------------------------------------------------------------------------
// AI SEO: AI Crawlers & Blind Spots
// -------------------------------------------------------------------------
export interface DailyCrawlerPoint {
  date: string;
  GPTBot: number;
  ClaudeBot: number;
  PerplexityBot: number;
  GoogleExtended: number;
  Others: number;
  total: number;
}

export interface CrawlerBlindSpot {
  page: string;
  importance: 'critical' | 'high' | 'medium';
  lastCrawledDaysAgo: number | null; // null = never visited
  reason: string;
  suggestedFix: string;
  potentialCitationGain: string;
}

// -------------------------------------------------------------------------
// AI SEO: AI Referrals & Search Console
// -------------------------------------------------------------------------
export interface DailyReferralPoint {
  date: string;
  chatgpt: number;
  perplexity: number;
  gemini: number;
  copilot: number;
  totalAiReferrals: number;
  classicSearchClicks: number;
  classicImpressions: number;
  classicAvgRank: number;
}

export interface SearchConsoleQueryRow {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  aiOverlap: boolean;
}

// -------------------------------------------------------------------------
// AI SEO: Query Visibility Matrix & Share of Voice
// -------------------------------------------------------------------------
export type QueryCitationStatus = 'cited' | 'not_cited' | 'competitor_cited';

export interface QueryMatrixCell {
  engine: string;
  status: QueryCitationStatus;
  competitorsNamed: string[];
  answerSnippet: string;
  verifiedPrice?: string;
}

export interface QueryMatrixRow {
  query: string;
  intentCategory: string;
  engines: Record<string, QueryMatrixCell>;
}

export interface ShareOfVoicePoint {
  brand: string;
  mentionsCount: number;
  sharePct: number;
  color: string;
}

// -------------------------------------------------------------------------
// AI SEO: Optimization Impact
// -------------------------------------------------------------------------
export interface OptimizationMetricComparison {
  before7d: number;
  after7d: number;
  deltaPct: number;
}

export interface OptimizationActionRecord {
  id: string;
  date: string;
  title: string;
  pageShipped: string;
  description: string;
  citationShare: OptimizationMetricComparison;
  crawlerVisits: OptimizationMetricComparison;
  referrals: OptimizationMetricComparison;
  searchRank: OptimizationMetricComparison;
}

// -------------------------------------------------------------------------
// AI SEO: Accuracy & Ground Truth Comparison
// -------------------------------------------------------------------------
export interface GroundTruthCheckItem {
  id: string;
  featureOrClaim: string;
  groundTruthValue: string;
  engineClaims: {
    engine: string;
    claimedValue: string;
    isMatch: boolean;
  }[];
  severity: SeverityLevel;
  affectedPage: string;
  recommendedFix: string;
}

// -------------------------------------------------------------------------
// AI SEO: Composite AI SEO Score
// -------------------------------------------------------------------------
export interface AiSeoScoreBreakdown {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  citationWeight: { score: number; max: number; label: string };
  crawlCoverageWeight: { score: number; max: number; label: string };
  accuracyWeight: { score: number; max: number; label: string };
  referralMomentumWeight: { score: number; max: number; label: string };
}

// -------------------------------------------------------------------------
// UI Application State
// -------------------------------------------------------------------------
export type ThemeMode = 'dark' | 'light' | 'system';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
