import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Camera, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  title?: string;
  department?: string;
  phoneNumber?: string;
  officeLocation?: string;
  bio?: string;
  profileImageUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    domain: string;
    educationalArea: string;
  };
}

// Profile schemas
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  title: z.string().max(100).optional().or(z.literal("")),
  department: z.string().max(100).optional().or(z.literal("")),
  phoneNumber: z.string().max(20).optional().or(z.literal("")),
  officeLocation: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal(""))
});

const superAdminProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address")
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);

  // Determine which schema to use based on user role
  const isSuperAdmin = user?.role === "super_admin";
  const currentSchema = isSuperAdmin ? superAdminProfileSchema : profileSchema;

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    }
  });

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      title: "",
      department: "",
      phoneNumber: "",
      officeLocation: "",
      bio: ""
    }
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        title: profile.title || "",
        department: profile.department || "",
        phoneNumber: profile.phoneNumber || "",
        officeLocation: profile.officeLocation || "",
        bio: profile.bio || ""
      });
    }
  }, [profile, profileForm]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully"
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

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
      toast({
        title: "Success",
        description: "Password changed successfully"
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

  // Deactivate account mutation
  const deactivateAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/profile", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to deactivate account");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account deactivated successfully"
      });
      // Logout user after account deactivation
      window.location.href = "/login";
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onProfileSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: any) => {
    changePasswordMutation.mutate(data);
  };

  const handleDeactivateAccount = () => {
    deactivateAccountMutation.mutate();
    setIsDeactivateDialogOpen(false);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="profile-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </div>
            <CardTitle data-testid="text-profile-name">
              {profile.firstName} {profile.lastName}
            </CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Badge variant="outline" className="capitalize">
                {profile.role.replace("_", " ")}
              </Badge>
            </div>
            
            {!isSuperAdmin && profile.title && (
              <div className="text-center">
                <p className="text-sm font-medium">{profile.title}</p>
                {profile.department && (
                  <p className="text-sm text-muted-foreground">{profile.department}</p>
                )}
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              {profile.tenant && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Institution:</span>
                  <span className="font-medium" data-testid="text-institution-name">{profile.tenant.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since:</span>
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              {profile.lastLoginAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last login:</span>
                  <span>{new Date(profile.lastLoginAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {isSuperAdmin ? "Super Admin Profile" : "Profile Information"}
            </CardTitle>
            <CardDescription>
              {isSuperAdmin 
                ? "Update your basic profile information. Super admin accounts have limited profile options."
                : "Update your profile information and professional details."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!isSuperAdmin && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Associate Professor" data-testid="input-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Internal Medicine" data-testid="input-department" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., (555) 123-4567" data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="officeLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Office Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Building A, Room 205" data-testid="input-office" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Brief description of your professional background and interests..."
                              rows={3}
                              data-testid="input-bio"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">
                Change your account password
              </p>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-change-password">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-change-password">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} data-testid="input-current-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} data-testid="input-new-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} data-testid="input-confirm-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        data-testid="button-confirm-password-change"
                      >
                        {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {!isSuperAdmin && (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-700">Deactivate Account</h4>
                <p className="text-sm text-red-600">
                  Permanently deactivate your account. This action cannot be undone.
                </p>
              </div>
              <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" data-testid="button-deactivate-account">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-deactivate-account">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Deactivate Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to deactivate your account? This will disable your access to the platform and cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <Alert className="border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      This action is permanent. Your account will be deactivated and you will lose access to all platform features.
                    </AlertDescription>
                  </Alert>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeactivateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeactivateAccount}
                      disabled={deactivateAccountMutation.isPending}
                      data-testid="button-confirm-deactivate"
                    >
                      {deactivateAccountMutation.isPending ? "Deactivating..." : "Deactivate Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}