import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CurriculumMappingPage() {
  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Curriculum Mapping" 
        description="Map course content to educational standards and learning objectives" 
      />
      
      <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Curriculum mapping functionality will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
