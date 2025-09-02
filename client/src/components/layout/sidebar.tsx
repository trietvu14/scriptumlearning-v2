import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Shield,
  Activity,
  User,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [location] = useLocation();
  const [expandedStandardsAreas, setExpandedStandardsAreas] = useState<string[]>([]);

  // Fetch standards frameworks for hierarchical tree
  const { data: standardsFrameworks = [], error, isLoading } = useQuery({
    queryKey: ["/api/standards/frameworks"],
    enabled: ["super_admin", "school_admin", "faculty"].includes(user?.role || "") && !!user
  });
  


  // Group standards by educational area
  const groupedStandards = (standardsFrameworks as any[]).reduce((acc: any, framework: any) => {
    const area = framework.educationalArea;
    if (!acc[area]) {
      acc[area] = {
        official: [],
        custom: []
      };
    }
    
    if (framework.isOfficial) {
      acc[area].official.push(framework);
    } else {
      acc[area].custom.push(framework);
    }
    
    return acc;
  }, {});

  // Educational area labels with alphabetical ordering
  const educationalAreaLabels: { [key: string]: string } = {
    'dental_school': 'Dental School',
    'law_school': 'Law School', 
    'medical_school': 'Medical School',
    'nursing_school': 'Nursing School',
    'pharmacy_school': 'Pharmacy School',
    'physical_therapy_school': 'Physical Therapy School'
  };

  // Get sorted educational areas
  const sortedEducationalAreas = Object.keys(groupedStandards).sort((a, b) => {
    const labelA = educationalAreaLabels[a] || a;
    const labelB = educationalAreaLabels[b] || b;
    return labelA.localeCompare(labelB);
  });

  const toggleStandardsArea = (area: string) => {
    setExpandedStandardsAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

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
        { name: "Educational Standards", href: "/standards", icon: Award, requiredRoles: ["super_admin", "school_admin", "faculty"] }
      ]
    },
    {
      name: "Analytics",
      items: [
        { name: "Student Progress", href: "/progress", icon: BarChart3 },
        { name: "AI Insights", href: "/ai-insights", icon: Bot, requiredRoles: ["super_admin", "school_admin", "faculty"] }
      ]
    },
    {
      name: "AI Tools",
      items: [
        { name: "Content Categorization", href: "/ai-categorization", icon: Bot, requiredRoles: ["super_admin", "school_admin", "faculty"] }
      ]
    },
    {
      name: "Account",
      items: [
        { name: "Profile Settings", href: "/profile", icon: User }
      ]
    },
    // Admin section - only for super admin and school admin
    ...(["super_admin", "school_admin"].includes(user?.role || "") ? [{
      name: "Administration",
      items: [
        ...(user?.role === "super_admin" ? [
          { name: "Super Admin Dashboard", href: "/super-admin", icon: Activity },
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
                
                // Special handling for Educational Standards to show hierarchical tree
                if (item.name === "Educational Standards") {
                  return (
                    <li key={item.name} className="space-y-1">
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
                      
                      {/* Hierarchical Standards Tree */}
                      {Object.keys(groupedStandards).length > 0 && (
                        <div className="ml-4 mt-1 space-y-1">
                          {sortedEducationalAreas.map((area) => {
                            const standards = groupedStandards[area];
                            return (
                            <Collapsible
                              key={area}
                              open={expandedStandardsAreas.includes(area)}
                              onOpenChange={() => toggleStandardsArea(area)}
                            >
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start p-2 h-auto text-xs"
                                >
                                  {expandedStandardsAreas.includes(area) ? (
                                    <ChevronDown className="w-3 h-3 mr-2" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 mr-2" />
                                  )}
                                  <University className="w-3 h-3 mr-2" />
                                  {educationalAreaLabels[area] || area}
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="ml-4 space-y-1">
                                {/* Official Standards */}
                                {standards.official?.map((framework: any) => (
                                  <Link
                                    key={framework.id}
                                    href={`/standards?area=${area}&framework=${framework.id}`}
                                  >
                                    <Button
                                      variant="ghost"
                                      className={cn(
                                        "w-full justify-start p-2 h-auto text-xs",
                                        location.includes(framework.name.toLowerCase().replace(/\s+/g, '-')) && "bg-primary/10"
                                      )}
                                      onClick={() => {
                                        console.log(`Navigating to: /standards?area=${area}&framework=${framework.id}`);
                                        console.log('Framework:', framework.name, 'Area:', area);
                                      }}
                                    >
                                      <Award className="w-3 h-3 mr-2" />
                                      {framework.name}
                                    </Button>
                                  </Link>
                                ))}
                                
                                {/* Custom Standards Section */}
                                {standards.custom?.length > 0 && (
                                  <>
                                    <div className="px-2 py-1">
                                      <p className="text-xs font-medium text-muted-foreground">Custom</p>
                                    </div>
                                    {standards.custom.map((framework: any) => (
                                      <Link
                                        key={framework.id}
                                        href={`/standards?area=${area}&framework=${framework.id}`}
                                      >
                                        <Button
                                          variant="ghost"
                                          className={cn(
                                            "w-full justify-start p-2 h-auto text-xs",
                                            location.includes(framework.name.toLowerCase().replace(/\s+/g, '-')) && "bg-primary/10"
                                          )}
                                        >
                                          <Settings className="w-3 h-3 mr-2" />
                                          {framework.name}
                                        </Button>
                                      </Link>
                                    ))}
                                  </>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
                          );
                          })}
                        </div>
                      )}
                    </li>
                  );
                }
                
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
