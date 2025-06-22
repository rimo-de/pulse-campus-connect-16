
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StudentService } from '@/services/studentService';
import { studentCourseAssignmentService } from '@/services/studentCourseAssignmentService';
import type { CompleteStudent } from '@/types/student';

interface StudentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scheduleId: string;
  courseName: string;
}

const StudentAssignmentModal = ({ isOpen, onClose, onSuccess, scheduleId, courseName }: StudentAssignmentModalProps) => {
  const [students, setStudents] = useState<CompleteStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<CompleteStudent[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadStudents();
      loadAssignedStudents();
    } else {
      resetForm();
    }
  }, [isOpen, scheduleId]);

  useEffect(() => {
    applySearch();
  }, [students, searchTerm, assignedStudentIds]);

  const loadStudents = async () => {
    try {
      const result = await StudentService.getAllStudents();
      setStudents(result.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const loadAssignedStudents = async () => {
    try {
      const assignments = await studentCourseAssignmentService.getAssignmentsBySchedule(scheduleId);
      setAssignedStudentIds(assignments.map(a => a.student_id));
    } catch (error) {
      console.error('Error loading assigned students:', error);
    }
  };

  const applySearch = () => {
    let filtered = students.filter(student => 
      !assignedStudentIds.includes(student.id)
    );

    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const resetForm = () => {
    setSelectedStudentIds([]);
    setSearchTerm('');
    setStudents([]);
    setFilteredStudents([]);
    setAssignedStudentIds([]);
  };

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await studentCourseAssignmentService.assignStudentsToSchedule(scheduleId, selectedStudentIds);
      toast({
        title: "Success",
        description: `${selectedStudentIds.length} student(s) assigned successfully`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Assign Students to {courseName}</span>
              </div>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Students Count */}
            {selectedStudentIds.length > 0 && (
              <div className="mb-4">
                <Badge variant="secondary">
                  {selectedStudentIds.length} student(s) selected
                </Badge>
              </div>
            )}

            {/* Students List */}
            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No students found matching your search.' : 'No available students to assign.'}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={selectedStudentIds.includes(student.id)}
                      onCheckedChange={(checked) => handleStudentToggle(student.id, !!checked)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                      <div className="text-xs text-gray-400">
                        {student.city} • {student.nationality}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssignStudents}
                disabled={isLoading || selectedStudentIds.length === 0}
                className="edu-button"
              >
                {isLoading ? 'Assigning...' : `Assign ${selectedStudentIds.length} Student(s)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAssignmentModal;
