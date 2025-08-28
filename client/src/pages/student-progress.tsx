import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentProgressPage() {
  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Student Progress" 
        description="Track individual student performance and mastery" 
      />
      
      <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
        <Card>
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Student progress tracking will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
