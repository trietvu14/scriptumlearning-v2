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
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import CurriculumMappingPage from "@/pages/curriculum-mapping";
import BoardReviewPage from "@/pages/board-review";
import StudentProgressPage from "@/pages/student-progress";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
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
      
      <Route path="/">
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
