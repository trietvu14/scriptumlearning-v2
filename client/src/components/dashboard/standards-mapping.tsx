import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Brain, Heart, Bot, Activity, FileText, Smile } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";

// Educational area specific mapping data
const getMappingDataByEducationalArea = (educationalArea: string) => {
  switch (educationalArea) {
    case "dental_school":
      return [
        {
          id: "inbde-coverage",
          title: "INBDE Coverage",
          subtitle: "Foundation Knowledge",
          progress: 78,
          completed: 145,
          total: 186,
          icon: Smile,
          iconColor: "bg-primary/10 text-primary"
        },
        {
          id: "coda-standards",
          title: "CODA Standards",
          subtitle: "Clinical Competency",
          progress: 85,
          completed: 92,
          total: 108,
          icon: Activity,
          iconColor: "bg-chart-2/10 text-chart-2"
        },
        {
          id: "internal-standards", 
          title: "Internal Standards",
          subtitle: "Curriculum Template",
          progress: 92,
          completed: 67,
          total: 73,
          icon: FileText,
          iconColor: "bg-chart-3/10 text-chart-3"
        }
      ];
    case "medical_school":
      return [
        {
          id: "usmle-step1",
          title: "USMLE Step 1 Coverage",
          subtitle: "Cardiovascular System",
          progress: 85,
          completed: 234,
          total: 275,
          icon: Stethoscope,
          iconColor: "bg-primary/10 text-primary"
        },
        {
          id: "lcme-standards",
          title: "LCME Standards",
          subtitle: "Clinical Reasoning",
          progress: 92,
          completed: 156,
          total: 169,
          icon: Brain,
          iconColor: "bg-chart-2/10 text-chart-2"
        },
        {
          id: "internal-standards", 
          title: "Internal Standards",
          subtitle: "Pathophysiology Core",
          progress: 78,
          completed: 98,
          total: 125,
          icon: Heart,
          iconColor: "bg-chart-3/10 text-chart-3"
        }
      ];
    default:
      return [];
  }
};

const getStandardsSelectOptions = (educationalArea: string) => {
  switch (educationalArea) {
    case "dental_school":
      return [
        { value: "all", label: "All Standards" },
        { value: "inbde", label: "INBDE" },
        { value: "coda", label: "CODA Standards" },
        { value: "internal", label: "Internal Standards" }
      ];
    case "medical_school":
      return [
        { value: "all", label: "All Standards" },
        { value: "usmle-step1", label: "USMLE Step 1" },
        { value: "usmle-step2", label: "USMLE Step 2" },
        { value: "lcme", label: "LCME Standards" }
      ];
    default:
      return [{ value: "all", label: "All Standards" }];
  }
};

const getAIRecommendations = (educationalArea: string) => {
  switch (educationalArea) {
    case "dental_school":
      return {
        description: "Based on current mapping analysis, consider adding more content for:",
        items: [
          "• Oral pathology identification (INBDE - Foundation Knowledge)",
          "• Periodontal treatment planning (CODA Standards)",
          "• Endodontic procedures (Internal Standards)"
        ]
      };
    case "medical_school":
      return {
        description: "Based on current mapping analysis, consider adding more content for:",
        items: [
          "• Arrhythmia classification (USMLE Step 1 - Cardiovascular)",
          "• Pharmacokinetics principles (Internal Standards)"
        ]
      };
    default:
      return {
        description: "No recommendations available for this educational area.",
        items: []
      };
  }
};

export function StandardsMapping() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const educationalArea = tenant?.educationalArea || "dental_school";
  const mappingData = getMappingDataByEducationalArea(educationalArea);
  const selectOptions = getStandardsSelectOptions(educationalArea);
  const aiRecommendations = getAIRecommendations(educationalArea);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Curriculum Standards Mapping</CardTitle>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mappingData.map((item) => {
          const Icon = item.icon;
          
          return (
            <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${item.iconColor} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground" data-testid={`text-${item.id}-title`}>
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`text-${item.id}-subtitle`}>
                    {item.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid={`text-${item.id}-percentage`}>
                    {item.progress}%
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-${item.id}-ratio`}>
                    {item.completed}/{item.total} topics
                  </p>
                </div>
                <div className="w-16">
                  <Progress value={item.progress} className="h-2" />
                </div>
              </div>
            </div>
          );
        })}
        
        {/* AI Recommendations */}
        <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mt-0.5">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">AI Recommendation</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {aiRecommendations.description}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {aiRecommendations.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <button className="mt-3 text-xs text-accent hover:text-accent/80" data-testid="button-view-recommendations">
                View detailed recommendations →
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
