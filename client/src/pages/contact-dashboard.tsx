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
import type { Contact } from "@shared/schema";

export default function ContactDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch contacts
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: ["super_admin", "school_admin"].includes(user?.role || "")
  });

  // Update contact status mutation
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact updated successfully"
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

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/contacts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully"
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

  const markAsContacted = (contact: Contact) => {
    updateContactMutation.mutate({
      id: contact.id,
      updates: { status: "contacted" }
    });
  };

  const deleteContact = (contactId: string) => {
    if (confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      deleteContactMutation.mutate(contactId);
    }
  };

  const viewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new": return "secondary";
      case "contacted": return "default";
      case "qualified": return "outline";
      case "converted": return "default";
      case "closed": return "destructive";
      default: return "secondary";
    }
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone || phone.trim() === "") return "Not provided";
    return phone;
  };

  const getReferralSourceDisplayName = (source: string) => {
    switch (source) {
      case "search_engine": return "Search Engine";
      case "linkedin": return "LinkedIn";
      case "social_media": return "Social Media";
      case "referral": return "Referral";
      case "news_blog": return "News/Blog";
      default: return source;
    }
  };

  if (!["super_admin", "school_admin"].includes(user?.role || "")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied. Administrative privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="contact-dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
            Contact Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and track contact inquiries from potential customers
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading contacts...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Contacts ({contacts?.length || 0})</CardTitle>
            <CardDescription>
              All contact inquiries submitted through the "Get Started Today" form
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!contacts || contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No contacts yet.</p>
                <p className="text-sm mt-2">Contacts will appear here when users submit the contact form.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-name">Name</TableHead>
                    <TableHead data-testid="header-job-title">Job Title</TableHead>
                    <TableHead data-testid="header-institution">Institution</TableHead>
                    <TableHead data-testid="header-discipline">Discipline</TableHead>
                    <TableHead data-testid="header-email">Email</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-submitted">Submitted</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts?.map((contact) => (
                    <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                      <TableCell data-testid={`text-name-${contact.id}`}>
                        <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                      </TableCell>
                      <TableCell data-testid={`text-job-title-${contact.id}`}>
                        {contact.jobTitle}
                      </TableCell>
                      <TableCell data-testid={`text-institution-${contact.id}`}>
                        {contact.institutionName}
                      </TableCell>
                      <TableCell data-testid={`text-discipline-${contact.id}`}>
                        {contact.disciplineArea}
                      </TableCell>
                      <TableCell data-testid={`text-email-${contact.id}`}>
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          data-testid={`link-email-${contact.id}`}
                        >
                          {contact.email}
                        </a>
                      </TableCell>
                      <TableCell data-testid={`status-${contact.id}`}>
                        <Badge variant={getStatusBadgeVariant(contact.status)}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-submitted-${contact.id}`}>
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewContact(contact)}
                            data-testid={`button-view-${contact.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {contact.status === "new" && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => markAsContacted(contact)}
                              disabled={updateContactMutation.isPending}
                              data-testid={`button-mark-contacted-${contact.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteContact(contact.id)}
                            disabled={deleteContactMutation.isPending}
                            data-testid={`button-delete-${contact.id}`}
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

      {/* View Contact Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-view-contact">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              Full details for the contact inquiry
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">FIRST NAME</h4>
                  <p className="font-medium" data-testid="detail-first-name">{selectedContact.firstName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">LAST NAME</h4>
                  <p data-testid="detail-last-name">{selectedContact.lastName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">EMAIL ADDRESS</h4>
                  <div className="flex items-center space-x-2">
                    <p data-testid="detail-email">{selectedContact.email}</p>
                    <a 
                      href={`mailto:${selectedContact.email}`}
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
                    <p data-testid="detail-phone">{formatPhoneNumber(selectedContact.phoneNumber)}</p>
                    {selectedContact.phoneNumber && selectedContact.phoneNumber.trim() !== "" && (
                      <a 
                        href={`tel:${selectedContact.phoneNumber}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        data-testid="button-phone-contact"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">JOB TITLE</h4>
                  <p data-testid="detail-job-title">{selectedContact.jobTitle}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">INSTITUTION</h4>
                  <p data-testid="detail-institution">{selectedContact.institutionName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">SCHOOL/COLLEGE</h4>
                  <p data-testid="detail-school-college">{selectedContact.schoolCollege}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">DISCIPLINE</h4>
                  <p data-testid="detail-discipline">{selectedContact.disciplineArea}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">HOW THEY FOUND US</h4>
                <p data-testid="detail-referral-source">{getReferralSourceDisplayName(selectedContact.referralSource)}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">MESSAGE</h4>
                <p className="whitespace-pre-wrap" data-testid="detail-message">{selectedContact.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">STATUS</h4>
                  <Badge variant={getStatusBadgeVariant(selectedContact.status)} data-testid="detail-status">
                    {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">SUBMITTED</h4>
                  <p data-testid="detail-submitted">{selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : "Unknown"}</p>
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
            {selectedContact && selectedContact.status === "new" && (
              <Button 
                onClick={() => {
                  markAsContacted(selectedContact);
                  setIsViewDialogOpen(false);
                }}
                disabled={updateContactMutation.isPending}
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