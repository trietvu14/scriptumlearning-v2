import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
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
  Bot,
  Users,
  Building2,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [location] = useLocation();

  // Build navigation based on user role
  const navigation = [
    {
      name: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Course Content", href: "/content", icon: BookOpen },
        { name: "Curriculum Mapping", href: "/mapping", icon: Map, requiredRoles: ["super_admin", "school_admin", "faculty"] },
        { name: "Board Review", href: "/board-review", icon: ClipboardCheck, requiredRoles: ["super_admin", "school_admin", "faculty"] }
      ]
    },
    {
      name: "Standards",
      items: [
        { name: "Educational Standards", href: "/standards", icon: Award, requiredRoles: ["super_admin", "school_admin", "faculty"] },
        { name: "USMLE Mapping", href: "/standards/usmle", icon: Award, requiredRoles: ["super_admin", "school_admin", "faculty"] },
        { name: "LCME Standards", href: "/standards/lcme", icon: University, requiredRoles: ["super_admin", "school_admin", "faculty"] },
        { name: "Internal Standards", href: "/standards/internal", icon: Settings, requiredRoles: ["super_admin", "school_admin", "faculty"] }
      ]
    },
    {
      name: "Analytics",
      items: [
        { name: "Student Progress", href: "/progress", icon: BarChart3 },
        { name: "AI Insights", href: "/ai-insights", icon: Bot, requiredRoles: ["super_admin", "school_admin", "faculty"] }
      ]
    },
    // Admin section - only for super admin and school admin
    ...(["super_admin", "school_admin"].includes(user?.role || "") ? [{
      name: "Administration",
      items: [
        ...(user?.role === "super_admin" ? [
          { name: "Tenants", href: "/admin/tenants", icon: Building2 },
          { name: "Onboarding", href: "/onboarding", icon: Shield }
        ] : []),
        { name: "User Management", href: "/admin/users", icon: Users }
      ]
    }] : [])
  ].filter(section => section.items.length > 0);

  return (
    <aside className={cn("w-64 border-r border-border", className)} style={{ backgroundColor: '#eeeeee' }}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-tenant-name">
              {tenant?.name || "John Hopkins Medical School"}
            </h1>
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
                // Check if user has required role for this item
                if (item.requiredRoles && !item.requiredRoles.includes(user?.role || "")) {
                  return null;
                }
                
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
