
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';
import { StudentService } from '@/services/studentService';
import { TrainerService } from '@/services/trainerService';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];

interface AssetAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset: PhysicalAsset | null;
}

const AssetAssignmentModal = ({ isOpen, onClose, onSuccess, asset }: AssetAssignmentModalProps) => {
  const [formData, setFormData] = useState({
    assigned_to_type: 'student',
    assigned_to_id: '',
    assigned_by: '',
    notes: '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadStudentsAndTrainers();
      setFormData({
        assigned_to_type: 'student',
        assigned_to_id: '',
        assigned_by: '',
        notes: '',
      });
    }
  }, [isOpen]);

  const loadStudentsAndTrainers = async () => {
    try {
      const [studentsResult, trainersResult] = await Promise.all([
        StudentService.getAllStudents(),
        TrainerService.getAllTrainers()
      ]);
      setStudents(studentsResult.data);
      setTrainers(trainersResult.data);
    } catch (error) {
      console.error('Error loading students and trainers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (!isOpen || !asset) return null;

  const assigneeOptions = formData.assigned_to_type === 'student' ? students : trainers;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Assign Asset: {asset.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="edu-button flex-1"
                >
                  {isLoading ? (
                    <>
                      <UserPlus className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Asset
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetAssignmentModal;
