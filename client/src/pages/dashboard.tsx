import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StandardsMapping } from "@/components/dashboard/standards-mapping";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { IntegrationStatus } from "@/components/dashboard/integration-status";
import { api } from "@/lib/api";
import { Users, Map, Trophy, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats()
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header 
          title="Faculty Dashboard" 
          description="Overview of your curriculum mapping and student progress" 
        />
        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Faculty Dashboard" 
        description="Overview of your curriculum mapping and student progress" 
      />
      
      <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            change="↑ 8.2% from last term"
            icon={Users}
            iconColor="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Content Mapped"
            value={stats?.contentMapped || 0}
            change="↑ 23.1% this month"
            icon={Map}
            iconColor="bg-chart-2/10 text-chart-2"
          />
          <StatsCard
            title="Board Readiness"
            value={`${stats?.boardReadiness || 0}%`}
            change="Average score"
            icon={Trophy}
            iconColor="bg-chart-3/10 text-chart-3"
          />
          <StatsCard
            title="AI Insights"
            value={stats?.aiInsights || 0}
            change="New recommendations"
            icon={Bot}
            iconColor="bg-chart-4/10 text-chart-4"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Curriculum Mapping Overview */}
          <div className="lg:col-span-2">
            <StandardsMapping />
          </div>

          {/* Student Progress & Quick Actions */}
          <div className="space-y-6">
            <RecentActivity />
            <QuickActions />
            <IntegrationStatus />
          </div>
        </div>

        {/* Detailed Analytics Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Performance Trends */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Student Performance Trends</h3>
                <select className="px-3 py-1 bg-muted border border-border rounded-md text-sm">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Semester</option>
                </select>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-72 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
                  <p className="text-muted-foreground text-sm">Performance trend visualization</p>
                  <p className="text-xs text-muted-foreground">Shows student progress over time</p>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Board Exam Scores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Curriculum Mastery</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Gap Analysis */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Content Gap Analysis</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">High Priority Gaps</h4>
                    <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                      3 found
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cardiac pharmacology (USMLE Step 1)</li>
                    <li>• ECG interpretation basics</li>
                    <li>• Heart failure pathophysiology</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-chart-3/5 border border-chart-3/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">Medium Priority Gaps</h4>
                    <span className="text-xs bg-chart-3 text-white px-2 py-1 rounded-full">
                      7 found
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Congenital heart defects</li>
                    <li>• Cardiac catheterization procedures</li>
                    <li>• + 5 more topics</li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">AI Suggestion</span>
                  </div>
                  <button className="text-xs text-accent hover:text-accent/80" data-testid="button-auto-fill-gaps">
                    Auto-fill gaps →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
