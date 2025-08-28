import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Building2, Users, Settings, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface OnboardingData {
  // Step 1: Institution Details
  institutionName: string;
  domain: string;
  educationalArea: string;
  description: string;
  
  // Step 2: Admin User
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  
  // Step 3: Initial Settings
  allowSelfRegistration: boolean;
  defaultStudentRole: string;
  enableLMSIntegration: boolean;
}

const STEPS = [
  { id: 1, title: "Institution Details", icon: Building2 },
  { id: 2, title: "Admin Account", icon: Users },
  { id: 3, title: "Configuration", icon: Settings },
  { id: 4, title: "Complete", icon: CheckCircle }
];

export function OnboardingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    institutionName: "",
    domain: "",
    educationalArea: "medical_school",
    description: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    allowSelfRegistration: false,
    defaultStudentRole: "student",
    enableLMSIntegration: true
  });

  // Tenant creation mutation
  const createTenantMutation = useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      // First create the tenant
      const tenantResponse = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          name: onboardingData.institutionName,
          domain: onboardingData.domain,
          educationalArea: onboardingData.educationalArea,
          settings: {
            description: onboardingData.description,
            allowSelfRegistration: onboardingData.allowSelfRegistration,
            defaultStudentRole: onboardingData.defaultStudentRole,
            enableLMSIntegration: onboardingData.enableLMSIntegration
          }
        })
      });
      
      if (!tenantResponse.ok) {
        const error = await tenantResponse.json();
        throw new Error(error.error || "Failed to create institution");
      }
      
      const tenant = await tenantResponse.json();
      
      // Then create the admin user
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          tenantId: tenant.id,
          email: onboardingData.adminEmail,
          username: onboardingData.adminEmail,
          password: onboardingData.adminPassword,
          firstName: onboardingData.adminFirstName,
          lastName: onboardingData.adminLastName,
          role: "school_admin",
          isActive: true
        })
      });
      
      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.error || "Failed to create admin user");
      }
      
      return { tenant, admin: await userResponse.json() };
    },
    onSuccess: () => {
      setCurrentStep(4);
      toast({
        title: "Success!",
        description: "Institution has been set up successfully"
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

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Submit the onboarding form
      createTenantMutation.mutate(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.institutionName && formData.domain && formData.educationalArea;
      case 2:
        return formData.adminFirstName && formData.adminLastName && formData.adminEmail && formData.adminPassword;
      case 3:
        return true; // Configuration is optional
      default:
        return false;
    }
  };

  if (user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Super admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" data-testid="onboarding-page">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
          Institution Setup
        </h1>
        <p className="text-muted-foreground mt-2">
          Set up a new educational institution on the Scriptum Learning platform
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <Progress value={(currentStep / 4) * 100} className="mb-4" data-testid="progress-bar" />
        <div className="flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`step-${step.id}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                    currentStep >= step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {STEPS[currentStep - 1]?.title}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter basic information about your educational institution"}
            {currentStep === 2 && "Create the primary administrator account"}
            {currentStep === 3 && "Configure initial platform settings"}
            {currentStep === 4 && "Your institution is ready to use!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Institution Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="institutionName">Institution Name *</Label>
                <Input
                  id="institutionName"
                  value={formData.institutionName}
                  onChange={(e) => updateFormData({ institutionName: e.target.value })}
                  placeholder="Johns Hopkins School of Medicine"
                  data-testid="input-institution-name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => updateFormData({ domain: e.target.value })}
                  placeholder="johnshopkins.edu"
                  data-testid="input-domain"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="educationalArea">Educational Area *</Label>
                <Select
                  value={formData.educationalArea}
                  onValueChange={(value) => updateFormData({ educationalArea: value })}
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
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Brief description of your institution..."
                  data-testid="input-description"
                />
              </div>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adminFirstName">First Name *</Label>
                  <Input
                    id="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={(e) => updateFormData({ adminFirstName: e.target.value })}
                    placeholder="John"
                    data-testid="input-admin-firstname"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminLastName">Last Name *</Label>
                  <Input
                    id="adminLastName"
                    value={formData.adminLastName}
                    onChange={(e) => updateFormData({ adminLastName: e.target.value })}
                    placeholder="Doe"
                    data-testid="input-admin-lastname"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="adminEmail">Email Address *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => updateFormData({ adminEmail: e.target.value })}
                  placeholder="admin@johnshopkins.edu"
                  data-testid="input-admin-email"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="adminPassword">Password *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => updateFormData({ adminPassword: e.target.value })}
                  placeholder="Choose a strong password"
                  data-testid="input-admin-password"
                />
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowSelfRegistration"
                    checked={formData.allowSelfRegistration}
                    onChange={(e) => updateFormData({ allowSelfRegistration: e.target.checked })}
                    data-testid="checkbox-self-registration"
                  />
                  <Label htmlFor="allowSelfRegistration">Allow student self-registration</Label>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="defaultStudentRole">Default Student Role</Label>
                  <Select
                    value={formData.defaultStudentRole}
                    onValueChange={(value) => updateFormData({ defaultStudentRole: value })}
                  >
                    <SelectTrigger data-testid="select-default-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableLMSIntegration"
                    checked={formData.enableLMSIntegration}
                    onChange={(e) => updateFormData({ enableLMSIntegration: e.target.checked })}
                    data-testid="checkbox-lms-integration"
                  />
                  <Label htmlFor="enableLMSIntegration">Enable LMS integration features</Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" data-testid="success-icon" />
              <h3 className="text-xl font-semibold">Setup Complete!</h3>
              <p className="text-muted-foreground">
                Your institution has been successfully set up. The admin account has been created 
                and users can now be invited to join the platform.
              </p>
              <div className="mt-6">
                <Button data-testid="button-finish">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        
        {currentStep < 4 && (
          <div className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              data-testid="button-previous"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep) || createTenantMutation.isPending}
              data-testid="button-next"
            >
              {currentStep === 3 ? (
                createTenantMutation.isPending ? "Creating..." : "Complete Setup"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}