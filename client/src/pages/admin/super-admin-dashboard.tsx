import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Building2, 
  Award, 
  Bell, 
  TrendingUp, 
  Activity, 
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Eye,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  totalStats: {
    totalSchools: number;
    totalUsers: number;
    totalFrameworks: number;
    pendingNotifications: number;
  };
  schoolsByArea: Array<{
    educationalArea: string;
    count: number;
    schools: string[];
  }>;
  usersByRoleAndTenant: Array<{
    tenantId: string;
    tenantName: string;
    educationalArea: string;
    role: string;
    count: number;
  }>;
  allSchools: Array<{
    id: string;
    name: string;
    domain: string;
    educationalArea: string;
    isActive: boolean;
    createdAt: string;
    userCount: number;
    adminCount: number;
    facultyCount: number;
    studentCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    priority: string;
    tenantName: string;
    createdAt: string;
  }>;
}

interface NotificationForm {
  toUserId?: string;
  tenantId?: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  sendEmail: boolean;
  targetRole?: string;
}

const EDUCATIONAL_AREAS = [
  { value: "medical_school", label: "Medical School" },
  { value: "dental_school", label: "Dental School" },
  { value: "nursing_school", label: "Nursing School" },
  { value: "physical_therapy_school", label: "Physical Therapy School" },
  { value: "pharmacy_school", label: "Pharmacy School" },
  { value: "law_school", label: "Law School" }
];

const NOTIFICATION_TYPES = [
  { value: "info", label: "Information" },
  { value: "warning", label: "Warning" },
  { value: "deadline", label: "Deadline" },
  { value: "action_required", label: "Action Required" },
  { value: "system", label: "System Update" }
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

const USER_ROLES = [
  { value: "school_admin", label: "School Administrators" },
  { value: "faculty", label: "Faculty" },
  { value: "admin_support", label: "Administrative Support" },
  { value: "student", label: "Students" }
];

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: "",
    message: "",
    type: "info",
    priority: "normal",
    sendEmail: false
  });

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      return response.json();
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: NotificationForm) => {
      const endpoint = notificationData.tenantId && !notificationData.toUserId 
        ? "/api/notifications/bulk" 
        : "/api/notifications";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(notificationData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send notification");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsNotificationDialogOpen(false);
      setNotificationForm({
        title: "",
        message: "",
        type: "info",
        priority: "normal",
        sendEmail: false
      });
      toast({
        title: "Success",
        description: data.recipientCount 
          ? `Notification sent to ${data.recipientCount} users`
          : "Notification sent successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSendNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    sendNotificationMutation.mutate(notificationForm);
  };

  const getEducationalAreaLabel = (area: string) => {
    return EDUCATIONAL_AREAS.find(ea => ea.value === area)?.label || area;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "deadline": return <Clock className="h-4 w-4 text-red-500" />;
      case "action_required": return <Bell className="h-4 w-4 text-blue-500" />;
      case "system": return <Activity className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "normal": return "bg-blue-500";
      case "low": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  if (user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Super admin privileges required.</p>
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="super-admin-dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform oversight and management</p>
        </div>
        
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-send-notification">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="dialog-send-notification">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Send notifications to specific users or entire institutions
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={notificationForm.type} 
                    onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-notification-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={notificationForm.priority} 
                    onValueChange={(value) => setNotificationForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger data-testid="select-notification-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                  data-testid="input-notification-title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message"
                  rows={4}
                  data-testid="input-notification-message"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="school">Target School (Optional)</Label>
                  <Select 
                    value={notificationForm.tenantId || ""} 
                    onValueChange={(value) => setNotificationForm(prev => ({ 
                      ...prev, 
                      tenantId: value || undefined,
                      toUserId: undefined 
                    }))}
                  >
                    <SelectTrigger data-testid="select-target-school">
                      <SelectValue placeholder="All schools" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All schools</SelectItem>
                      {dashboardData.allSchools.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {notificationForm.tenantId && (
                  <div className="grid gap-2">
                    <Label htmlFor="role">Target Role (Optional)</Label>
                    <Select 
                      value={notificationForm.targetRole || ""} 
                      onValueChange={(value) => setNotificationForm(prev => ({ 
                        ...prev, 
                        targetRole: value || undefined 
                      }))}
                    >
                      <SelectTrigger data-testid="select-target-role">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All roles</SelectItem>
                        {USER_ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendEmail"
                  checked={notificationForm.sendEmail}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, sendEmail: checked }))}
                  data-testid="switch-send-email"
                />
                <Label htmlFor="sendEmail">Send email notification</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsNotificationDialogOpen(false)}
                data-testid="button-cancel-notification"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendNotification}
                disabled={sendNotificationMutation.isPending}
                data-testid="button-confirm-notification"
              >
                {sendNotificationMutation.isPending ? "Sending..." : "Send Notification"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-schools">
              {dashboardData.totalStats.totalSchools}
            </div>
            <p className="text-xs text-muted-foreground">Active institutions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-users">
              {dashboardData.totalStats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standards Frameworks</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-frameworks">
              {dashboardData.totalStats.totalFrameworks}
            </div>
            <p className="text-xs text-muted-foreground">Active frameworks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-pending-notifications">
              {dashboardData.totalStats.pendingNotifications}
            </div>
            <p className="text-xs text-muted-foreground">Unread notifications</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schools">Schools Overview</TabsTrigger>
          <TabsTrigger value="users">User Distribution</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schools" className="space-y-4">
          {/* Schools by Educational Area */}
          <Card>
            <CardHeader>
              <CardTitle>Schools by Educational Area</CardTitle>
              <CardDescription>Distribution of institutions across different educational domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.schoolsByArea.map((area) => (
                  <div key={area.educationalArea} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{getEducationalAreaLabel(area.educationalArea)}</h3>
                    <p className="text-2xl font-bold text-primary">{area.count}</p>
                    <p className="text-sm text-muted-foreground">institutions</p>
                    <div className="mt-2 space-y-1">
                      {area.schools.slice(0, 3).map((school, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {school}</p>
                      ))}
                      {area.schools.length > 3 && (
                        <p className="text-xs text-muted-foreground">+ {area.schools.length - 3} more</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Schools Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Schools</CardTitle>
              <CardDescription>Complete list of institutions using the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Educational Area</TableHead>
                    <TableHead>Total Users</TableHead>
                    <TableHead>Admins</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.allSchools.map((school) => (
                    <TableRow key={school.id} data-testid={`school-row-${school.id}`}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.domain}</TableCell>
                      <TableCell>{getEducationalAreaLabel(school.educationalArea)}</TableCell>
                      <TableCell>{school.userCount}</TableCell>
                      <TableCell>{school.adminCount}</TableCell>
                      <TableCell>{school.facultyCount}</TableCell>
                      <TableCell>{school.studentCount}</TableCell>
                      <TableCell>
                        <Badge variant={school.isActive ? "default" : "secondary"}>
                          {school.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSchool(school.id)}
                          data-testid={`button-view-school-${school.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Role and Institution</CardTitle>
              <CardDescription>Breakdown of user roles across all schools</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>Educational Area</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>User Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.usersByRoleAndTenant.map((userGroup, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{userGroup.tenantName}</TableCell>
                      <TableCell>{getEducationalAreaLabel(userGroup.educationalArea)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {userGroup.role.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{userGroup.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
              <CardDescription>Latest notifications and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded">
                    {getTypeIcon(activity.type)}
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.tenantName || "Platform-wide"} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority)}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}