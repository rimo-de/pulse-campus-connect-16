
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TrainerService } from '@/services/trainerService';
import { GraduationCap, Mail, Award } from 'lucide-react';
import type { Trainer } from '@/types/trainer';

interface TrainerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scheduleId: string;
  courseName: string;
}

const TrainerAssignmentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  scheduleId, 
  courseName 
}: TrainerAssignmentModalProps) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [assignedTrainers, setAssignedTrainers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTrainers();
      loadAssignedTrainers();
    }
  }, [isOpen, scheduleId]);

  const loadTrainers = async () => {
    try {
      setIsLoading(true);
      const data = await TrainerService.getAllTrainers();
      setTrainers(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load trainers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignedTrainers = async () => {
    try {
      const assigned = await TrainerService.getAssignedTrainers(scheduleId);
      const assignedIds = assigned.map(t => t.trainer_id);
      setAssignedTrainers(assignedIds);
      setSelectedTrainers(assignedIds);
    } catch (error) {
      console.error('Failed to load assigned trainers:', error);
    }
  };

  const handleTrainerToggle = (trainerId: string) => {
    setSelectedTrainers(prev => 
      prev.includes(trainerId)
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await TrainerService.updateTrainerAssignments(scheduleId, selectedTrainers);
      toast({
        title: "Success",
        description: "Trainer assignments updated successfully",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trainer assignments",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'Junior': return 'bg-green-100 text-green-800';
      case 'Mid-Level': return 'bg-blue-100 text-blue-800';
      case 'Senior': return 'bg-purple-100 text-purple-800';
      case 'Expert': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5" />
            <span>Assign Trainers to {courseName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading trainers...</div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No trainers available. Create trainers first.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={selectedTrainers.includes(trainer.id)}
                        onCheckedChange={() => handleTrainerToggle(trainer.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {trainer.first_name} {trainer.last_name}
                          </h4>
                          <Badge className={getExperienceBadgeColor(trainer.experience_level)}>
                            {trainer.experience_level}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{trainer.email}</span>
                          </div>
                          {trainer.expertise_course && (
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4" />
                              <span>Expert in: {trainer.expertise_course.course_title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Assignments'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerAssignmentModal;
