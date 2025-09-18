import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, Trash2, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { DemoRequest } from "@shared/schema";

export default function DemoRequestsDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch demo requests
  const { data: demoRequests, isLoading } = useQuery<DemoRequest[]>({
    queryKey: ["/api/demo-requests"],
    enabled: ["super_admin", "school_admin"].includes(user?.role || "")
  });

  // Update demo request status mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DemoRequest> }) => {
      const response = await apiRequest("PATCH", `/api/demo-requests/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo-requests"] });
      toast({
        title: "Success",
        description: "Demo request updated successfully"
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

  // Delete demo request mutation
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/demo-requests/${id}`);
      // Handle 204 No Content responses (common for DELETE operations)
      if (response.status === 204) {
        return { success: true };
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo-requests"] });
      toast({
        title: "Success",
        description: "Demo request deleted successfully"
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

  const markAsContacted = (request: DemoRequest) => {
    updateRequestMutation.mutate({
      id: request.id,
      updates: { status: "contacted" }
    });
  };

  const deleteRequest = (requestId: string) => {
    if (confirm("Are you sure you want to delete this demo request? This action cannot be undone.")) {
      deleteRequestMutation.mutate(requestId);
    }
  };

  const viewRequest = (request: DemoRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "contacted": return "default";
      case "scheduled": return "outline";
      default: return "secondary";
    }
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone || phone.trim() === "") return "Not provided";
    return phone;
  };

  if (!["super_admin", "school_admin"].includes(user?.role || "")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Administrative privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="demo-requests-dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
            Demo Requests Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and track demo requests from potential customers
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading demo requests...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Demo Requests ({demoRequests?.length || 0})</CardTitle>
            <CardDescription>
              All demo requests submitted through the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!demoRequests || demoRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No demo requests yet.</p>
                <p className="text-sm mt-2">Requests will appear here when users submit the demo request form.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-name">Name</TableHead>
                    <TableHead data-testid="header-title">Title</TableHead>
                    <TableHead data-testid="header-school">School</TableHead>
                    <TableHead data-testid="header-email">Email</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-submitted">Submitted</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoRequests?.map((request) => (
                    <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                      <TableCell data-testid={`text-name-${request.id}`}>
                        <div className="font-medium">{request.fullName}</div>
                      </TableCell>
                      <TableCell data-testid={`text-title-${request.id}`}>
                        {request.title}
                      </TableCell>
                      <TableCell data-testid={`text-school-${request.id}`}>
                        {request.school}
                      </TableCell>
                      <TableCell data-testid={`text-email-${request.id}`}>
                        <a 
                          href={`mailto:${request.email}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          data-testid={`link-email-${request.id}`}
                        >
                          {request.email}
                        </a>
                      </TableCell>
                      <TableCell data-testid={`status-${request.id}`}>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-submitted-${request.id}`}>
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewRequest(request)}
                            data-testid={`button-view-${request.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === "pending" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => markAsContacted(request)}
                              disabled={updateRequestMutation.isPending}
                              data-testid={`button-mark-contacted-${request.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteRequest(request.id)}
                            disabled={deleteRequestMutation.isPending}
                            data-testid={`button-delete-${request.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-view-request">
          <DialogHeader>
            <DialogTitle>Demo Request Details</DialogTitle>
            <DialogDescription>
              Full details for the demo request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">FULL NAME</h4>
                  <p className="font-medium" data-testid="detail-full-name">{selectedRequest.fullName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">TITLE/POSITION</h4>
                  <p data-testid="detail-title">{selectedRequest.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">EMAIL ADDRESS</h4>
                  <div className="flex items-center space-x-2">
                    <p data-testid="detail-email">{selectedRequest.email}</p>
                    <a 
                      href={`mailto:${selectedRequest.email}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      data-testid="button-email-contact"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">PHONE NUMBER</h4>
                  <div className="flex items-center space-x-2">
                    <p data-testid="detail-phone">{formatPhoneNumber(selectedRequest.phoneNumber)}</p>
                    {selectedRequest.phoneNumber && selectedRequest.phoneNumber.trim() !== "" && (
                      <a 
                        href={`tel:${selectedRequest.phoneNumber}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        data-testid="button-phone-contact"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">SCHOOL/INSTITUTION</h4>
                <p data-testid="detail-school">{selectedRequest.school}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">STATUS</h4>
                  <Badge variant={getStatusBadgeVariant(selectedRequest.status)} data-testid="detail-status">
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">SUBMITTED</h4>
                  <p data-testid="detail-submitted">{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "Unknown"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
              data-testid="button-close-dialog"
            >
              Close
            </Button>
            {selectedRequest && selectedRequest.status === "pending" && (
              <Button 
                onClick={() => {
                  markAsContacted(selectedRequest);
                  setIsViewDialogOpen(false);
                }}
                disabled={updateRequestMutation.isPending}
                data-testid="button-mark-contacted-dialog"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Contacted
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}