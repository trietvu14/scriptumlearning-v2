import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Target,
  Activity,
  Brain,
  Sparkles,
  FileText,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  BrainCircuit
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface DashboardConfig {
  title: string;
  description: string;
  charts: Array<{
    id: string;
    type: 'bar' | 'line' | 'pie' | 'metric';
    title: string;
    dataSource: string;
    config: any;
  }>;
  metrics: Array<{
    id: string;
    title: string;
    value: number | string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
  }>;
}

interface AIInsightsSession {
  sessionId: string;
  conversationHistory: ConversationMessage[];
  dashboardConfig?: DashboardConfig;
  generatedAnalytics?: any;
}

interface AICategorizationJob {
  id: string;
  jobType: string;
  status: string;
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    percentage: number;
  };
  createdAt: string;
  completedAt?: string;
}

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  useRAGContext: boolean;
  confidenceThreshold: number;
  standardsFramework: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<AIInsightsSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('conversation');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClientInstance = useQueryClient();
  
  // AI Categorization state
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 2000,
    useRAGContext: true,
    confidenceThreshold: 0.6,
    standardsFramework: []
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.conversationHistory]);

  // Create or resume session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionId?: string) => {
      const response = await apiRequest('POST', '/api/ai-insights/sessions', { sessionId });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setCurrentSession(data.session);
    },
    onError: (error: any) => {
      toast({
        title: "Session Error",
        description: error.response?.data?.error || "Failed to create session",
        variant: "destructive"
      });
    }
  });

  // Send message to AI
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId?: string }) => {
      setIsTyping(true);
      try {
        const response = await apiRequest('POST', '/api/ai-insights/message', { message, sessionId });
        return await response.json();
      } catch (error) {
        setIsTyping(false);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      setCurrentSession({
        sessionId: data.sessionId,
        conversationHistory: data.conversationHistory,
        dashboardConfig: data.dashboardConfig || currentSession?.dashboardConfig,
        generatedAnalytics: data.analytics || currentSession?.generatedAnalytics
      });
      setInputMessage('');
      setIsTyping(false);
      
      // Refresh sessions list to update timestamp
      queryClientInstance.invalidateQueries({ queryKey: ['/api/ai-insights/sessions'] });
    },
    onError: (error: any) => {
      setIsTyping(false);
      const errorMessage = error.response?.data?.error || "AI service temporarily unavailable. Please try again.";
      
      // Add a fallback conversational response
      if (currentSession) {
        const fallbackResponse = `I'm having trouble processing your request right now. This might be due to high demand or a temporary service issue. Please try rephrasing your question or try again in a moment.`;
        
        setCurrentSession({
          ...currentSession,
          conversationHistory: [
            ...currentSession.conversationHistory,
            {
              role: 'user',
              content: inputMessage,
              timestamp: new Date().toISOString()
            },
            {
              role: 'assistant',
              content: fallbackResponse,
              timestamp: new Date().toISOString(),
              metadata: { error: true }
            }
          ]
        });
        setInputMessage('');
      }
      
      toast({
        title: "Message Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Get user sessions
  const { data: sessions } = useQuery({
    queryKey: ['/api/ai-insights/sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/ai-insights/sessions');
      const data = await response.json();
      return data.sessions;
    }
  });

  // Get available content for categorization
  const { data: contentList, isLoading: contentLoading } = useQuery({
    queryKey: ['/api/courses/content'],
    enabled: !!user?.tenantId && activeTab === 'categorize'
  });

  // Get categorization jobs
  const { data: jobsData, refetch: refetchJobs } = useQuery<{ jobs: AICategorizationJob[] }>({
    queryKey: ['/api/ai/jobs'],
    enabled: !!user?.tenantId && activeTab === 'jobs',
    refetchInterval: activeTab === 'jobs' ? 5000 : undefined // Refresh every 5 seconds only when jobs tab is active
  });

  // Initialize with most recent session or create new one
  useEffect(() => {
    if (!currentSession && !createSessionMutation.isPending && sessions && activeTab === 'conversation') {
      if (sessions.length > 0) {
        // Resume most recent session
        createSessionMutation.mutate(sessions[0].id);
      } else {
        // Create new session
        createSessionMutation.mutate(undefined);
      }
    }
  }, [currentSession, createSessionMutation, sessions, activeTab]);

  // Bulk categorization mutation
  const categorizationMutation = useMutation({
    mutationFn: async (data: { contentIds: string[], settings: AISettings }) => {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Categorization failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Categorization Started",
        description: `AI categorization job started for ${selectedContent.length} items`,
      });
      setSelectedContent([]);
      refetchJobs();
    },
    onError: (error: any) => {
      toast({
        title: "Categorization Failed",
        description: error.details || "Failed to start AI categorization",
        variant: "destructive"
      });
    }
  });

  // INBDE categorization mutation
  const inbdeCategorizationMutation = useMutation({
    mutationFn: async (data: { contentIds: string[], settings: Partial<AISettings> }) => {
      const response = await fetch('/api/ai/categorize-inbde', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'INBDE categorization failed');
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "INBDE Categorization Complete",
        description: `${data.summary?.successful || 0}/${data.summary?.total || 0} items successfully categorized`,
      });
      setSelectedContent([]);
      queryClientInstance.invalidateQueries({ queryKey: ['/api/inbde'] });
    },
    onError: (error: any) => {
      toast({
        title: "INBDE Categorization Failed",
        description: error.details || "Failed to complete INBDE categorization",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        message: inputMessage,
        sessionId: currentSession?.sessionId
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartCategorization = () => {
    if (selectedContent.length === 0) {
      toast({
        title: "No Content Selected",
        description: "Please select content to categorize",
        variant: "destructive"
      });
      return;
    }

    categorizationMutation.mutate({
      contentIds: selectedContent,
      settings: aiSettings
    });
  };

  const handleStartINBDECategorization = () => {
    if (selectedContent.length === 0) {
      toast({
        title: "No Content Selected",
        description: "Please select content for INBDE categorization",
        variant: "destructive"
      });
      return;
    }

    inbdeCategorizationMutation.mutate({
      contentIds: selectedContent,
      settings: {
        model: aiSettings.model,
        temperature: 0.2, // Lower temperature for INBDE
        maxTokens: 1500,
        confidenceThreshold: aiSettings.confidenceThreshold
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Activity className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderChart = (chart: any) => {
    const { type, title, config } = chart;

    switch (type) {
      case 'bar':
        return (
          <Card key={chart.id} className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={config.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={config.xAxis} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={config.yAxis} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'pie':
        return (
          <Card key={chart.id} className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={config.data || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(config.data || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'line':
        return (
          <Card key={chart.id} className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={config.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={config.xAxis} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey={config.yAxis} stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'metric':
        return (
          <Card key={chart.id} className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {config.icon && <config.icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{config.value}</div>
              {config.trend && (
                <p className="text-xs text-muted-foreground">
                  <span className={`inline-flex items-center ${
                    config.trend === 'up' ? 'text-green-600' : 
                    config.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {config.trendValue}% from last month
                  </span>
                </p>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderDashboard = () => {
    if (!currentSession?.dashboardConfig) return null;

    const { title, description, charts, metrics } = currentSession.dashboardConfig;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        {/* Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  {metric.trend && (
                    <p className="text-xs text-muted-foreground">
                      <span className={`inline-flex items-center ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {metric.trendValue}% from last month
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts */}
        {charts && charts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {charts.map(renderChart)}
          </div>
        )}
      </div>
    );
  };

  if (contentLoading && activeTab === 'categorize') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="ai-insights-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="page-title">
          <BrainCircuit className="w-8 h-8" />
          AI Insights & Categorization
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered analytics, content categorization, and conversational insights for your institutional data
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversation" data-testid="tab-conversation">
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Conversation
          </TabsTrigger>
          <TabsTrigger value="categorize" data-testid="tab-categorize">
            <Bot className="w-4 h-4 mr-2" />
            Categorize Content
          </TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">
            <Activity className="w-4 h-4 mr-2" />
            Processing Jobs
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="w-4 h-4 mr-2" />
            AI Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chat Interface */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    AI Conversation
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your data and get intelligent analytics
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {currentSession?.conversationHistory.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Start a conversation to get AI-powered insights!</p>
                          <p className="text-sm mt-2">Try asking: "Show me student performance metrics" or "Generate a curriculum mapping dashboard"</p>
                        </div>
                      )}
                      
                      {currentSession?.conversationHistory.map((message, index) => (
                        <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === 'user' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {message.role === 'user' ? 
                                <User className="h-4 w-4 text-blue-600" /> : 
                                <Bot className="h-4 w-4 text-green-600" />
                              }
                            </div>
                            <div className={`rounded-lg p-3 ${
                              message.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {message.metadata?.dashboardConfig && (
                                <Badge variant="secondary" className="mt-2">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Dashboard Generated
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about your data: 'Show me student performance trends' or 'Create a curriculum dashboard'"
                      className="flex-1"
                      disabled={sendMessageMutation.isPending}
                      data-testid="input-ai-message"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                      size="icon"
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session History & Quick Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Show me student performance dashboard",
                    "Generate curriculum mapping analysis",
                    "Display content categorization stats",
                    "Create standards compliance report",
                    "Analyze exam performance trends"
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left text-xs"
                      onClick={() => setInputMessage(suggestion)}
                      data-testid={`button-suggestion-${index}`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm">Session Management</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createSessionMutation.mutate(undefined)}
                      disabled={createSessionMutation.isPending}
                      data-testid="button-new-session"
                    >
                      New Session
                    </Button>
                    {currentSession && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          try {
                            await apiRequest('DELETE', `/api/ai-insights/sessions/${currentSession.sessionId}`);
                            setCurrentSession(null);
                            queryClientInstance.invalidateQueries({ queryKey: ['/api/ai-insights/sessions'] });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to end session",
                              variant: "destructive"
                            });
                          }
                        }}
                        data-testid="button-end-session"
                      >
                        End Session
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {currentSession && (
                    <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                      <div className="font-medium">Active Session</div>
                      <div className="text-muted-foreground">
                        {currentSession.conversationHistory.length} messages
                      </div>
                    </div>
                  )}
                  
                  <ScrollArea className="h-[200px]">
                    {sessions ? (
                      <div className="space-y-2">
                        {sessions.map((session: any) => (
                          <Button
                            key={session.id}
                            variant={currentSession?.sessionId === session.id ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => createSessionMutation.mutate(session.id)}
                            disabled={createSessionMutation.isPending}
                            data-testid={`button-session-${session.id}`}
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-xs font-medium">{session.title || 'AI Insights Session'}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(session.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Loading sessions...
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Generated Dashboard */}
          {currentSession?.dashboardConfig && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Generated Dashboard
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights based on your conversation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDashboard()}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categorize" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Select Content
                </CardTitle>
                <CardDescription>
                  Choose content items for AI categorization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(contentList) && contentList.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {contentList.map((content: any) => (
                      <label
                        key={content.id}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContent.includes(content.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContent([...selectedContent, content.id]);
                            } else {
                              setSelectedContent(selectedContent.filter(id => id !== content.id));
                            }
                          }}
                          data-testid={`checkbox-content-${content.id}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{content.title}</p>
                          <p className="text-xs text-muted-foreground">{content.type}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No content available</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    {selectedContent.length} items selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const contentArray = Array.isArray(contentList) ? contentList : [];
                      if (selectedContent.length === contentArray.length) {
                        setSelectedContent([]);
                      } else {
                        setSelectedContent(contentArray.map((c: any) => c.id) || []);
                      }
                    }}
                    data-testid="button-select-all"
                  >
                    {Array.isArray(contentList) && selectedContent.length === contentList.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categorization Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Categorization
                </CardTitle>
                <CardDescription>
                  Start AI-powered content categorization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={handleStartCategorization}
                    disabled={selectedContent.length === 0 || categorizationMutation.isPending}
                    className="w-full"
                    data-testid="button-start-categorization"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {categorizationMutation.isPending ? 'Starting...' : 'Start General Categorization'}
                  </Button>

                  <Button
                    onClick={handleStartINBDECategorization}
                    disabled={selectedContent.length === 0 || inbdeCategorizationMutation.isPending}
                    variant="outline"
                    className="w-full"
                    data-testid="button-start-inbde-categorization"
                  >
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    {inbdeCategorizationMutation.isPending ? 'Processing...' : 'INBDE Matrix Mapping'}
                  </Button>
                </div>

                <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <p><strong>General Categorization:</strong> Maps content to educational standards with confidence scores</p>
                  <p><strong>INBDE Matrix Mapping:</strong> Specifically maps dental content to Foundation Knowledge × Clinical Content areas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                AI Processing Jobs
              </CardTitle>
              <CardDescription>
                Monitor the status of AI categorization jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsData?.jobs && Array.isArray(jobsData.jobs) && jobsData.jobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(jobsData.jobs as AICategorizationJob[]).map((job: AICategorizationJob) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <Badge className={`${getStatusColor(job.status)} text-white flex items-center gap-1 w-fit`}>
                            {getStatusIcon(job.status)}
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.jobType.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Progress value={job.progress.percentage} className="w-24" />
                            <span className="text-xs text-muted-foreground">
                              {job.progress.processed}/{job.progress.total}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              {job.progress.successful} successful
                            </div>
                            {job.progress.failed > 0 && (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                {job.progress.failed} failed
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No AI categorization jobs yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Start your first categorization to see jobs here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI model settings for content categorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model">AI Model</Label>
                    <Select
                      value={aiSettings.model}
                      onValueChange={(value) => setAiSettings({ ...aiSettings, model: value })}
                    >
                      <SelectTrigger data-testid="select-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast, Cost-effective)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o (Higher Accuracy)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Balanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="confidence">Confidence Threshold: {aiSettings.confidenceThreshold}</Label>
                    <Slider
                      value={[aiSettings.confidenceThreshold]}
                      onValueChange={(value) => setAiSettings({ ...aiSettings, confidenceThreshold: value[0] })}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="mt-2"
                      data-testid="slider-confidence"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only mappings above this confidence level will be saved
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={aiSettings.useRAGContext}
                      onCheckedChange={(checked) => setAiSettings({ ...aiSettings, useRAGContext: checked })}
                      data-testid="switch-rag-context"
                    />
                    <Label>Use institutional training documents</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showAdvancedSettings}
                      onCheckedChange={setShowAdvancedSettings}
                      data-testid="switch-advanced"
                    />
                    <Label>Show advanced settings</Label>
                  </div>

                  {showAdvancedSettings && (
                    <>
                      <div>
                        <Label htmlFor="temperature">Temperature: {aiSettings.temperature}</Label>
                        <Slider
                          value={[aiSettings.temperature]}
                          onValueChange={(value) => setAiSettings({ ...aiSettings, temperature: value[0] })}
                          min={0}
                          max={2}
                          step={0.1}
                          className="mt-2"
                          data-testid="slider-temperature"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Lower values make output more focused and deterministic
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="maxTokens">Max Tokens</Label>
                        <Input
                          type="number"
                          value={aiSettings.maxTokens}
                          onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) || 2000 })}
                          min={100}
                          max={4000}
                          data-testid="input-max-tokens"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "AI configuration has been updated",
                    });
                  }}
                  data-testid="button-save-settings"
                >
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}