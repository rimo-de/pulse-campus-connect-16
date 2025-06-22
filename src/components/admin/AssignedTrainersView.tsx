
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, GraduationCap, Calendar, BookOpen, MapPin, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TrainerService } from '@/services/trainerService';
import { format } from 'date-fns';

interface TrainerAssignment {
  id: string;
  trainer_id: string;
  schedule_id: string;
  trainer: {
    first_name: string;
    last_name: string;
    email: string;
    experience_level: string;
    expertise_course?: {
      course_title: string;
    };
  };
  course_schedule: {
    start_date: string;
    end_date: string;
    status: string;
    course: {
      course_title: string;
    };
    course_offering: {
      delivery_mode: {
        name: string;
        delivery_method: string;
        delivery_type: string;
      };
    };
  };
}

const AssignedTrainersView = () => {
  const [assignments, setAssignments] = useState<TrainerAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<TrainerAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm]);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await TrainerService.getAllTrainerAssignments();
      setAssignments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load trainer assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        `${assignment.trainer.first_name} ${assignment.trainer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course_schedule.course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssignments(filtered);
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this trainer assignment?')) {
      return;
    }

    try {
      await TrainerService.removeTrainerAssignment(assignmentId);
      toast({
        title: "Success",
        description: "Trainer assignment removed successfully",
      });
      loadAssignments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove trainer assignment",
        variant: "destructive",
      });
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Assigned Trainers</h1>
        <p className="text-gray-600">View all trainer assignments to course schedules.</p>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Trainer Assignments ({filteredAssignments.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by trainer name, course, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading assignments...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {assignments.length === 0 ? 'No trainer assignments found.' : 'No assignments match your search criteria.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="font-medium text-gray-900 text-lg">
                          {assignment.trainer.first_name} {assignment.trainer.last_name}
                        </h4>
                        <Badge className={getExperienceBadgeColor(assignment.trainer.experience_level)}>
                          {assignment.trainer.experience_level}
                        </Badge>
                        <Badge className={getStatusBadgeColor(assignment.course_schedule.status)}>
                          {assignment.course_schedule.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-medium">{assignment.course_schedule.course.course_title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {assignment.course_schedule.course_offering.delivery_mode.name} 
                              ({assignment.course_schedule.course_offering.delivery_mode.delivery_method})
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(assignment.course_schedule.start_date), 'dd MMM yyyy')} - 
                              {format(new Date(assignment.course_schedule.end_date), 'dd MMM yyyy')}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            Email: {assignment.trainer.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedTrainersView;
