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

  // Parse URL parameters to auto-select area and framework
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const areaParam = urlParams.get('area');
    const frameworkParam = urlParams.get('framework');
    
    if (areaParam && areaParam !== selectedEducationalArea) {
      setSelectedEducationalArea(areaParam);
    }
    
    // Framework selection will happen after frameworks are loaded
    if (frameworkParam && !selectedFramework) {
      // Store framework ID to select after frameworks load
      sessionStorage.setItem('pendingFrameworkSelection', frameworkParam);
    }
  }, [location]);

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

  // Auto-select framework when frameworks load and there's a pending selection
  useEffect(() => {
    const pendingFrameworkId = sessionStorage.getItem('pendingFrameworkSelection');
    if (pendingFrameworkId && frameworks && frameworks.length > 0) {
      const targetFramework = frameworks.find(f => f.id === pendingFrameworkId);
      if (targetFramework) {
        setSelectedFramework(targetFramework);
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
                      {EDUCATIONAL_AREAS.map((area) => (
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
        {/* Educational Areas Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Educational Areas
            </CardTitle>
            <CardDescription>Select an educational area to view its standards</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {EDUCATIONAL_AREAS.map((area) => {
                const Icon = area.icon;
                return (
                  <Button
                    key={area.value}
                    variant={selectedEducationalArea === area.value ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedEducationalArea(area.value)}
                    data-testid={`button-${area.value}`}
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
                  <Button
                    key={framework.id}
                    variant={selectedFramework?.id === framework.id ? "secondary" : "ghost"}
                    className="w-full p-4 h-auto min-h-[5rem] text-left"
                    onClick={() => handleFrameworkSelect(framework)}
                    data-testid={`button-framework-${framework.id}`}
                  >
                    <div className="flex flex-col w-full space-y-2 overflow-hidden">
                      {/* Top row with icon, title, and badge */}
                      <div className="flex items-start justify-between w-full min-w-0">
                        <div className="flex items-start min-w-0 flex-1 mr-2 overflow-hidden">
                          <Award className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="font-medium text-sm leading-tight break-words overflow-wrap-anywhere max-w-full">{framework.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge variant={framework.isOfficial ? "default" : "secondary"} className="text-xs whitespace-nowrap">
                            {framework.isOfficial ? "Official" : "Custom"}
                          </Badge>
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        </div>
                      </div>
                      {/* Description row */}
                      {framework.description && (
                        <div className="text-xs text-muted-foreground ml-7 leading-relaxed break-words overflow-wrap-anywhere max-w-full pr-2">
                          {framework.description}
                        </div>
                      )}
                    </div>
                  </Button>
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
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {frameworkDetails.subjects
                          .sort((a: StandardsSubject, b: StandardsSubject) => a.sortOrder - b.sortOrder)
                          .map((subject: StandardsSubject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">{subject.name}</TableCell>
                              <TableCell>{subject.code || "—"}</TableCell>
                              <TableCell>{subject.description || "—"}</TableCell>
                              <TableCell>{subject.sortOrder}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
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
    </div>
  );
}