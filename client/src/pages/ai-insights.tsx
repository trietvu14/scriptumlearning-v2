import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bot, 
  TrendingUp, 
  Target,
  CheckCircle, 
  AlertCircle, 
  BrainCircuit,
  Activity,
  FileText,
  Zap
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  status: 'new' | 'acknowledged' | 'implemented';
  createdAt: string;
}

interface ContentAnalysisStats {
  totalAnalyzed: number;
  averageConfidence: number;
  standardsMapped: number;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export function AIInsightsPage() {
  const { user } = useAuth();

  // Get AI insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai/insights'],
    enabled: !!user?.tenantId
  });

  // Get content analysis statistics
  const { data: analysisStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/ai/analysis-stats'],
    enabled: !!user?.tenantId
  });

  // Get recent AI jobs for insights
  const { data: recentJobs } = useQuery({
    queryKey: ['/api/ai/jobs'],
    enabled: !!user?.tenantId
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'acknowledged': return 'bg-orange-500';
      case 'implemented': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (insightsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock data for demonstration since the API endpoints don't exist yet
  const mockInsights: AIInsight[] = [
    {
      id: '1',
      type: 'content_gap',
      title: 'Missing Content in Oral Surgery Standards',
      description: 'AI analysis identified 3 educational standards in oral surgery that lack mapped content.',
      confidence: 0.92,
      impact: 'high',
      status: 'new',
      createdAt: '2025-09-02T10:30:00Z'
    },
    {
      id: '2',
      type: 'mapping_suggestion',
      title: 'Improved INBDE Mapping Recommendations',
      description: 'AI suggests remapping 5 content items to better align with Foundation Knowledge areas.',
      confidence: 0.87,
      impact: 'medium',
      status: 'new',
      createdAt: '2025-09-02T09:15:00Z'
    },
    {
      id: '3',
      type: 'quality_improvement',
      title: 'Low Confidence Mappings Detected',
      description: '12 content items have mapping confidence scores below 70%. Review recommended.',
      confidence: 0.78,
      impact: 'medium',
      status: 'acknowledged',
      createdAt: '2025-09-01T16:45:00Z'
    }
  ];

  const mockStats: ContentAnalysisStats = {
    totalAnalyzed: 324,
    averageConfidence: 0.84,
    standardsMapped: 156,
    topCategories: [
      { name: 'Clinical Procedures', count: 89, percentage: 27.5 },
      { name: 'Basic Sciences', count: 67, percentage: 20.7 },
      { name: 'Patient Management', count: 54, percentage: 16.7 },
      { name: 'Diagnosis', count: 43, percentage: 13.3 },
      { name: 'Ethics & Law', count: 32, percentage: 9.9 }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="ai-insights-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="page-title">
          <BrainCircuit className="w-8 h-8" />
          AI Insights & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered recommendations and analytics for curriculum optimization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Analyzed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalAnalyzed}</div>
            <p className="text-xs text-muted-foreground">Total items processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(mockStats.averageConfidence * 100)}%</div>
            <p className="text-xs text-muted-foreground">Mapping accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standards Mapped</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.standardsMapped}</div>
            <p className="text-xs text-muted-foreground">Unique standards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInsights.filter(i => i.status === 'new').length}</div>
            <p className="text-xs text-muted-foreground">New recommendations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" data-testid="tab-insights">
            <Bot className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Content Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="w-4 h-4 mr-2" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                AI-generated insights to improve curriculum mapping and content organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    data-testid={`insight-${insight.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{insight.title}</h3>
                      <div className="flex gap-2">
                        <Badge className={`${getImpactColor(insight.impact)} text-white text-xs`}>
                          {insight.impact} impact
                        </Badge>
                        <Badge className={`${getStatusColor(insight.status)} text-white text-xs`}>
                          {insight.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="w-3 h-3" />
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Content Categories
                </CardTitle>
                <CardDescription>
                  Distribution of content across educational categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStats.topCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-muted-foreground">
                          {category.count} ({category.percentage}%)
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Quality Metrics
                </CardTitle>
                <CardDescription>
                  Content mapping quality and confidence metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>High Confidence ({'>'}80%)</span>
                      <span className="text-green-600 font-medium">234 items</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Medium Confidence (60-80%)</span>
                      <span className="text-yellow-600 font-medium">67 items</span>
                    </div>
                    <Progress value={21} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Low Confidence ({'<'}60%)</span>
                      <span className="text-red-600 font-medium">23 items</span>
                    </div>
                    <Progress value={7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent AI Activity
              </CardTitle>
              <CardDescription>
                Latest AI categorization jobs and processing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs?.jobs && Array.isArray(recentJobs.jobs) && recentJobs.jobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recentJobs.jobs as any[]).slice(0, 5).map((job: any) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <Badge variant="outline">{job.jobType.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${job.status === 'completed' ? 'bg-green-500' : job.status === 'processing' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={job.progress?.percentage || 0} className="w-16" />
                            <span className="text-xs">
                              {job.progress?.processed || 0}/{job.progress?.total || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              {job.progress?.successful || 0} success
                            </div>
                            {(job.progress?.failed || 0) > 0 && (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                {job.progress.failed} failed
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No recent AI activity found</p>
                  <p className="text-sm">Start an AI categorization job to see activity here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}