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
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, Award, Building2, Upload, Eye, Edit, Trash2, ChevronRight, Stethoscope, Heart, Activity, Pill, Scale, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface StandardsFramework {
  id: string;
  name: string;
  description: string;
  educationalArea: string;
  frameworkType: string;
  isOfficial: boolean;
  tenantId?: string;
  version: string;
  isActive: boolean;
  createdAt: string;
}

interface StandardsSubject {
  id: string;
  frameworkId: string;
  name: string;
  description?: string;
  code?: string;
  sortOrder: number;
  isActive: boolean;
}

const EDUCATIONAL_AREAS = [
  { value: "medical_school", label: "Medical School", icon: Stethoscope },
  { value: "dental_school", label: "Dental School", icon: Smile },
  { value: "nursing_school", label: "Nursing School", icon: Heart },
  { value: "physical_therapy_school", label: "Physical Therapy School", icon: Activity },
  { value: "pharmacy_school", label: "Pharmacy School", icon: Pill },
  { value: "law_school", label: "Law School", icon: Scale }
];

const FRAMEWORK_TYPES = [
  { value: "board_exam", label: "Board/Bar Exam" },
  { value: "accreditation", label: "Accreditation" },
  { value: "internal", label: "Internal/Custom" }
];

export function StandardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEducationalArea, setSelectedEducationalArea] = useState<string>("medical_school");
  const [isCreateFrameworkOpen, setIsCreateFrameworkOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<StandardsFramework | null>(null);
  const [newFramework, setNewFramework] = useState({
    name: "",
    description: "",
    educationalArea: "medical_school",
    frameworkType: "internal",
    version: "1.0"
  });

  // Fetch frameworks for selected educational area
  const { data: frameworks, isLoading } = useQuery<StandardsFramework[]>({
    queryKey: ["/api/standards/frameworks", { educationalArea: selectedEducationalArea }],
    queryFn: async () => {
      const response = await fetch(`/api/standards/frameworks?educationalArea=${selectedEducationalArea}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch frameworks");
      return response.json();
    }
  });

  // Fetch detailed framework with hierarchy
  const { data: frameworkDetails } = useQuery({
    queryKey: ["/api/standards/frameworks", selectedFramework?.id],
    queryFn: async () => {
      if (!selectedFramework) return null;
      const response = await fetch(`/api/standards/frameworks/${selectedFramework.id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch framework details");
      return response.json();
    },
    enabled: !!selectedFramework
  });

  // Create framework mutation
  const createFrameworkMutation = useMutation({
    mutationFn: async (frameworkData: typeof newFramework) => {
      const response = await fetch("/api/standards/frameworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(frameworkData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create framework");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standards/frameworks"] });
      setIsCreateFrameworkOpen(false);
      setNewFramework({
        name: "",
        description: "",
        educationalArea: "medical_school",
        frameworkType: "internal",
        version: "1.0"
      });
      toast({
        title: "Success",
        description: "Standards framework created successfully"
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

  const handleCreateFramework = () => {
    if (!newFramework.name || !newFramework.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createFrameworkMutation.mutate(newFramework);
  };

  const getFrameworkTypeLabel = (type: string) => {
    return FRAMEWORK_TYPES.find(ft => ft.value === type)?.label || type;
  };

  const getEducationalAreaLabel = (area: string) => {
    return EDUCATIONAL_AREAS.find(ea => ea.value === area)?.label || area;
  };

  if (!["super_admin", "school_admin", "faculty"].includes(user?.role || "")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Administrative or faculty privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="standards-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Educational Standards</h1>
          <p className="text-muted-foreground">Manage curriculum mapping standards and frameworks</p>
        </div>
        
        {["super_admin", "school_admin"].includes(user?.role || "") && (
          <Dialog open={isCreateFrameworkOpen} onOpenChange={setIsCreateFrameworkOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-framework">
                <Plus className="h-4 w-4 mr-2" />
                Create Framework
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-framework">
              <DialogHeader>
                <DialogTitle>Create New Standards Framework</DialogTitle>
                <DialogDescription>
                  Create a custom standards framework for your institution
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Framework Name *</Label>
                  <Input
                    id="name"
                    value={newFramework.name}
                    onChange={(e) => setNewFramework(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Custom Medical Standards"
                    data-testid="input-framework-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newFramework.description}
                    onChange={(e) => setNewFramework(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and scope of this framework"
                    data-testid="input-framework-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="educationalArea">Educational Area</Label>
                    <Select 
                      value={newFramework.educationalArea} 
                      onValueChange={(value) => setNewFramework(prev => ({ ...prev, educationalArea: value }))}
                    >
                      <SelectTrigger data-testid="select-educational-area">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATIONAL_AREAS.map(area => (
                          <SelectItem key={area.value} value={area.value}>
                            {area.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="frameworkType">Framework Type</Label>
                    <Select 
                      value={newFramework.frameworkType} 
                      onValueChange={(value) => setNewFramework(prev => ({ ...prev, frameworkType: value }))}
                    >
                      <SelectTrigger data-testid="select-framework-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAMEWORK_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={newFramework.version}
                    onChange={(e) => setNewFramework(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                    data-testid="input-framework-version"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateFrameworkOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFramework}
                  disabled={createFrameworkMutation.isPending}
                  data-testid="button-confirm-create"
                >
                  {createFrameworkMutation.isPending ? "Creating..." : "Create Framework"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Educational Area Selection */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Educational Areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {EDUCATIONAL_AREAS.map(area => {
                const IconComponent = area.icon;
                return (
                  <Button
                    key={area.value}
                    variant={selectedEducationalArea === area.value ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedEducationalArea(area.value)}
                    data-testid={`button-area-${area.value}`}
                  >
                    <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                    {area.label}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Middle - Frameworks List */}
        <div className="col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {getEducationalAreaLabel(selectedEducationalArea)} Standards
              </CardTitle>
              <CardDescription>
                {frameworks?.length || 0} frameworks available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p>Loading frameworks...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {frameworks?.map((framework) => (
                    <div
                      key={framework.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFramework?.id === framework.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedFramework(framework)}
                      data-testid={`framework-${framework.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{framework.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getFrameworkTypeLabel(framework.frameworkType)} • v{framework.version}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {framework.isOfficial && (
                            <Badge variant="secondary" className="text-xs">Official</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      {framework.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {framework.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right - Framework Details */}
        <div className="col-span-4">
          {selectedFramework ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedFramework.name}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" data-testid="button-view-framework">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!selectedFramework.isOfficial && ["super_admin", "school_admin"].includes(user?.role || "") && (
                      <>
                        <Button variant="outline" size="sm" data-testid="button-edit-framework">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-delete-framework">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {selectedFramework.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Type</p>
                      <p className="text-muted-foreground">
                        {getFrameworkTypeLabel(selectedFramework.frameworkType)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Version</p>
                      <p className="text-muted-foreground">{selectedFramework.version}</p>
                    </div>
                  </div>

                  {frameworkDetails?.subjects && (
                    <div>
                      <h4 className="font-medium mb-2">Framework Structure</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {frameworkDetails.subjects.map((subject: any) => (
                          <div key={subject.id} className="border rounded p-2">
                            <p className="font-medium text-sm">{subject.name}</p>
                            {subject.code && (
                              <p className="text-xs text-muted-foreground">Code: {subject.code}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {subject.topics?.length || 0} topics
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedFramework.isOfficial && ["super_admin", "school_admin"].includes(user?.role || "") && (
                    <div className="border-t pt-4">
                      <Button className="w-full" data-testid="button-manage-structure">
                        <Building2 className="h-4 w-4 mr-2" />
                        Manage Structure
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a framework to view details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}