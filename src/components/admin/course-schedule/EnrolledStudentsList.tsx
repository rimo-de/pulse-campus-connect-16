
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Trash2, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { studentCourseAssignmentService } from '@/services/studentCourseAssignmentService';
import type { StudentCourseAssignment } from '@/types/student';

interface EnrolledStudentsListProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  courseName: string;
}

const EnrolledStudentsList = ({ isOpen, onClose, scheduleId, courseName }: EnrolledStudentsListProps) => {
  const [assignments, setAssignments] = useState<StudentCourseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadEnrolledStudents();
    }
  }, [isOpen, scheduleId]);

  const loadEnrolledStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentCourseAssignmentService.getAssignmentsBySchedule(scheduleId);
      setAssignments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load enrolled students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Enrolled Students - {courseName}</span>
              </div>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading enrolled students...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students enrolled in this schedule yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Total Enrolled: {assignments.length} student(s)
                  </p>
                </div>
                
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
      </div>
    </div>
  );
};

export default EnrolledStudentsList;
