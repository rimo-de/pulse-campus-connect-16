import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { studentCourseAssignmentService } from '@/services/studentCourseAssignmentService';
import { courseScheduleService } from '@/services/courseScheduleService';
import type { StudentCourseAssignment } from '@/types/student';
import type { CourseSchedule } from '@/types/course';

const EnrolledStudentsView = () => {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [assignments, setAssignments] = useState<StudentCourseAssignment[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    if (selectedScheduleId) {
      loadEnrolledStudents();
    } else {
      setAssignments([]);
    }
  }, [selectedScheduleId]);

  const loadSchedules = async () => {
    try {
      setIsLoadingSchedules(true);
      const data = await courseScheduleService.getAllSchedules();
      setSchedules(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const loadEnrolledStudents = async () => {
    try {
      setIsLoadingAssignments(true);
      const data = await studentCourseAssignmentService.getAssignmentsBySchedule(selectedScheduleId);
      setAssignments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load enrolled students",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: 'enrolled' | 'completed' | 'dropped') => {
    try {
      await studentCourseAssignmentService.updateAssignmentStatus(assignmentId, newStatus);
      toast({
        title: "Success",
        description: "Student status updated successfully",
      });
      loadEnrolledStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student status",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudent = async (assignmentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this course?`)) return;

    try {
      await studentCourseAssignmentService.removeStudentFromSchedule(assignmentId);
      toast({
        title: "Success",
        description: "Student removed successfully",
      });
      loadEnrolledStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Enrolled Students</h1>
        <p className="text-gray-600">View and manage students enrolled in specific courses.</p>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Select Course Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select
              value={selectedScheduleId}
              onValueChange={setSelectedScheduleId}
              disabled={isLoadingSchedules}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course schedule" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {schedule.course?.course_title} - {schedule.course_offering?.delivery_mode?.name} 
                    ({format(new Date(schedule.start_date), 'dd MMM yyyy')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedScheduleId && (
        <Card className="edu-card">
          <CardHeader>
            <CardTitle>
              {selectedSchedule && (
                <div className="flex items-center justify-between">
                  <span>
                    {selectedSchedule.course?.course_title} - {selectedSchedule.course_offering?.delivery_mode?.name}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {assignments.length} student(s) enrolled
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {isLoadingAssignments ? (
              <div className="text-center py-8">Loading enrolled students...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students enrolled in this schedule yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {assignments.map((assignment) => assignment.student && (
                    <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {assignment.student.first_name} {assignment.student.last_name}
                            </h4>
                            <Badge className={getStatusBadgeColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Email: {assignment.student.email}</div>
                            <div>Mobile: {assignment.student.mobile_number}</div>
                            <div>Nationality: {assignment.student.nationality}</div>
                            <div>
                              Enrolled: {format(new Date(assignment.enrollment_date), 'dd MMM yyyy')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Select
                            value={assignment.status}
                            onValueChange={(value) => handleStatusChange(assignment.id, value as any)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enrolled">Enrolled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="dropped">Dropped</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudent(
                              assignment.id, 
                              `${assignment.student!.first_name} ${assignment.student!.last_name}`
                            )}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnrolledStudentsView;
