
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { trainerSchema, type TrainerFormData, type Trainer } from '@/types/trainer';
import { TrainerService } from '@/services/trainerService';
import { courseService } from '@/services/courseService';
import type { Course } from '@/types/course';

interface TrainerFormProps {
  trainer?: Trainer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const TrainerForm = ({ trainer, onSuccess, onCancel }: TrainerFormProps) => {
  console.log('TrainerForm rendered with trainer:', trainer?.id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const { toast } = useToast();

  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      first_name: trainer?.first_name || '',
      last_name: trainer?.last_name || '',
      mobile_number: trainer?.mobile_number || '',
      email: trainer?.email || '',
      expertise_area: trainer?.expertise_area || '',
      experience_level: trainer?.experience_level as any || 'Junior',
    },
  });

  useEffect(() => {
    console.log('TrainerForm: Loading courses...');
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      console.log('TrainerForm: Fetching courses from service...');
      const data = await courseService.getAllCourses();
      console.log('TrainerForm: Courses loaded:', data.length);
      setCourses(data);
    } catch (error) {
      console.error('TrainerForm: Failed to load courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: TrainerFormData) => {
    console.log('TrainerForm: Submitting form with data:', data);
    setIsLoading(true);
    
    try {
      if (trainer) {
        console.log('TrainerForm: Updating trainer:', trainer.id);
        await TrainerService.updateTrainer(trainer.id, data);
        toast({
          title: "Success",
          description: "Trainer updated successfully",
        });
      } else {
        console.log('TrainerForm: Creating new trainer');
        await TrainerService.createTrainer(data);
        toast({
          title: "Success",
          description: "Trainer created successfully",
        });
      }
      console.log('TrainerForm: Operation successful, calling onSuccess');
      onSuccess();
    } catch (error: any) {
      console.error('TrainerForm: Error saving trainer:', error);
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
    <div className="p-6 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border shadow-lg z-50">
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
                  <FormLabel>Expertise Area</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select expertise area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="">No specific expertise</SelectItem>
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

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-6"
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
    </div>
  );
};

export default TrainerForm;
