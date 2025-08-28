import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FolderSync, Bot } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export report");
  };

  return (
    <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm" data-testid="text-page-description">
            {description}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* AI Status Indicator */}
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            <Bot className="w-3 h-3 mr-1" />
            AI Processing
          </Badge>
          
          {/* FolderSync Status */}
          <div className="flex items-center space-x-2 text-muted-foreground">
            <FolderSync className="w-4 h-4" />
            <span className="text-sm">Last sync: 2 hours ago</span>
          </div>
          
          {/* Export Button */}
          <Button onClick={handleExport} data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}
