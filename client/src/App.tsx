import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { TenantProvider } from "@/hooks/use-tenant";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import Homepage from "@/pages/homepage";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import CurriculumMappingPage from "@/pages/curriculum-mapping";
import BoardReviewPage from "@/pages/board-review";
import StudentProgressPage from "@/pages/student-progress";
import NotFound from "@/pages/not-found";
import { TenantsPage } from "@/pages/admin/tenants";
import { UsersPage } from "@/pages/admin/users";
import { TenantSettingsPage } from "@/pages/admin/tenant-settings";
import { OnboardingPage } from "@/pages/onboarding";
import { AcceptInvitationPage } from "@/pages/accept-invitation";
import { StandardsPage } from "@/pages/standards";
import { SuperAdminDashboard } from "@/pages/admin/super-admin-dashboard";
import { ProfilePage } from "@/pages/profile";
import { AICategorizationPage } from "@/pages/ai-categorization";
import AIInsightsPage from "@/pages/ai-insights/index";
import CourseContentPage from "@/pages/course-content";
import DemoRequestPage from "@/pages/demo-request";
import DemoRequestsDashboard from "@/pages/demo-requests-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/accept-invitation" component={AcceptInvitationPage} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <DashboardPage />
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/mapping">
        <ProtectedRoute requiredRole={["super_admin", "school_admin", "faculty"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <CurriculumMappingPage />
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/board-review">
        <ProtectedRoute requiredRole={["super_admin", "school_admin", "faculty"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <BoardReviewPage />
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/progress">
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <StudentProgressPage />
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/tenants">
        <ProtectedRoute requiredRole={["super_admin"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <TenantsPage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute requiredRole={["super_admin", "school_admin"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <UsersPage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/tenants/:tenantId/settings">
        <ProtectedRoute requiredRole={["super_admin"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <TenantSettingsPage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/onboarding">
        <ProtectedRoute requiredRole={["super_admin", "school_admin"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <div className="flex-1 p-6">
                <OnboardingPage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/standards">
        <ProtectedRoute requiredRole={["super_admin", "school_admin", "faculty"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <StandardsPage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/super-admin">
        <ProtectedRoute requiredRole={["super_admin"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <SuperAdminDashboard />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <ProfilePage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/ai-categorization">
        <ProtectedRoute requiredRole={["super_admin", "school_admin", "faculty"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <AICategorizationPage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/ai-insights">
        <ProtectedRoute requiredRole={["super_admin", "school_admin", "faculty"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <AIInsightsPage />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/content">
        <ProtectedRoute requiredRole={["super_admin", "school_admin", "faculty"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <CourseContentPage />
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/demo-requests">
        <ProtectedRoute requiredRole={["super_admin", "school_admin"]}>
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <div className="flex flex-1">
              <Sidebar />
              <div className="flex-1 p-6">
                <DemoRequestsDashboard />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Route>
      
      <Route path="/demo-request" component={DemoRequestPage} />
      <Route path="/" component={Homepage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TenantProvider>
            <Toaster />
            <Router />
          </TenantProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
