import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { useTenant } from "@/hooks/use-tenant";
import { INBDEMappingMatrix } from "@/components/curriculum/inbde-mapping-matrix";

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
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedEducationalArea, setSelectedEducationalArea] = useState<string>(tenant?.educationalArea || "dental_school");
  const [isCreateFrameworkOpen, setIsCreateFrameworkOpen] = useState(false);
  const [isEditFrameworkOpen, setIsEditFrameworkOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<StandardsFramework | null>(null);
  const [newFramework, setNewFramework] = useState({
    name: "",
    description: "",
    educationalArea: tenant?.educationalArea || "dental_school",
    frameworkType: "internal",
    version: "1.0"
  });
  
  const [editFramework, setEditFramework] = useState({
    name: "",
    description: "",
    version: "1.0"
  });

  // Update selected area when tenant data loads
  useEffect(() => {
    if (tenant?.educationalArea && tenant.educationalArea !== selectedEducationalArea) {
      setSelectedEducationalArea(tenant.educationalArea);
    }
  }, [tenant]);

  // Parse URL parameters to auto-select area and framework
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const areaParam = urlParams.get('area');
    const frameworkParam = urlParams.get('framework');
    
    console.log('URL parsing - Area:', areaParam, 'Framework:', frameworkParam);
    
    // For non-super admins, ignore area parameter and use their tenant's area
    if (user?.role === 'super_admin' && areaParam && areaParam !== selectedEducationalArea) {
      setSelectedEducationalArea(areaParam);
    }
    
    // Framework selection will happen after frameworks are loaded
    if (frameworkParam) {
      // Always store framework ID to select after frameworks load, even if one is already selected
      sessionStorage.setItem('pendingFrameworkSelection', frameworkParam);
      console.log('Stored pending framework selection:', frameworkParam);
    }
  }, [location, user?.role]);

  // Fetch frameworks (automatically filtered by backend based on user's educational area)
  const { data: frameworks, isLoading } = useQuery<StandardsFramework[]>({
    queryKey: ["/api/standards/frameworks"],
    queryFn: async () => {
      const response = await fetch(`/api/standards/frameworks`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch frameworks");
      return response.json();
    }
  });

  // Auto-select framework when frameworks load and there's a pending selection
  useEffect(() => {
    const pendingFrameworkId = sessionStorage.getItem('pendingFrameworkSelection');
    console.log('Checking pending framework selection:', pendingFrameworkId, 'Frameworks loaded:', frameworks?.length);
    
    if (pendingFrameworkId && frameworks && frameworks.length > 0) {
      const targetFramework = frameworks.find(f => f.id === pendingFrameworkId);
      console.log('Target framework found:', targetFramework?.name);
      
      if (targetFramework) {
        setSelectedFramework(targetFramework);
        sessionStorage.removeItem('pendingFrameworkSelection');
        console.log('Framework auto-selected:', targetFramework.name);
      } else {
        console.warn('Framework not found in available frameworks:', pendingFrameworkId);
        // Remove invalid pending selection
        sessionStorage.removeItem('pendingFrameworkSelection');
      }
    }
  }, [frameworks]);

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
        educationalArea: tenant?.educationalArea || "dental_school",
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

  // Delete framework mutation
  const deleteFrameworkMutation = useMutation({
    mutationFn: async (frameworkId: string) => {
      const response = await fetch(`/api/standards/frameworks/${frameworkId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete framework");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standards/frameworks"] });
      setSelectedFramework(null);
      toast({
        title: "Success",
        description: "Standards framework deleted successfully"
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

  // Update framework mutation
  const updateFrameworkMutation = useMutation({
    mutationFn: async (frameworkData: typeof editFramework & { id: string }) => {
      const response = await fetch(`/api/standards/frameworks/${frameworkData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          name: frameworkData.name,
          description: frameworkData.description,
          version: frameworkData.version
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update framework");
      }
      
      return response.json();
    },
    onSuccess: (updatedFramework) => {
      queryClient.invalidateQueries({ queryKey: ["/api/standards/frameworks"] });
      setIsEditFrameworkOpen(false);
      setSelectedFramework(updatedFramework);
      toast({
        title: "Success",
        description: "Framework updated successfully"
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

  const handleDeleteFramework = (framework: StandardsFramework) => {
    if (window.confirm(`Are you sure you want to delete "${framework.name}"? This action cannot be undone.`)) {
      deleteFrameworkMutation.mutate(framework.id);
    }
  };

  const handleUpdateFramework = () => {
    if (!editFramework.name || !editFramework.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    updateFrameworkMutation.mutate({ ...editFramework, id: selectedFramework!.id });
  };

  // Initialize edit form when framework is selected
  const initializeEditForm = (framework: StandardsFramework) => {
    setEditFramework({
      name: framework.name,
      description: framework.description,
      version: framework.version
    });
  };

  // Recursive function to render hierarchical topic structure
  const renderTopicHierarchy = (topics: any[], level: number) => {
    // Filter topics by level and sort by order
    const currentLevelTopics = topics.filter(t => t.level === level).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    
    return currentLevelTopics.map((topic: any) => {
      const children = topics.filter(t => t.parentId === topic.id);
      const indentClass = level === 1 ? "" : `ml-${Math.min(level * 4, 12)}`;
      const borderClass = level === 1 ? "border-l-2 border-blue-400" : level === 2 ? "border-l-2 border-green-400" : "border-l-2 border-orange-400";
      
      return (
        <div key={topic.id} className={`${indentClass}`}>
          <div className={`p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-md ${borderClass} pl-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {'●'.repeat(level)}
                  </span>
                  <p className="font-medium text-sm">{topic.name}</p>
                  <Badge variant="outline" className="text-xs">
                    Level {topic.level}
                  </Badge>
                </div>
                {topic.code && (
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{topic.code}</p>
                )}
                {topic.description && (
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {topic.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Badge variant="outline" className="text-xs">
                  #{topic.sortOrder}
                </Badge>
                {user?.role && ["super_admin", "school_admin"].includes(user.role) && (
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Render children recursively */}
          {children.length > 0 && (
            <div className="mt-2 space-y-2">
              {renderTopicHierarchy(topics, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleFrameworkSelect = (framework: StandardsFramework) => {
    setSelectedFramework(framework);
  };

  const currentAreaConfig = EDUCATIONAL_AREAS.find(area => area.value === selectedEducationalArea);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Educational Standards</h1>
          <p className="text-muted-foreground">
            Manage and create standards frameworks for different educational areas
          </p>
        </div>
        {user?.role && ["super_admin", "school_admin"].includes(user.role) && (
          <Dialog open={isCreateFrameworkOpen} onOpenChange={setIsCreateFrameworkOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Standard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Standards Framework</DialogTitle>
                <DialogDescription>
                  Add a new standards framework for your institution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="framework-name">Framework Name</Label>
                  <Input
                    id="framework-name"
                    value={newFramework.name}
                    onChange={(e) => setNewFramework({ ...newFramework, name: e.target.value })}
                    placeholder="e.g., Custom Medical Standards"
                  />
                </div>
                <div>
                  <Label htmlFor="framework-description">Description</Label>
                  <Textarea
                    id="framework-description"
                    value={newFramework.description}
                    onChange={(e) => setNewFramework({ ...newFramework, description: e.target.value })}
                    placeholder="Describe this standards framework..."
                  />
                </div>
                <div>
                  <Label htmlFor="educational-area">Educational Area</Label>
                  <Select
                    value={newFramework.educationalArea}
                    onValueChange={(value) => setNewFramework({ ...newFramework, educationalArea: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(user?.role === 'super_admin' ? EDUCATIONAL_AREAS : 
                        EDUCATIONAL_AREAS.filter(area => area.value === tenant?.educationalArea)
                      ).map((area) => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="framework-type">Framework Type</Label>
                  <Select
                    value={newFramework.frameworkType}
                    onValueChange={(value) => setNewFramework({ ...newFramework, frameworkType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FRAMEWORK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateFrameworkOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFramework}
                  disabled={createFrameworkMutation.isPending}
                >
                  {createFrameworkMutation.isPending ? "Creating..." : "Create Framework"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Educational Area Panel - Show only user's area for non-super admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              {user?.role === 'super_admin' ? 'Educational Areas' : 'Your Educational Area'}
            </CardTitle>
            <CardDescription>
              {user?.role === 'super_admin' 
                ? 'Select an educational area to view its standards'
                : `Standards for ${tenant?.name || 'your institution'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {(user?.role === 'super_admin' ? EDUCATIONAL_AREAS : 
                EDUCATIONAL_AREAS.filter(area => area.value === tenant?.educationalArea)
              ).map((area) => {
                const Icon = area.icon;
                return (
                  <Button
                    key={area.value}
                    variant={selectedEducationalArea === area.value ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedEducationalArea(area.value)}
                    data-testid={`button-${area.value}`}
                    disabled={user?.role !== 'super_admin'}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {area.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Standards List Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentAreaConfig && <currentAreaConfig.icon className="w-5 h-5 mr-2" />}
              {currentAreaConfig?.label} Standards
            </CardTitle>
            <CardDescription>
              Click on a standard to view its details and mapping matrix
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading standards...</div>
            ) : frameworks && frameworks.length > 0 ? (
              <div className="space-y-1">
                {frameworks.map((framework) => (
                  <div
                    key={framework.id}
                    className={`w-full p-4 rounded-md border cursor-pointer transition-colors ${
                      selectedFramework?.id === framework.id 
                        ? "bg-secondary/10 border-secondary" 
                        : "border-transparent hover:bg-accent/5"
                    }`}
                    onClick={() => handleFrameworkSelect(framework)}
                    data-testid={`button-framework-${framework.id}`}
                  >
                    <div className="space-y-3">
                      {/* Title row */}
                      <div className="flex items-start gap-3">
                        <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm leading-tight" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                            {framework.name}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Description and badges row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {framework.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed ml-7" style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                              {framework.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={framework.isOfficial ? "default" : "secondary"} className="text-xs">
                            {framework.isOfficial ? "Official" : "Custom"}
                          </Badge>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No standards found for this educational area
              </div>
            )}
          </CardContent>
        </Card>

        {/* Standards Detail Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              {selectedFramework ? selectedFramework.name : "Standard Details"}
            </CardTitle>
            <CardDescription>
              {selectedFramework 
                ? "View and manage the selected standards framework"
                : "Select a standard from the list to view its details"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFramework ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Framework Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      <Badge variant={selectedFramework.isOfficial ? "default" : "secondary"}>
                        {selectedFramework.isOfficial ? "Official" : "Custom"}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Version:</span> {selectedFramework.version}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-muted-foreground">{selectedFramework.description}</p>
                    </div>
                  </div>
                </div>

                {user?.role && ["super_admin", "school_admin", "faculty"].includes(user.role) && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        initializeEditForm(selectedFramework);
                        setIsEditFrameworkOpen(true);
                      }}
                      disabled={selectedFramework.isOfficial && user?.role !== 'super_admin'}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                    {/* Show delete button for custom frameworks or super admin */}
                    {((user.role === "super_admin") || 
                      (user.role === "school_admin" && !selectedFramework.isOfficial)) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteFramework(selectedFramework)}
                        disabled={deleteFrameworkMutation.isPending}
                        data-testid="button-delete-framework"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteFrameworkMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a standard to view its details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Framework Content - Show INBDE Matrix or Subject Details */}
      {selectedFramework && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedFramework.name} - Structure</CardTitle>
            <CardDescription>
              {selectedFramework.name === "INBDE" && selectedFramework.educationalArea === "dental_school"
                ? "Interactive curriculum mapping matrix showing Foundation Knowledge areas vs Clinical Content areas"
                : "Detailed breakdown of standards and subjects within this framework"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFramework.name === "INBDE" && selectedFramework.educationalArea === "dental_school" ? (
              <INBDEMappingMatrix 
                frameworkId={selectedFramework.id} 
                tenantId={user?.role === "super_admin" ? "all" : (tenant?.id || "")}
              />
            ) : (
              <Tabs defaultValue="subjects" className="w-full">
                <TabsList>
                  <TabsTrigger value="subjects">Subjects</TabsTrigger>
                  <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                </TabsList>
                <TabsContent value="subjects" className="space-y-4">
                  {frameworkDetails?.subjects && frameworkDetails.subjects.length > 0 ? (
                    <div className="space-y-6">
                      {frameworkDetails.subjects
                        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        .map((subject: any) => (
                          <Card key={subject.id} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                                  {subject.code && (
                                    <Badge variant="outline" className="mt-1">
                                      {subject.code}
                                    </Badge>
                                  )}
                                  {subject.description && (
                                    <CardDescription className="mt-2">
                                      {subject.description}
                                    </CardDescription>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">Order: {subject.sortOrder}</Badge>
                                  {user?.role && ["super_admin", "school_admin"].includes(user.role) && (
                                    <Button size="sm" variant="ghost">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            
                            {/* Hierarchical Topics under this subject */}
                            {subject.topics && subject.topics.length > 0 && (
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  {renderTopicHierarchy(subject.topics, 1)}
                                </div>
                              </CardContent>
                            )}
                            
                            {/* No topics message */}
                            {(!subject.topics || subject.topics.length === 0) && (
                              <CardContent className="pt-0">
                                <div className="text-center text-muted-foreground py-4 text-sm">
                                  No topics defined for this subject
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No subjects defined for this framework</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="hierarchy" className="space-y-4">
                  <div className="text-center text-muted-foreground py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Hierarchy view coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Framework Dialog */}
      <Dialog open={isEditFrameworkOpen} onOpenChange={setIsEditFrameworkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Framework</DialogTitle>
            <DialogDescription>
              Update the framework information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-framework-name">Framework Name</Label>
              <Input
                id="edit-framework-name"
                value={editFramework.name}
                onChange={(e) => setEditFramework({ ...editFramework, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-framework-description">Description</Label>
              <Textarea
                id="edit-framework-description"
                value={editFramework.description}
                onChange={(e) => setEditFramework({ ...editFramework, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-framework-version">Version</Label>
              <Input
                id="edit-framework-version"
                value={editFramework.version}
                onChange={(e) => setEditFramework({ ...editFramework, version: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFrameworkOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFramework}
              disabled={updateFrameworkMutation.isPending}
            >
              {updateFrameworkMutation.isPending ? "Updating..." : "Update Framework"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}