
import { useState } from 'react';
import { courseService } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import type { CourseFormData } from '@/types/course';

export const useCourseForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CourseFormData>({
    course_title: '',
    course_description: '',
    massnahmenummer: '',
    number_of_days: 0,
    delivery_mode: 'Online',
    delivery_type: 'Full time',
    curriculum_file: null,
  });

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      course_title: '',
      course_description: '',
      massnahmenummer: '',
      number_of_days: 0,
      delivery_mode: 'Online',
      delivery_type: 'Full time',
      curriculum_file: null,
    });
  };

  const submitForm = async (courseId?: string) => {
    setIsLoading(true);
    try {
      if (courseId) {
        await courseService.updateCourse(courseId, formData);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        await courseService.createCourse(formData);
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }
      
      resetForm();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm,
    submitForm,
    isLoading,
  };
};
