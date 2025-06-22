
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TrainerService } from '@/services/trainerService';
import { courseService } from '@/services/courseService';
import TrainerFormModal from './TrainerFormModal';
import TrainerAvatar from './TrainerAvatar';
import type { Trainer } from '@/types/trainer';
import type { Course } from '@/types/course';

const TrainerManagement = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [expertiseFilter, setExpertiseFilter] = useState('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const { toast } = useToast();

  console.log('TrainerManagement: Component rendered, showFormModal:', showFormModal);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [trainers, searchTerm, experienceFilter, expertiseFilter]);

  const loadData = async () => {
    try {
      console.log('TrainerManagement: Loading data...');
      setIsLoading(true);
      const [trainerData, courseData] = await Promise.all([
        TrainerService.getAllTrainers(),
        courseService.getAllCourses()
      ]);
      console.log('TrainerManagement: Data loaded - trainers:', trainerData.data.length, 'courses:', courseData.length);
      setTrainers(trainerData.data);
      setCourses(courseData);
    } catch (error) {
      console.error('TrainerManagement: Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load trainers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTrainers = () => {
    let filtered = trainers;

    if (searchTerm) {
      filtered = filtered.filter(trainer =>
        `${trainer.first_name} ${trainer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (experienceFilter !== 'all') {
      filtered = filtered.filter(trainer => trainer.experience_level === experienceFilter);
    }

    if (expertiseFilter !== 'all') {
      filtered = filtered.filter(trainer => trainer.expertise_area === expertiseFilter);
    }

    setFilteredTrainers(filtered);
  };

  const handleAddTrainer = () => {
    console.log('TrainerManagement: Add trainer clicked');
    setEditingTrainer(null);
    setShowFormModal(true);
  };

  const handleEditTrainer = (trainer: Trainer) => {
    console.log('TrainerManagement: Edit trainer clicked for:', trainer.id);
    setEditingTrainer(trainer);
    setShowFormModal(true);
  };

  const handleDeleteTrainer = async (trainer: Trainer) => {
    console.log('TrainerManagement: Delete trainer clicked for:', trainer.id);
    if (!confirm(`Are you sure you want to delete ${trainer.first_name} ${trainer.last_name}?`)) {
      return;
    }

    try {
      await TrainerService.deleteTrainer(trainer.id);
      toast({
        title: "Success",
        description: "Trainer deleted successfully",
      });
      loadData();
    } catch (error) {
      console.error('TrainerManagement: Error deleting trainer:', error);
      toast({
        title: "Error",
        description: "Failed to delete trainer",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    console.log('TrainerManagement: Form success callback triggered');
    setShowFormModal(false);
    setEditingTrainer(null);
    loadData();
  };

  const handleCloseModal = () => {
    console.log('TrainerManagement: Close modal triggered');
    setShowFormModal(false);
    setEditingTrainer(null);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Trainer Management</h1>
        <p className="text-gray-600">Manage trainer profiles and assignments.</p>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Trainers ({filteredTrainers.length})</span>
            </CardTitle>
            <Button onClick={handleAddTrainer} className="edu-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Trainer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Expertise Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.course_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading trainers...</p>
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {trainers.length === 0 ? 'No trainers registered yet.' : 'No trainers match your search criteria.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrainers.map((trainer) => (
                <div key={trainer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <TrainerAvatar trainer={trainer} size="md" />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 text-lg">
                            {trainer.first_name} {trainer.last_name}
                          </h4>
                          <Badge className={getExperienceBadgeColor(trainer.experience_level)}>
                            {trainer.experience_level}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{trainer.email}</span>
                          </div>
                          {trainer.mobile_number && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{trainer.mobile_number}</span>
                            </div>
                          )}
                          {trainer.expertise_course && (
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4" />
                              <span>Expert in: {trainer.expertise_course.course_title}</span>
                            </div>
                          )}
                        </div>

                        {/* Skills placeholder - will be functional once database tables are set up */}
                        {trainer.trainer_skills && trainer.trainer_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {trainer.trainer_skills.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill.skill}
                              </Badge>
                            ))}
                            {trainer.trainer_skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{trainer.trainer_skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTrainer(trainer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTrainer(trainer)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {showFormModal && (
        <TrainerFormModal
          isOpen={showFormModal}
          onClose={handleCloseModal}
          trainer={editingTrainer}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default TrainerManagement;
