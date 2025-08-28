import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BoardReviewPage() {
  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Board Review" 
        description="Generate mock exams and track student readiness" 
      />
      
      <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
        <Card>
          <CardHeader>
            <CardTitle>Board Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Board review functionality will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
