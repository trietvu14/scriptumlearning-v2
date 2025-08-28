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
import { Plus, Settings, Users, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Tenant {
  id: string;
  name: string;
  domain: string;
  educationalArea: string;
  isActive: boolean;
  createdAt: string;
}

export function TenantsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    domain: "",
    educationalArea: "medical_school"
  });

  // Fetch tenants
  const { data: tenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: user?.role === "super_admin"
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: typeof newTenant) => {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(tenantData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tenant");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      setIsCreateDialogOpen(false);
      setNewTenant({ name: "", domain: "", educationalArea: "medical_school" });
      toast({
        title: "Success",
        description: "Tenant created successfully"
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

  // Update tenant status mutation
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tenant> }) => {
      const response = await fetch(`/api/tenants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update tenant");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({
        title: "Success",
        description: "Tenant updated successfully"
      });
    }
  });

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.domain) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createTenantMutation.mutate(newTenant);
  };

  const toggleTenantStatus = (tenant: Tenant) => {
    updateTenantMutation.mutate({
      id: tenant.id,
      updates: { isActive: !tenant.isActive }
    });
  };

  if (user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Super admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tenants-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Tenants</h1>
          <p className="text-muted-foreground">Manage educational institutions and organizations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-tenant">
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-tenant">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new educational institution to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Johns Hopkins School of Medicine"
                  data-testid="input-tenant-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  value={newTenant.domain}
                  onChange={(e) => setNewTenant(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="johnshopkins.edu"
                  data-testid="input-tenant-domain"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="educationalArea">Educational Area</Label>
                <Select 
                  value={newTenant.educationalArea} 
                  onValueChange={(value) => setNewTenant(prev => ({ ...prev, educationalArea: value }))}
                >
                  <SelectTrigger data-testid="select-educational-area">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_school">Medical School</SelectItem>
                    <SelectItem value="dental_school">Dental School</SelectItem>
                    <SelectItem value="nursing_school">Nursing School</SelectItem>
                    <SelectItem value="physical_therapy_school">Physical Therapy School</SelectItem>
                    <SelectItem value="law_school">Law School</SelectItem>
                    <SelectItem value="engineering_school">Engineering School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTenant}
                disabled={createTenantMutation.isPending}
                data-testid="button-confirm-create"
              >
                {createTenantMutation.isPending ? "Creating..." : "Create Tenant"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading tenants...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Tenants
            </CardTitle>
            <CardDescription>
              {tenants?.length || 0} educational institutions registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-name">Name</TableHead>
                  <TableHead data-testid="header-domain">Domain</TableHead>
                  <TableHead data-testid="header-type">Type</TableHead>
                  <TableHead data-testid="header-status">Status</TableHead>
                  <TableHead data-testid="header-created">Created</TableHead>
                  <TableHead data-testid="header-actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants?.map((tenant) => (
                  <TableRow key={tenant.id} data-testid={`row-tenant-${tenant.id}`}>
                    <TableCell data-testid={`text-name-${tenant.id}`}>
                      <div className="font-medium">{tenant.name}</div>
                    </TableCell>
                    <TableCell data-testid={`text-domain-${tenant.id}`}>
                      {tenant.domain}
                    </TableCell>
                    <TableCell data-testid={`text-type-${tenant.id}`}>
                      <Badge variant="outline">
                        {tenant.educationalArea.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`status-${tenant.id}`}>
                      <Badge 
                        variant={tenant.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleTenantStatus(tenant)}
                      >
                        {tenant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-created-${tenant.id}`}>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" data-testid={`button-users-${tenant.id}`}>
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-settings-${tenant.id}`}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}