import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Building2, Settings, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface OnboardingData {
  // Step 1: Institution Details
  description: string;
  
  // Step 2: LMS Integration
  enableLMSIntegration: boolean;
  lmsType: string;
  lmsApiUrl: string;
  lmsApiKey: string;
  
  // Step 3: Platform Settings
  allowSelfRegistration: boolean;
  defaultStudentRole: string;
  enableNotifications: boolean;
  customBranding: boolean;
}

const STEPS = [
  { id: 1, title: "Institution Setup", icon: Building2 },
  { id: 2, title: "LMS Integration", icon: Settings },
  { id: 3, title: "Platform Settings", icon: Users },
  { id: 4, title: "Complete", icon: CheckCircle }
];

export function OnboardingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    description: "",
    enableLMSIntegration: false,
    lmsType: "canvas",
    lmsApiUrl: "",
    lmsApiKey: "",
    allowSelfRegistration: false,
    defaultStudentRole: "student",
    enableNotifications: true,
    customBranding: false
  });

  // Get tenant info for school admin
  const { data: tenant } = useQuery({
    queryKey: ["/api/tenants", user?.tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/tenants/${user?.tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch tenant");
      return response.json();
    },
    enabled: user?.role === "school_admin" && !!user?.tenantId
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      const response = await fetch(`/api/tenants/${user?.tenantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          settings: {
            description: onboardingData.description,
            enableLMSIntegration: onboardingData.enableLMSIntegration,
            lmsType: onboardingData.lmsType,
            lmsApiUrl: onboardingData.lmsApiUrl,
            lmsApiKey: onboardingData.lmsApiKey,
            allowSelfRegistration: onboardingData.allowSelfRegistration,
            defaultStudentRole: onboardingData.defaultStudentRole,
            enableNotifications: onboardingData.enableNotifications,
            customBranding: onboardingData.customBranding,
            onboardingCompleted: true
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete onboarding");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep(4);
      toast({
        title: "Onboarding Complete!",
        description: "Your institution setup is now complete"
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
      completeOnboardingMutation.mutate(formData);
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
        return true; // Description is optional
      case 2:
        return !formData.enableLMSIntegration || (formData.lmsApiUrl && formData.lmsApiKey);
      case 3:
        return true; // Settings are optional
      default:
        return false;
    }
  };

  if (!["super_admin", "school_admin"].includes(user?.role || "")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Administrative privileges required.</p>
      </div>
    );
  }

  // Super admin needs to select a tenant to onboard
  if (user?.role === "super_admin" && !user?.tenantId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Super Admins can use onboarding to help configure institutions.
          </p>
          <p className="text-sm text-muted-foreground">
            To use onboarding, create a School Admin user for a tenant first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" data-testid="onboarding-page">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
          Complete Institution Setup
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to {tenant?.name}! Complete your institution setup to get started.
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
            {currentStep === 1 && "Add a description and additional details about your institution"}
            {currentStep === 2 && "Configure LMS integration for automatic course and user sync"}
            {currentStep === 3 && "Set up platform preferences and access controls"}
            {currentStep === 4 && "Your institution is ready to use!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Institution Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Institution Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Name:</strong> {tenant?.name}</p>
                  <p><strong>Domain:</strong> {tenant?.domain}</p>
                  <p><strong>Type:</strong> {tenant?.educationalArea?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Institution Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe your institution, its mission, and key programs..."
                  data-testid="input-description"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  This description will be visible to students and faculty in your institution.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: LMS Integration */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableLMSIntegration"
                  checked={formData.enableLMSIntegration}
                  onCheckedChange={(checked) => updateFormData({ enableLMSIntegration: checked })}
                  data-testid="switch-lms-integration"
                />
                <Label htmlFor="enableLMSIntegration">Enable LMS Integration</Label>
              </div>
              
              {formData.enableLMSIntegration && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="lmsType">LMS Platform</Label>
                    <Select
                      value={formData.lmsType}
                      onValueChange={(value) => updateFormData({ lmsType: value })}
                    >
                      <SelectTrigger data-testid="select-lms-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="canvas">Canvas</SelectItem>
                        <SelectItem value="blackboard">Blackboard Learn</SelectItem>
                        <SelectItem value="moodle">Moodle</SelectItem>
                        <SelectItem value="brightspace">Brightspace D2L</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="lmsApiUrl">LMS API URL *</Label>
                    <Input
                      id="lmsApiUrl"
                      value={formData.lmsApiUrl}
                      onChange={(e) => updateFormData({ lmsApiUrl: e.target.value })}
                      placeholder="https://canvas.example.edu/api/v1"
                      data-testid="input-lms-url"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="lmsApiKey">API Key *</Label>
                    <Input
                      id="lmsApiKey"
                      type="password"
                      value={formData.lmsApiKey}
                      onChange={(e) => updateFormData({ lmsApiKey: e.target.value })}
                      placeholder="Enter your LMS API key"
                      data-testid="input-lms-key"
                    />
                  </div>
                </>
              )}
              
              {!formData.enableLMSIntegration && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    You can enable LMS integration later in your institution settings. 
                    Users will need to be invited manually without LMS sync.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Platform Settings */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowSelfRegistration"
                  checked={formData.allowSelfRegistration}
                  onCheckedChange={(checked) => updateFormData({ allowSelfRegistration: checked })}
                  data-testid="switch-self-registration"
                />
                <Label htmlFor="allowSelfRegistration">Allow Self Registration</Label>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="defaultStudentRole">Default Student Role</Label>
                <Select
                  value={formData.defaultStudentRole}
                  onValueChange={(value) => updateFormData({ defaultStudentRole: value })}
                >
                  <SelectTrigger data-testid="select-student-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="fellow">Fellow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableNotifications"
                  checked={formData.enableNotifications}
                  onCheckedChange={(checked) => updateFormData({ enableNotifications: checked })}
                  data-testid="switch-notifications"
                />
                <Label htmlFor="enableNotifications">Enable Email Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="customBranding"
                  checked={formData.customBranding}
                  onCheckedChange={(checked) => updateFormData({ customBranding: checked })}
                  data-testid="switch-branding"
                />
                <Label htmlFor="customBranding">Enable Custom Branding</Label>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">Setup Complete!</h3>
              <p className="text-muted-foreground">
                Your institution has been successfully configured. You can now:
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-1 max-w-md mx-auto">
                <li>• Invite faculty and administrative staff</li>
                <li>• Configure curriculum standards and mapping</li>
                <li>• Set up assessment and board review tools</li>
                <li>• Access your institution dashboard</li>
              </ul>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                data-testid="button-previous"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep) || completeOnboardingMutation.isPending}
                data-testid="button-next"
              >
                {currentStep === 3 ? (
                  completeOnboardingMutation.isPending ? "Completing..." : "Complete Setup"
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}