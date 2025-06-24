import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CompleteStudent } from '@/types/student';
import { StudentService } from '@/services/studentService';
import StudentForm from './StudentForm';
import InviteButton from './InviteButton';

const StudentManagement = () => {
  const [students, setStudents] = useState<CompleteStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<CompleteStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    firstName: '',
    lastName: '',
    id: ''
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<CompleteStudent | null>(null);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students...');
      
      const result = await StudentService.getAllStudents();
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      console.log('Fetched students:', result.data);
      setStudents(result.data);
      setFilteredStudents(result.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchFilters.firstName) {
      filtered = filtered.filter(student =>
        student.first_name.toLowerCase().includes(searchFilters.firstName.toLowerCase())
      );
    }

    if (searchFilters.lastName) {
      filtered = filtered.filter(student =>
        student.last_name.toLowerCase().includes(searchFilters.lastName.toLowerCase())
      );
    }

    if (searchFilters.id) {
      filtered = filtered.filter(student =>
        student.id.toLowerCase().includes(searchFilters.id.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchFilters, students]);

  const handleFilterChange = (field: keyof typeof searchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStudentAdded = () => {
    fetchStudents();
    setIsAddDialogOpen(false);
  };

  const handleStudentUpdated = () => {
    fetchStudents();
    setIsEditDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleEditStudent = (student: CompleteStudent) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const result = await StudentService.deleteStudent(studentId);

      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete student',
          variant: 'destructive',
        });
        return;
      }

      fetchStudents();
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchFilters({
      firstName: '',
      lastName: '',
      id: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Student Management</h1>
        <p className="text-gray-600">Manage student records and information</p>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Students Database</CardTitle>
              <CardDescription>Filter and manage student records</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="edu-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <StudentForm onSuccess={handleStudentAdded} />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by first name"
                value={searchFilters.firstName}
                onChange={(e) => handleFilterChange('firstName', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by last name"
                value={searchFilters.lastName}
                onChange={(e) => handleFilterChange('lastName', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by ID"
                value={searchFilters.id}
                onChange={(e) => handleFilterChange('id', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading students...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs">
                            {student.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {student.first_name} {student.last_name}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.mobile_number}</TableCell>
                          <TableCell>{student.nationality}</TableCell>
                          <TableCell className="capitalize">{student.education_background}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <InviteButton
                                name={`${student.first_name} ${student.last_name}`}
                                email={student.email}
                                userType="student"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm 
              student={selectedStudent} 
              onSuccess={handleStudentUpdated} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
