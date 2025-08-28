import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, HelpCircle, Users } from "lucide-react";

const integrations = [
  {
    id: "canvas",
    name: "Canvas LMS",
    icon: GraduationCap,
    iconColor: "bg-primary/10 text-primary",
    status: "connected"
  },
  {
    id: "examsoft",
    name: "ExamSoft",
    icon: HelpCircle,
    iconColor: "bg-chart-2/10 text-chart-2", 
    status: "connected"
  },
  {
    id: "blackbaud",
    name: "Blackbaud SIS",
    icon: Users,
    iconColor: "bg-chart-3/10 text-chart-3",
    status: "disconnected"
  }
];

export function IntegrationStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = integration.status === "connected";
          
          return (
            <div key={integration.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${integration.iconColor} rounded flex items-center justify-center`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-sm font-medium text-foreground" data-testid={`text-${integration.id}-name`}>
                  {integration.name}
                </span>
              </div>
              
              <Badge
                variant={isConnected ? "default" : "destructive"}
                className="flex items-center space-x-1"
                data-testid={`badge-${integration.id}-status`}
              >
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-destructive'}`} />
                <span className="text-xs capitalize">{integration.status}</span>
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
