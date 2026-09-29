import React, { useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  FileCode,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { getApiBaseUrl, setApiBaseUrl, testBackendConnection } from '../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { brand, isMock, setMock, showToast } = useApp();
  const { theme, setTheme } = useTheme();

  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected?: boolean;
    message?: string;
    latencyMs?: number;
  } | null>(null);

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    showToast({
      type: 'success',
      title: 'API URL Saved',
      message: `Updated backend target to ${apiUrl}`,
    });
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await testBackendConnection(apiUrl);
      setConnectionStatus(res);
      showToast({
        type: res.connected ? 'success' : 'error',
        title: res.connected ? 'Backend Reachable' : 'Backend Unreachable',
        message: res.message,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection test failed';
      setConnectionStatus({ connected: false, message: msg });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Settings & Connectivity
          </h1>
          <Badge variant="outline" size="sm">
            Configuration
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage backend endpoints, toggle between live FastAPI/Hindsight and the 25-day mock simulation, and review ground-truth parameters.
        </p>
      </div>

      {/* Connectivity & Backend Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-400" />
            <span>Backend API Configuration</span>
          </CardTitle>
          <CardDescription>
            Specify the running FastAPI server endpoint (default: <code className="text-foreground">http://localhost:8000</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1 px-3.5 py-2 rounded-lg text-sm bg-secondary/50 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleSaveApiUrl} className="text-xs">
                Save URL
              </Button>
              <Button
                variant="primary"
                onClick={handleTestConnection}
                isLoading={testingConnection}
                className="text-xs"
              >
                Test Ping
              </Button>
            </div>
          </div>

          {/* Test Status Feedback */}
          {connectionStatus && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
                connectionStatus.connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {connectionStatus.connected ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span>{connectionStatus.message}</span>
              </div>
              {connectionStatus.latencyMs !== undefined && (
                <span className="font-mono text-[11px] opacity-80">
                  {connectionStatus.latencyMs}ms
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mock Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-400" />
              <span>Simulation & Demo Mode</span>
            </CardTitle>
            <Badge variant={isMock ? 'amber' : 'emerald'} size="sm">
              {isMock ? 'Mock Enabled' : 'Live Backend'}
            </Badge>
          </div>
          <CardDescription>
            Switch between real FastAPI / Hindsight API calls and realistic 25-day synthetic demonstration data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-border/80">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Enable 25-Day Realistic Mock Simulation
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                When enabled, CiteWatch simulates the full "Loopwise" arc: early absence and $99/mo hallucination, the Day 15 shipment of <code className="text-emerald-400">/vs-competitor</code>, crawler surge, and citation share rising to 47%. No live API keys required.
              </p>
            </div>
            <button
              onClick={() => setMock(!isMock)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                isMock ? 'bg-amber-500' : 'bg-secondary border-border'
              }`}
              role="switch"
              aria-checked={isMock}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isMock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="h-4 w-4 text-sky-400" />
            <span>Appearance & Theme</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred color theme. Dark mode is optimized for high-contrast analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id as any)}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  theme === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold shadow-sm'
                    : 'border-border bg-card hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                <opt.icon className="h-5 w-5" />
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitored Brand Ground Truth (brand.yaml) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Brand Ground Truth Configuration</span>
            </CardTitle>
            <Badge variant="outline" size="sm">
              brand.yaml
            </Badge>
          </div>
          <CardDescription>
            Ground truth used by Hindsight to detect factual mismatches and hallucinations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-secondary/40 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-1">Target Name & Domain</span>
              <div className="font-semibold text-foreground text-sm">{brand.name}</div>
              <div className="font-mono text-muted-foreground mt-0.5">{brand.domain}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-secondary/40 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-1">Hindsight Memory Bank</span>
              <div className="font-mono font-semibold text-emerald-400 text-sm">{brand.bank_id}</div>
              <div className="text-muted-foreground mt-0.5">Entity tags: citation, sentiment, accuracy</div>
            </div>

            <div className="p-3.5 rounded-lg bg-secondary/40 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-1">Official Ground Truth Price</span>
              <div className="font-bold text-emerald-400 text-base">{brand.ground_truth.price}</div>
              <div className="text-muted-foreground mt-0.5">Catches claims quoting $99/mo or enterprise-only pricing.</div>
            </div>

            <div className="p-3.5 rounded-lg bg-secondary/40 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-1">Tracked Competitors</span>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {brand.competitors.map((c, i) => (
                  <Badge key={i} variant="secondary" size="sm">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-secondary/40 border border-border text-xs">
            <span className="text-muted-foreground block text-[11px] mb-2 font-medium">
              Verified Features (Ground Truth)
            </span>
            <div className="flex flex-wrap gap-2">
              {brand.ground_truth.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border text-foreground font-medium text-xs"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-secondary/40 border border-border text-xs">
            <span className="text-muted-foreground block text-[11px] mb-2 font-medium">
              Monitored Buyer-Intent Queries ({brand.queries.length})
            </span>
            <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
              {brand.queries.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{i + 1}.</span>
                  <span>"{q}"</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
