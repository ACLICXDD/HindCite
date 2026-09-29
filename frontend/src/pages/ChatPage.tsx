import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
  Clock,
  Layers,
  HelpCircle,
  Database,
} from 'lucide-react';
import { sendChatMessage } from '../api';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ChatMessage, MemorySource } from '../types';
import { formatDate } from '../lib/utils';

export const ChatPage: React.FC = () => {
  const { brand } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am your **CiteWatch GEO Analyst**, backed by **Hindsight** memory bank \`${brand.bank_id}\`. 

I have recalled 25 days of crawler logs, Search Console rankings, Groq probe responses, and optimization milestones for **${brand.name}**. 

Ask me anything about your citation trajectory, bot activity, or factual accuracy. Every claim I make is grounded directly in cited memories.`,
      sources: [
        {
          text: 'Memory Bank initialized with mission: Ground every answer in retained probe history and crawler logs.',
          type: 'directive',
          occurred_start: '2026-09-04T00:00:00Z',
        },
      ],
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({
    'welcome-msg': true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestedPrompts = [
    'Why did citation share rise last week?',
    'Which engine gets our pricing wrong?',
    'What pages are AI crawlers hitting most frequently?',
    'What should we optimize next for Perplexity?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMessageId = Math.random().toString(36).substring(2, 9);
    const assistantMessageId = Math.random().toString(36).substring(2, 9);

    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({ message: query.trim() });
      const assistantMsg: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: response.text,
        sources: response.sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      // Auto-expand sources for new message
      setExpandedSources((prev) => ({ ...prev, [assistantMessageId]: true }));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to query Hindsight memory';
      const assistantErrorMsg: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: `Error: ${errorMsg}. Please ensure the backend is running or toggle Mock Mode in Settings.`,
        isError: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSourceExpand = (msgId: string) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-cleared',
        role: 'assistant',
        content: 'Chat session reset. What question can I research in the memory bank?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Ask CiteWatch
            </h1>
            <Badge variant="emerald" size="sm">
              <Database className="h-3 w-3 mr-1" /> Grounded in Hindsight
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Query your 25-day memory bank with natural language. Every claim is cited with source memories.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 pb-3 overflow-x-auto shrink-0 no-scrollbar">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
          Suggested:
        </span>
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/80 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 border border-border/60 text-muted-foreground transition-all shrink-0 text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const hasSources = msg.sources && msg.sources.length > 0;
          const isSourcesOpen = Boolean(expandedSources[msg.id]);

          return (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fade-in ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                {/* Bubble Container */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-sm ml-auto'
                      : msg.isError
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded-tl-sm'
                      : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>

                {/* Collapsible Grounded Sources Section */}
                {!isUser && hasSources && (
                  <div className="rounded-xl border border-border/70 bg-secondary/25 overflow-hidden">
                    <button
                      onClick={() => toggleSourceExpand(msg.id)}
                      className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Grounded Evidence ({msg.sources!.length} cited memories)</span>
                      </div>
                      {isSourcesOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {isSourcesOpen && (
                      <div className="p-3 pt-1 space-y-2 border-t border-border/50 animate-fade-in">
                        {msg.sources!.map((source, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-lg bg-card border border-border/60 text-[11px] space-y-1 shadow-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <Badge
                                variant={
                                  source.type === 'observation'
                                    ? 'emerald'
                                    : source.type === 'experience'
                                    ? 'blue'
                                    : 'purple'
                                }
                                size="sm"
                                className="text-[9px] py-0 px-1.5"
                              >
                                {source.type}
                              </Badge>
                              {source.occurred_start && (
                                <span className="font-mono">
                                  {formatDate(source.occurred_start)}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground italic font-mono leading-relaxed pt-0.5">
                              "{source.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="h-8 w-8 rounded-lg bg-secondary border border-border text-foreground flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-card border border-border text-muted-foreground text-xs flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
              </div>
              <span className="ml-1 text-[11px]">Recalling Hindsight memories...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="pt-2 border-t border-border shrink-0">
        <div className="relative rounded-xl border border-border bg-card shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about citation trends, crawler logs, or hallucinations (e.g. 'Why did citation share rise?')..."
            rows={2}
            className="w-full p-3.5 pr-14 text-xs sm:text-sm bg-transparent border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="absolute right-2.5 bottom-2.5">
            <Button
              variant="primary"
              size="icon"
              disabled={!inputMessage.trim() || isLoading}
              onClick={() => handleSend()}
              className="h-8 w-8 rounded-lg"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-center text-muted-foreground">
          CiteWatch grounds answers strictly in Hindsight bank <code className="text-emerald-400 font-mono">{brand.bank_id}</code>. Press Enter to send, Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
};
