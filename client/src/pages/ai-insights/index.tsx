import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  Sparkles
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AIInsightsPage() {
  const [currentSession, setCurrentSession] = useState<AIInsightsSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights/sessions'] });
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

  // Initialize with most recent session or create new one
  useEffect(() => {
    if (!currentSession && !createSessionMutation.isPending && sessions) {
      if (sessions.length > 0) {
        // Resume most recent session
        createSessionMutation.mutate(sessions[0].id);
      } else {
        // Create new session
        createSessionMutation.mutate(undefined);
      }
    }
  }, [currentSession, createSessionMutation, sessions]);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          AI Insights
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-muted-foreground mt-2">
          Conversational AI analytics that generates intelligent dashboards and insights from your institutional data
        </p>
      </div>

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
                        queryClient.invalidateQueries({ queryKey: ['/api/ai-insights/sessions'] });
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
    </div>
  );
}

