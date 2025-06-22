
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, UserPlus, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';
import { StudentService } from '@/services/studentService';
import { TrainerService } from '@/services/trainerService';
import { courseService } from '@/services/courseService';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];

interface EnhancedAssetAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset: PhysicalAsset | null;
}

const EnhancedAssetAssignmentModal = ({ isOpen, onClose, onSuccess, asset }: EnhancedAssetAssignmentModalProps) => {
  const [activeTab, setActiveTab] = useState('individual');
  const [formData, setFormData] = useState({
    assigned_to_type: 'student',
    assigned_to_id: '',
    assigned_by: '',
    notes: '',
    schedule_id: '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [courseSchedules, setCourseSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
      setFormData({
        assigned_to_type: 'student',
        assigned_to_id: '',
        assigned_by: '',
        notes: '',
        schedule_id: '',
      });
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [studentsResult, trainersResult, coursesResult] = await Promise.all([
        StudentService.getAllStudents(),
        TrainerService.getAllTrainers(),
        courseService.getAllCourses()
      ]);
      setStudents(studentsResult.data);
      setTrainers(trainersResult.data);
      
      // Load course schedules (this would need to be implemented in courseService)
      // For now, using mock data structure
      setCourseSchedules([]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleIndividualAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assigned_to_id) {
      toast({
        title: "Error",
        description: "Please select who to assign the asset to",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await physicalAssetService.assignAsset({
        asset_id: asset!.id,
        assigned_to_id: formData.assigned_to_id,
        assigned_to_type: formData.assigned_to_type,
        assigned_by: formData.assigned_by || null,
        notes: formData.notes || null,
      });

      toast({
        title: "Success",
        description: "Asset assigned successfully",
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

  const handleCourseAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schedule_id || !formData.assigned_to_id) {
      toast({
        title: "Error",
        description: "Please select both a course and assignee",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await physicalAssetService.assignAssetToCourse({
        asset_id: asset!.id,
        assigned_to_id: formData.assigned_to_id,
        assigned_to_type: formData.assigned_to_type,
        assigned_by: formData.assigned_by || null,
        notes: formData.notes || null,
        schedule_id: formData.schedule_id,
      });

      toast({
        title: "Success",
        description: "Asset assigned to course successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning asset to course:', error);
      toast({
        title: "Error",
        description: "Failed to assign asset to course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

  const assigneeOptions = formData.assigned_to_type === 'student' ? students : trainers;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Assign Asset: {asset.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual" className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Individual Assignment</span>
                </TabsTrigger>
                <TabsTrigger value="course" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Course Assignment</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-6">
                <form onSubmit={handleIndividualAssignment} className="space-y-4">
                  <div>
                    <Label htmlFor="assigned_to_type">Assign To Type *</Label>
                    <Select 
                      value={formData.assigned_to_type} 
                      onValueChange={(value) => setFormData({...formData, assigned_to_type: value, assigned_to_id: ''})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="employee">Employee/Trainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assigned_to_id">
                      {formData.assigned_to_type === 'student' ? 'Student' : 'Employee/Trainer'} *
                    </Label>
                    <Select 
                      value={formData.assigned_to_id} 
                      onValueChange={(value) => setFormData({...formData, assigned_to_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${formData.assigned_to_type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {assigneeOptions.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.first_name} {person.last_name} ({person.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assigned_by">Assigned By</Label>
                    <Input
                      id="assigned_by"
                      value={formData.assigned_by}
                      onChange={(e) => setFormData({...formData, assigned_by: e.target.value})}
                      placeholder="Enter name of person assigning"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Enter any additional notes"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="edu-button flex-1"
                    >
                      {isLoading ? 'Assigning...' : 'Assign Asset'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="course" className="space-y-6">
                <form onSubmit={handleCourseAssignment} className="space-y-4">
                  <div>
                    <Label htmlFor="schedule_id">Course Schedule *</Label>
                    <Select 
                      value={formData.schedule_id} 
                      onValueChange={(value) => setFormData({...formData, schedule_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseSchedules.map((schedule) => (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            {schedule.course_title} - {schedule.start_date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assigned_to_type">Assign To Type *</Label>
                    <Select 
                      value={formData.assigned_to_type} 
                      onValueChange={(value) => setFormData({...formData, assigned_to_type: value, assigned_to_id: ''})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="employee">Employee/Trainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assigned_to_id">
                      {formData.assigned_to_type === 'student' ? 'Student' : 'Employee/Trainer'} *
                    </Label>
                    <Select 
                      value={formData.assigned_to_id} 
                      onValueChange={(value) => setFormData({...formData, assigned_to_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${formData.assigned_to_type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {assigneeOptions.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.first_name} {person.last_name} ({person.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assigned_by">Assigned By</Label>
                    <Input
                      id="assigned_by"
                      value={formData.assigned_by}
                      onChange={(e) => setFormData({...formData, assigned_by: e.target.value})}
                      placeholder="Enter name of person assigning"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Enter any additional notes"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="edu-button flex-1"
                    >
                      {isLoading ? 'Assigning...' : 'Assign to Course'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAssetAssignmentModal;
