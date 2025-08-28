import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/use-tenant";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Map, 
  ClipboardCheck,
  Award,
  University,
  Settings,
  BarChart3,
  Bot
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { tenant } = useTenant();
  const [location] = useLocation();

  const navigation = [
    {
      name: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Course Content", href: "/content", icon: BookOpen },
        { name: "Curriculum Mapping", href: "/mapping", icon: Map },
        { name: "Board Review", href: "/board-review", icon: ClipboardCheck }
      ]
    },
    {
      name: "Standards",
      items: [
        { name: "USMLE Mapping", href: "/standards/usmle", icon: Award },
        { name: "LCME Standards", href: "/standards/lcme", icon: University },
        { name: "Internal Standards", href: "/standards/internal", icon: Settings }
      ]
    },
    {
      name: "Analytics",
      items: [
        { name: "Student Progress", href: "/progress", icon: BarChart3 },
        { name: "AI Insights", href: "/ai-insights", icon: Bot }
      ]
    }
  ];

  return (
    <aside className={cn("w-64 border-r border-border", className)} style={{ backgroundColor: '#eeeeee' }}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Scriptum Learning</h1>
            <p className="text-xs text-muted-foreground" data-testid="text-tenant-name">
              {tenant?.name || "Loading..."}
            </p>
          </div>
        </div>
      </div>


      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((section) => (
          <div key={section.name} className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {section.name}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                        data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.name}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

    </aside>
  );
}
