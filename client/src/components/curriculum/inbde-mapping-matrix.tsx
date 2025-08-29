import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Grid3x3, Info, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface INBDEFoundationKnowledge {
  id: string;
  fkNumber: number;
  name: string;
  description: string;
  isActive: boolean;
}

interface INBDEClinicalContent {
  id: string;
  ccNumber: number;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface MappingCell {
  cc: INBDEClinicalContent;
  contentCount: number;
  totalContentCount: number;
  coveragePercentage: string;
}

interface MatrixRow {
  fk: INBDEFoundationKnowledge;
  ccMappings: MappingCell[];
}

interface INBDEMappingMatrixProps {
  frameworkId: string;
  tenantId: string;
  courseId?: string;
}

export function INBDEMappingMatrix({ frameworkId, tenantId, courseId }: INBDEMappingMatrixProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCell, setSelectedCell] = useState<{ fkId: string; ccId: string; fk: INBDEFoundationKnowledge; cc: INBDEClinicalContent } | null>(null);

  // Initialize INBDE standards
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/inbde/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to initialize INBDE standards");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbde/mapping-matrix"] });
      toast({
        title: "Success",
        description: "INBDE standards initialized successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize INBDE standards",
        variant: "destructive"
      });
    }
  });

  // Fetch mapping matrix
  const { data: matrixData, isLoading, error } = useQuery({
    queryKey: ["/api/inbde/mapping-matrix", tenantId, courseId],
    queryFn: async () => {
      const url = courseId 
        ? `/api/inbde/mapping-matrix/${tenantId}?courseId=${courseId}`
        : `/api/inbde/mapping-matrix/${tenantId}`;
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // INBDE standards not initialized yet
          throw new Error("INBDE_NOT_INITIALIZED");
        }
        throw new Error("Failed to fetch mapping matrix");
      }
      
      return response.json();
    },
    retry: (failureCount, error) => {
      // Don't retry if INBDE standards are not initialized
      if (error.message === "INBDE_NOT_INITIALIZED") {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Recalculate statistics
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/inbde/recalculate-stats/${tenantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ courseId })
      });
      if (!response.ok) throw new Error("Failed to recalculate statistics");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbde/mapping-matrix"] });
      toast({
        title: "Success",
        description: "Statistics recalculated successfully"
      });
    }
  });

  // Fetch content mappings for selected cell
  const { data: cellMappings } = useQuery({
    queryKey: ["/api/inbde/content-mapping", tenantId, selectedCell?.fkId, selectedCell?.ccId],
    queryFn: async () => {
      if (!selectedCell) return [];
      const response = await fetch(`/api/inbde/content-mapping/${tenantId}/${selectedCell.fkId}/${selectedCell.ccId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch content mappings");
      return response.json();
    },
    enabled: !!selectedCell
  });

  const getPercentageColor = (percentage: string) => {
    const pct = parseFloat(percentage);
    if (pct === 0) return "bg-gray-100 text-gray-800";
    if (pct < 25) return "bg-red-100 text-red-800";
    if (pct < 50) return "bg-yellow-100 text-yellow-800";
    if (pct < 75) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  if (error?.message === "INBDE_NOT_INITIALIZED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            INBDE Curriculum Mapping
          </CardTitle>
          <CardDescription>
            Initialize INBDE standards to begin curriculum mapping
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Grid3x3 className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">INBDE Standards Not Initialized</h3>
              <p className="text-muted-foreground">
                The INBDE Foundation Knowledge and Clinical Content areas need to be initialized before you can begin curriculum mapping.
              </p>
            </div>
            <Button 
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
            >
              {initializeMutation.isPending ? "Initializing..." : "Initialize INBDE Standards"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            INBDE Curriculum Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading curriculum mapping matrix...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            INBDE Curriculum Mapping
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive">Error loading curriculum mapping matrix</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/inbde/mapping-matrix"] })}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { matrix = [], foundationKnowledge = [], clinicalContent = [] } = matrixData || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                INBDE Curriculum Mapping Matrix
              </CardTitle>
              <CardDescription>
                Interactive mapping matrix showing alignment between Clinical Content and Foundation Knowledge areas
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => recalculateMutation.mutate()}
                disabled={recalculateMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
                Recalculate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matrix" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matrix">Matrix View</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="matrix" className="mt-6">
              <ScrollArea className="w-full h-[600px]">
                <div className="min-w-[900px]">
                  <Table className="text-xs border-collapse">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-gray-50 z-10 border-r w-48">
                          Clinical Content vs Foundation Knowledge Areas
                        </TableHead>
                        {foundationKnowledge.map((fk: INBDEFoundationKnowledge) => (
                          <TableHead key={fk.id} className="text-center min-w-[80px] px-2 bg-blue-50 border-r border-gray-200">
                            <div className="text-xs font-medium">
                              FK{fk.fkNumber}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clinicalContent.map((cc: INBDEClinicalContent) => (
                        <TableRow key={cc.id}>
                          <TableCell className="sticky left-0 bg-gray-50 z-10 border-r font-medium p-2">
                            <div className="space-y-1">
                              <div className="font-semibold text-xs">CC{cc.ccNumber}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1" title={cc.name}>
                                {cc.name.length > 30 ? cc.name.substring(0, 27) + '...' : cc.name}
                              </div>
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {cc.category.split(' ')[0]}
                              </Badge>
                            </div>
                          </TableCell>
                          {foundationKnowledge.map((fk: INBDEFoundationKnowledge) => {
                            // Find the mapping for this CC-FK combination
                            const matrixRow = matrix.find((row: MatrixRow) => row.fk.id === fk.id);
                            const mapping = matrixRow?.ccMappings.find((m: MappingCell) => m.cc.id === cc.id);
                            
                            return (
                              <TableCell key={fk.id} className="text-center p-0.5 border-r border-gray-200">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-10 w-full p-0.5"
                                      onClick={() => setSelectedCell({
                                        fkId: fk.id,
                                        ccId: cc.id,
                                        fk: fk,
                                        cc: cc
                                      })}
                                    >
                                      <div className="space-y-0.5">
                                        <Badge className={`text-xs ${getPercentageColor(mapping?.coveragePercentage || "0.00")}`}>
                                          {mapping?.coveragePercentage || "0"}%
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">
                                          {mapping?.contentCount || 0}
                                        </div>
                                      </div>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        CC{cc.ccNumber} × FK{fk.fkNumber} Mapping Details
                                      </DialogTitle>
                                      <DialogDescription className="space-y-2">
                                        <div><strong>Clinical Content:</strong> {cc.name}</div>
                                        <div><strong>Foundation Knowledge:</strong> {fk.name}</div>
                                        <div><strong>Category:</strong> {cc.category}</div>
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-primary">{mapping?.contentCount || 0}</div>
                                          <div className="text-sm text-muted-foreground">Mapped Content</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold">{mapping?.totalContentCount || 0}</div>
                                          <div className="text-sm text-muted-foreground">Total Content</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-green-600">{mapping?.coveragePercentage || "0.00"}%</div>
                                          <div className="text-sm text-muted-foreground">Coverage</div>
                                        </div>
                                      </div>
                                      <Progress value={parseFloat(mapping?.coveragePercentage || "0.00")} className="w-full" />
                                      
                                      {cellMappings && cellMappings.length > 0 && (
                                        <div>
                                          <h4 className="font-semibold mb-2">Mapped Content ({cellMappings.length})</h4>
                                          <ScrollArea className="h-32">
                                            <div className="space-y-2">
                                              {cellMappings.map((mapping: any) => (
                                                <div key={mapping.id} className="flex justify-between items-center p-2 border rounded">
                                                  <div>
                                                    <div className="font-medium">{mapping.contentTitle}</div>
                                                    <div className="text-sm text-muted-foreground">{mapping.contentType}</div>
                                                  </div>
                                                  <Badge variant="outline">
                                                    {(parseFloat(mapping.alignmentStrength) * 100).toFixed(0)}%
                                                  </Badge>
                                                </div>
                                              ))}
                                            </div>
                                          </ScrollArea>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="summary" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Foundation Knowledge Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{foundationKnowledge.length}</div>
                    <p className="text-sm text-muted-foreground">Total FK areas (1-10)</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Clinical Content Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clinicalContent.length}</div>
                    <p className="text-sm text-muted-foreground">Total CC areas (1-56)</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Matrix Cells</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{foundationKnowledge.length * clinicalContent.length}</div>
                    <p className="text-sm text-muted-foreground">Total mapping combinations</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">Clinical Content Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Diagnosis and Treatment Planning", "Oral Health Management", "Practice and Profession"].map(category => {
                      const categoryContent = clinicalContent.filter((cc: INBDEClinicalContent) => cc.category === category);
                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="font-semibold">{category}</h4>
                          <div className="text-2xl font-bold text-primary">{categoryContent.length}</div>
                          <div className="text-sm text-muted-foreground">
                            CC{categoryContent[0]?.ccNumber || 1}-{categoryContent[categoryContent.length - 1]?.ccNumber || 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}