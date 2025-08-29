import { useState } from "react";
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
import { Plus, Mail, Users, UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "wouter";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiresAt: string;
  isAccepted: boolean;
  createdAt: string;
}

export function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "student"
  });

  // Get tenantId from URL parameters if present
  const urlParams = new URLSearchParams(search);
  const selectedTenantId = urlParams.get('tenantId');

  // Fetch users
  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: ["super_admin", "school_admin"].includes(user?.role || "")
  });

  // Filter users by tenant if tenantId is provided
  const users = selectedTenantId 
    ? allUsers?.filter(u => u.tenantId === selectedTenantId)
    : allUsers;

  // Fetch invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery<Invitation[]>({
    queryKey: ["/api/invitations"],
    enabled: ["super_admin", "school_admin"].includes(user?.role || "")
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: typeof newInvitation & { tenantId: string }) => {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(invitationData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invitation");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      setIsInviteDialogOpen(false);
      setNewInvitation({ email: "", firstName: "", lastName: "", role: "student" });
      toast({
        title: "Success",
        description: "Invitation sent successfully"
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

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete invitation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      toast({
        title: "Success",
        description: "Invitation deleted successfully"
      });
    }
  });

  // Update user status mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully"
      });
    }
  });

  const handleSendInvitation = () => {
    if (!newInvitation.email || !newInvitation.firstName || !newInvitation.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    createInvitationMutation.mutate({
      ...newInvitation,
      tenantId: user?.tenantId || ""
    });
  };

  const toggleUserStatus = (userToUpdate: User) => {
    updateUserMutation.mutate({
      id: userToUpdate.id,
      updates: { isActive: !userToUpdate.isActive }
    });
  };

  const deleteInvitation = (invitationId: string) => {
    if (confirm("Are you sure you want to delete this invitation?")) {
      deleteInvitationMutation.mutate(invitationId);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin": return "default";
      case "school_admin": return "secondary";
      case "faculty": return "outline";
      default: return "outline";
    }
  };

  if (!["super_admin", "school_admin"].includes(user?.role || "")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Administrative privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="users-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
            User Management {selectedTenantId && '(Filtered by Tenant)'}
          </h1>
          <p className="text-muted-foreground">
            {selectedTenantId 
              ? `Showing users for selected institution (${users?.length || 0} users)`
              : 'Manage users and send invitations'
            }
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-invite-user">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-invite-user">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to join your institution
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  data-testid="input-invitation-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newInvitation.firstName}
                    onChange={(e) => setNewInvitation(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    data-testid="input-invitation-firstname"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newInvitation.lastName}
                    onChange={(e) => setNewInvitation(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                    data-testid="input-invitation-lastname"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newInvitation.role} 
                  onValueChange={(value) => setNewInvitation(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger data-testid="select-invitation-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="administrative_support">Administrative Support</SelectItem>
                    {user?.role === "super_admin" && (
                      <SelectItem value="school_admin">School Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsInviteDialogOpen(false)}
                data-testid="button-cancel-invite"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvitation}
                disabled={createInvitationMutation.isPending}
                data-testid="button-send-invite"
              >
                {createInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Users ({users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            <Mail className="h-4 w-4 mr-2" />
            Pending Invitations ({invitations?.filter(inv => !inv.isAccepted).length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {usersLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading users...</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>
                  Manage existing users in your institution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead data-testid="header-name">Name</TableHead>
                      <TableHead data-testid="header-email">Email</TableHead>
                      <TableHead data-testid="header-role">Role</TableHead>
                      <TableHead data-testid="header-status">Status</TableHead>
                      <TableHead data-testid="header-joined">Joined</TableHead>
                      <TableHead data-testid="header-actions">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell data-testid={`text-name-${user.id}`}>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </TableCell>
                        <TableCell data-testid={`text-email-${user.id}`}>
                          {user.email}
                        </TableCell>
                        <TableCell data-testid={`text-role-${user.id}`}>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`status-${user.id}`}>
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-joined-${user.id}`}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleUserStatus(user)}
                            data-testid={`button-toggle-${user.id}`}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {invitationsLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading invitations...</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Manage outstanding invitations to join your institution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead data-testid="header-recipient">Recipient</TableHead>
                      <TableHead data-testid="header-role">Role</TableHead>
                      <TableHead data-testid="header-status">Status</TableHead>
                      <TableHead data-testid="header-expires">Expires</TableHead>
                      <TableHead data-testid="header-sent">Sent</TableHead>
                      <TableHead data-testid="header-actions">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations?.map((invitation) => (
                      <TableRow key={invitation.id} data-testid={`row-invitation-${invitation.id}`}>
                        <TableCell data-testid={`text-recipient-${invitation.id}`}>
                          <div className="font-medium">{invitation.firstName} {invitation.lastName}</div>
                          <div className="text-sm text-muted-foreground">{invitation.email}</div>
                        </TableCell>
                        <TableCell data-testid={`text-role-${invitation.id}`}>
                          <Badge variant={getRoleBadgeVariant(invitation.role)}>
                            {invitation.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`status-${invitation.id}`}>
                          <Badge variant={invitation.isAccepted ? "default" : "secondary"}>
                            {invitation.isAccepted ? "Accepted" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-expires-${invitation.id}`}>
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell data-testid={`text-sent-${invitation.id}`}>
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {!invitation.isAccepted && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteInvitation(invitation.id)}
                              disabled={deleteInvitationMutation.isPending}
                              data-testid={`button-delete-${invitation.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}