import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ title, value, change, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-label`}>
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
              {value}
            </p>
            {change && (
              <p className="text-xs text-accent" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-change`}>
                {change}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
            <Icon className="text-inherit" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
