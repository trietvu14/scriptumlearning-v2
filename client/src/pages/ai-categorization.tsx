import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  FileText, 
  Settings, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Activity,
  BrainCircuit,
  Target,
  TrendingUp
} from 'lucide-react';

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

export function AICategorizationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  // Get available content for categorization
  const { data: contentList, isLoading: contentLoading } = useQuery({
    queryKey: ['/api/courses/content'],
    enabled: !!user?.tenantId
  });

  // Get categorization jobs
  const { data: jobsData, refetch: refetchJobs } = useQuery({
    queryKey: ['/api/ai/jobs'],
    enabled: !!user?.tenantId,
    refetchInterval: 5000 // Refresh every 5 seconds for job status
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/inbde'] });
    },
    onError: (error: any) => {
      toast({
        title: "INBDE Categorization Failed",
        description: error.details || "Failed to complete INBDE categorization",
        variant: "destructive"
      });
    }
  });

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

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="ai-categorization-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="page-title">
          <BrainCircuit className="w-8 h-8" />
          AI Content Categorization
        </h1>
        <p className="text-muted-foreground mt-2">
          Use AI to automatically categorize content and map it to educational standards
        </p>
      </div>

      <Tabs defaultValue="categorize" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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