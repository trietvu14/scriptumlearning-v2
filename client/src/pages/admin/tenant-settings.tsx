import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Tenant {
  id: string;
  name: string;
  domain: string;
  educationalArea: string;
  isActive: boolean;
  settings?: any;
  createdAt: string;
}

export function TenantSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const params = useParams<{ tenantId: string }>();
  const tenantId = params.tenantId;

  const [settings, setSettings] = useState({
    name: "",
    domain: "",
    educationalArea: "medical_school",
    isActive: true,
    customSettings: {}
  });

  // Fetch tenant details
  const { data: tenant, isLoading } = useQuery<Tenant>({
    queryKey: ["/api/tenants", tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch tenant");
      return response.json();
    },
    enabled: !!tenantId && user?.role === "super_admin"
  });

  // Update settings when tenant data loads
  useEffect(() => {
    if (tenant) {
      setSettings({
        name: tenant.name,
        domain: tenant.domain,
        educationalArea: tenant.educationalArea,
        isActive: tenant.isActive,
        customSettings: tenant.settings || {}
      });
    }
  }, [tenant]);

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async (updates: Partial<Tenant>) => {
      const response = await fetch(`/api/tenants/${tenantId}`, {
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
        description: "Tenant settings updated successfully"
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

  const handleSave = () => {
    updateTenantMutation.mutate({
      name: settings.name,
      domain: settings.domain,
      educationalArea: settings.educationalArea,
      isActive: settings.isActive,
      settings: settings.customSettings
    });
  };

  if (user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Super Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading tenant settings...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Tenant not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tenant-settings-page">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setLocation("/admin/tenants")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenants
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
            Tenant Settings
          </h1>
          <p className="text-muted-foreground">
            Configure settings for {tenant.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update basic tenant information and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Institution Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-tenant-name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={settings.domain}
                onChange={(e) => setSettings(prev => ({ ...prev, domain: e.target.value }))}
                data-testid="input-tenant-domain"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="educationalArea">Educational Area</Label>
              <Select 
                value={settings.educationalArea} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, educationalArea: value }))}
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

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={settings.isActive}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isActive: checked }))}
                data-testid="switch-tenant-active"
              />
              <Label htmlFor="isActive">Active Status</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/admin/tenants")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateTenantMutation.isPending}
            data-testid="button-save"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateTenantMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}