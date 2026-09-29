import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { TimelinePage } from './pages/TimelinePage';
import { ProbesPage } from './pages/ProbesPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { CrawlersPage } from './pages/CrawlersPage';
import { ReferralsSearchPage } from './pages/ReferralsSearchPage';
import { VisibilityMatrixPage } from './pages/VisibilityMatrixPage';
import { OptimizationImpactPage } from './pages/OptimizationImpactPage';
import { AccuracyPage } from './pages/AccuracyPage';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Citation Intelligence */}
                <Route index element={<OverviewPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="probes" element={<ProbesPage />} />
                <Route path="chat" element={<ChatPage />} />

                {/* AI SEO Suite */}
                <Route path="crawlers" element={<CrawlersPage />} />
                <Route path="referrals-search" element={<ReferralsSearchPage />} />
                <Route path="visibility-matrix" element={<VisibilityMatrixPage />} />
                <Route path="optimization-impact" element={<OptimizationImpactPage />} />
                <Route path="accuracy" element={<AccuracyPage />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
