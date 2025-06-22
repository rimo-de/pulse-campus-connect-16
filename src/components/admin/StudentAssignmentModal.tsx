
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];

interface StudentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset: PhysicalAsset | null;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const StudentAssignmentModal = ({ isOpen, onClose, onSuccess, asset }: StudentAssignmentModalProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadStudents();
      setSelectedStudent(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = students.filter(student =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      const data = await physicalAssetService.getAvailableStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleAssign = async () => {
    if (!asset || !selectedStudent) return;

    try {
      setIsLoading(true);
      await physicalAssetService.assignAssetToStudent(asset.id, selectedStudent.id);
      
      toast({
        title: "Success",
        description: `Asset assigned to ${selectedStudent.first_name} ${selectedStudent.last_name}`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning asset:', error);
      toast({
        title: "Error",
        description: "Failed to assign asset",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStudent(null);
    setSearchTerm('');
    onClose();
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Asset to Student</DialogTitle>
          <div className="text-sm text-gray-600">
            Asset: <span className="font-medium">{asset.name}</span>
            {asset.serial_number && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                {asset.serial_number}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Students</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected Student</h4>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </div>
                  <div className="text-sm text-blue-600">{selectedStudent.email}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <Label className="text-sm font-medium">Available Students</Label>
            <div className="mt-2 border rounded-lg h-64 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                        {selectedStudent?.id === student.id && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedStudent || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Assigning...' : 'Assign Asset'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAssignmentModal;
