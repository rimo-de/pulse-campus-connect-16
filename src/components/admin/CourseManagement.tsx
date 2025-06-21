
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, FileText, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services/courseService';
import CourseForm from './CourseForm';
import type { Course } from '@/types/course';

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.massnahmenummer?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

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

  const handleViewCurriculum = (course: Course) => {
    if (course.curriculum_file_path) {
      const url = courseService.getCurriculumFileUrl(course.curriculum_file_path);
      window.open(url, '_blank');
    }
  };

  const getDeliveryModeBadgeColor = (mode: string) => {
    return mode === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getDeliveryTypeBadgeColor = (type: string) => {
    return type === 'Full time' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Course Management</h1>
        <p className="text-gray-600">Create and manage courses in your institution.</p>
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
                    <TableHead>Course Title</TableHead>
                    <TableHead>Maßnahmenummer</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Delivery Mode</TableHead>
                    <TableHead>Delivery Type</TableHead>
                    <TableHead>Curriculum</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
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
                      <TableCell>{course.massnahmenummer || '-'}</TableCell>
                      <TableCell>{course.number_of_days || 0}</TableCell>
                      <TableCell>{(course.number_of_days || 0) * 8}</TableCell>
                      <TableCell>
                        {course.delivery_mode && (
                          <Badge className={getDeliveryModeBadgeColor(course.delivery_mode)}>
                            {course.delivery_mode}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {course.delivery_type && (
                          <Badge className={getDeliveryTypeBadgeColor(course.delivery_type)}>
                            {course.delivery_type}
                          </Badge>
                        )}
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
