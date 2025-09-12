import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Video, BookOpen, ClipboardCheck, Search, Filter } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'lecture' | 'assignment' | 'video' | 'document' | 'quiz';
  description: string;
  courseId: string;
  aiCategorized: boolean;
  createdAt: string;
  updatedAt: string;
  courseName: string;
  courseCode: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'lecture':
      return <BookOpen className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'assignment':
      return <ClipboardCheck className="h-4 w-4" />;
    case 'document':
    case 'quiz':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'lecture':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'video':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'assignment':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'document':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'quiz':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export default function CourseContentPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Get course content
  const { data: contentList = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ['/api/courses/content'],
    enabled: !!user?.tenantId
  });

  // Get unique courses and types for filtering
  const uniqueCourses = Array.from(new Set(contentList.map(item => item.courseCode + '|' + item.courseName)))
    .map(item => {
      const [code, name] = item.split('|');
      return { code, name };
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  const uniqueTypes = Array.from(new Set(contentList.map(item => item.type))).sort();

  // Filter content based on search and filters
  const filteredContent = contentList.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesCourse = selectedCourse === 'all' || item.courseCode === selectedCourse;
    
    return matchesSearch && matchesType && matchesCourse;
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header 
          title="Course Content" 
          description="Browse and manage educational content across all courses" 
        />
        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading course content...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Course Content" 
        description="Browse and manage educational content across all courses" 
      />
      
      <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
        <div className="space-y-6">
          {/* Filters */}
          <Card data-testid="card-content-filters">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      data-testid="input-search-content"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger data-testid="select-content-type" className="w-full md:w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger data-testid="select-course-filter" className="w-full md:w-64">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourses.map(course => (
                      <SelectItem key={course.code} value={course.code}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" data-testid="badge-total-content">
                  {filteredContent.length} content items
                </Badge>
                <Badge variant="outline" data-testid="badge-ai-categorized">
                  {filteredContent.filter(item => item.aiCategorized).length} AI categorized
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Content Table */}
          <Card data-testid="card-content-list">
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredContent.length === 0 ? (
                <div className="text-center py-12" data-testid="empty-content-state">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {contentList.length === 0 
                      ? "No course content has been added yet." 
                      : "No content matches your current filters."}
                  </p>
                  {searchTerm || selectedType !== 'all' || selectedCourse !== 'all' ? (
                    <Button
                      data-testid="button-clear-filters"
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('all');
                        setSelectedCourse('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((content) => (
                        <TableRow key={content.id} data-testid={`row-content-${content.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(content.type)}
                              <span className="font-medium" data-testid={`text-content-title-${content.id}`}>
                                {content.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-course-info-${content.id}`}>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{content.courseCode}</span>
                              <span className="text-xs text-muted-foreground">{content.courseName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getTypeColor(content.type)}
                              data-testid={`badge-type-${content.id}`}
                            >
                              {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={content.aiCategorized ? "default" : "outline"}
                              data-testid={`badge-ai-status-${content.id}`}
                            >
                              {content.aiCategorized ? "AI Categorized" : "Manual"}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-description-${content.id}`}>
                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                              {content.description}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}