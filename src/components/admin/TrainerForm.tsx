
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { trainerSchema, type TrainerFormData, type Trainer, type TrainerDocument } from '@/types/trainer';
import { TrainerService } from '@/services/trainerService';
import { courseService } from '@/services/courseService';
import { supabase } from '@/integrations/supabase/client';
import TrainerAvatar from './TrainerAvatar';
import TrainerFileUpload from './trainer-form/TrainerFileUpload';
import { Upload, X, Plus } from 'lucide-react';
import type { Course } from '@/types/course';

interface TrainerFormProps {
  trainer?: Trainer | null;
  onSuccess: () => void;
}

const TrainerForm = ({ trainer, onSuccess }: TrainerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<TrainerDocument[]>([]);
  const { toast } = useToast();

  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      mobile_number: '',
      email: '',
      expertise_area: '',
      experience_level: 'Junior',
      profile_image_url: '',
      skills: [],
    },
  });

  useEffect(() => {
    loadCourses();
    
    if (trainer) {
      console.log('Loading trainer data:', trainer);
      
      // Set form values for existing trainer
      const formData = {
        first_name: trainer.first_name || '',
        last_name: trainer.last_name || '',
        mobile_number: trainer.mobile_number || '',
        email: trainer.email || '',
        expertise_area: trainer.expertise_area || '',
        experience_level: trainer.experience_level as 'Junior' | 'Mid-Level' | 'Senior' | 'Expert',
        profile_image_url: trainer.profile_image_url || '',
        skills: trainer.trainer_skills?.map(skill => skill.skill) || [],
      };
      
      form.reset(formData);
      
      // Set profile image preview
      if (trainer.profile_image_url) {
        setImagePreview(trainer.profile_image_url);
      }
      
      // Load existing skills
      const existingSkills = trainer.trainer_skills?.map(skill => skill.skill) || [];
      setSkills(existingSkills);
      console.log('Loaded existing skills:', existingSkills);

      // Load existing documents
      const existingDocuments = trainer.trainer_documents || [];
      setDocuments(existingDocuments);
      console.log('Loaded existing documents:', existingDocuments);
    } else {
      // Reset for new trainer
      form.reset({
        first_name: '',
        last_name: '',
        mobile_number: '',
        email: '',
        expertise_area: '',
        experience_level: 'Junior',
        profile_image_url: '',
        skills: [],
      });
      setSkills([]);
      setDocuments([]);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [trainer, form]);

  const loadCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `trainer-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trainer-files')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('trainer-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      form.setValue('skills', updatedSkills);
      setNewSkill('');
      console.log('Added skill, updated skills:', updatedSkills);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    form.setValue('skills', updatedSkills);
    console.log('Removed skill, updated skills:', updatedSkills);
  };

  const handleDocumentsChange = (newDocuments: TrainerDocument[]) => {
    setDocuments(newDocuments);
    console.log('Documents updated:', newDocuments);
  };

  const saveDocumentsToDatabase = async (trainerId: string, tempDocuments: TrainerDocument[]) => {
    try {
      // Filter out documents that are already saved (have trainer_id)
      const unsavedDocuments = tempDocuments.filter(doc => !doc.trainer_id || doc.trainer_id === '');
      
      if (unsavedDocuments.length === 0) return;

      const documentsToSave = unsavedDocuments.map(doc => ({
        trainer_id: trainerId,
        file_name: doc.file_name,
        file_url: doc.file_url,
        file_type: doc.file_type
      }));

      const { error } = await supabase
        .from('trainer_documents')
        .insert(documentsToSave);

      if (error) {
        console.error('Error saving documents:', error);
        throw error;
      }

      console.log('Documents saved to database:', documentsToSave);
    } catch (error) {
      console.error('Error saving documents to database:', error);
      toast({
        title: "Warning",
        description: "Trainer saved but some documents may not have been saved properly",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: TrainerFormData) => {
    setIsLoading(true);
    console.log('Submitting trainer form with data:', data);
    console.log('Current skills:', skills);
    console.log('Current documents:', documents);
    
    try {
      // Upload image if there's a new one
      let imageUrl = trainer?.profile_image_url;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          data.profile_image_url = uploadedUrl;
        }
      }

      // Ensure skills are properly included in the form data
      const submitData = {
        ...data,
        expertise_area: data.expertise_area === 'none' ? null : data.expertise_area || null,
        skills: skills // Use the current skills state
      };

      console.log('Final submit data:', submitData);

      let savedTrainer;
      if (trainer) {
        savedTrainer = await TrainerService.updateTrainer(trainer.id, submitData);
        toast({
          title: "Success",
          description: "Trainer updated successfully",
        });
      } else {
        savedTrainer = await TrainerService.createTrainer(submitData);
        // Save any uploaded documents for new trainer
        if (documents.length > 0) {
          await saveDocumentsToDatabase(savedTrainer.id, documents);
        }
        toast({
          title: "Success",
          description: "Trainer created successfully",
        });
      }
      
      console.log('Trainer saved successfully:', savedTrainer);
      onSuccess();
    } catch (error: any) {
      console.error('Error saving trainer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save trainer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex items-center space-x-4">
          {trainer && (
            <TrainerAvatar trainer={trainer} size="lg" />
          )}
          {imagePreview && !trainer && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
          )}
          <div>
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                <span>Upload Profile Image</span>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expertise_area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Expertise Area</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expertise area" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No specific expertise</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.course_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Skills Section */}
        <div className="space-y-4">
          <FormLabel>Skills & Specializations</FormLabel>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Documents</h3>
          <TrainerFileUpload
            trainerId={trainer?.id}
            existingDocuments={documents}
            onDocumentsChange={handleDocumentsChange}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="edu-button"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              trainer ? 'Update Trainer' : 'Create Trainer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TrainerForm;
