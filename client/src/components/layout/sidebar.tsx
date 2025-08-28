import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Bot,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
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
    <aside className={cn("w-64 bg-card border-r border-border", className)}>
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

      {/* User Context */}
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm" data-testid="text-user-initials">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm text-foreground" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
            <Badge variant="secondary" className="mt-1">
              Active Session
            </Badge>
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

      {/* User Menu at bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
          data-testid="button-logout"
        >
          <User className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
