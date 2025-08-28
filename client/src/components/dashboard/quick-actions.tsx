import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, BarChart3, Settings, ArrowRight } from "lucide-react";

const actions = [
  {
    id: "generate-exam",
    title: "Generate Board Exam",
    icon: Plus,
    variant: "default" as const,
    href: "/board-review/create"
  },
  {
    id: "upload-content",
    title: "Upload Content", 
    icon: Upload,
    variant: "secondary" as const,
    href: "/content/upload"
  },
  {
    id: "view-analytics",
    title: "View Analytics",
    icon: BarChart3,
    variant: "secondary" as const,
    href: "/analytics"
  },
  {
    id: "sync-settings",
    title: "Sync Settings",
    icon: Settings,
    variant: "secondary" as const,
    href: "/settings/sync"
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-between"
              data-testid={`button-${action.id}`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.title}</span>
              </div>
              <ArrowRight className="w-3 h-3" />
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
