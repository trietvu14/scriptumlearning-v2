import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, HelpCircle, RefreshCw } from "lucide-react";

const activities = [
  {
    id: "1",
    type: "upload",
    title: "Content Auto-Mapped",
    description: "15 new lecture slides categorized",
    time: "2 hours ago",
    icon: Upload,
    iconColor: "bg-primary/10 text-primary"
  },
  {
    id: "2", 
    type: "exam",
    title: "Board Exam Generated",
    description: "Mock exam for cardiology module",
    time: "5 hours ago",
    icon: HelpCircle,
    iconColor: "bg-chart-2/10 text-chart-2"
  },
  {
    id: "3",
    type: "sync",
    title: "LMS Sync Complete", 
    description: "Canvas integration updated",
    time: "Yesterday",
    icon: RefreshCw,
    iconColor: "bg-chart-3/10 text-chart-3"
  }
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${activity.iconColor} rounded-full flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground" data-testid={`text-activity-${activity.id}-title`}>
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`text-activity-${activity.id}-description`}>
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`text-activity-${activity.id}-time`}>
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
