
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services/courseService';
import CourseForm from './CourseForm';
import type { CourseWithOfferings } from '@/types/course';

const CourseManagement = () => {
  const [courses, setCourses] = useState<CourseWithOfferings[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithOfferings[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_offerings?.some(offering => 
        offering.massnahmenummer?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCourses(filtered);
  }, [courses, searchTerm]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsFormOpen(true);
  };

  const handleEditCourse = (course: CourseWithOfferings) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course and all its offerings?')) return;

    try {
      await courseService.deleteCourse(courseId);
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      loadCourses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleViewCurriculum = (course: CourseWithOfferings) => {
    if (course.curriculum_file_path) {
      const url = courseService.getCurriculumFileUrl(course.curriculum_file_path);
      window.open(url, '_blank');
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const getDeliveryModeBadgeColor = (method: string) => {
    return method === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getDeliveryTypeBadgeColor = (type: string) => {
    return type === 'Full time' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Course Management</h1>
        <p className="text-gray-600">Create and manage courses with multiple delivery options.</p>
      </div>

      {/* Controls */}
      <Card className="edu-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Courses</CardTitle>
            <Button onClick={handleAddCourse} className="edu-button">
              <Plus className="w-4 h-4 mr-2" />
              Add New Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses by title, description, or Maßnahmenummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No courses found matching your search.' : 'No courses available. Create your first course!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Offerings</TableHead>
                    <TableHead>Curriculum</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <React.Fragment key={course.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCourseExpansion(course.id)}
                            className="p-0 w-6 h-6"
                          >
                            {expandedCourses.has(course.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{course.course_title}</div>
                            {course.course_description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {course.course_description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {course.course_offerings?.length || 0} offering(s)
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.curriculum_file_name ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCurriculum(course)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View PDF
                            </Button>
                          ) : (
                            <span className="text-gray-400">No file</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCourse(course)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {expandedCourses.has(course.id) && course.course_offerings && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-gray-700">Course Offerings:</h4>
                              {course.course_offerings.map((offering) => (
                                <div key={offering.id} className="flex items-center space-x-4 text-sm bg-white p-3 rounded border">
                                  <div className="flex space-x-2">
                                    <Badge className={getDeliveryModeBadgeColor(offering.delivery_mode?.delivery_method || '')}>
                                      {offering.delivery_mode?.delivery_method}
                                    </Badge>
                                    <Badge className={getDeliveryTypeBadgeColor(offering.delivery_mode?.delivery_type || '')}>
                                      {offering.delivery_mode?.delivery_type}
                                    </Badge>
                                  </div>
                                  <div className="text-gray-600">
                                    Maßnahmenummer: {offering.massnahmenummer || 'N/A'}
                                  </div>
                                  <div className="text-gray-600">
                                    {offering.duration_days} days ({offering.units} units)
                                  </div>
                                  <div className="text-gray-600">
                                    €{offering.fee.toFixed(2)}
                                  </div>
                                  <div>
                                    <Badge variant={offering.is_active ? "default" : "secondary"}>
                                      {offering.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Form Modal */}
      <CourseForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadCourses}
        editingCourse={editingCourse}
      />
    </div>
  );
};

export default CourseManagement;
