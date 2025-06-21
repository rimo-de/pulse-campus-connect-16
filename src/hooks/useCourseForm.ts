
import { useState, useCallback } from 'react';
import { courseService } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import type { CourseFormData, DeliveryMode } from '@/types/course';

export const useCourseForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryModes, setDeliveryModes] = useState<DeliveryMode[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CourseFormData>({
    course_title: '',
    course_description: '',
    curriculum_file: null,
    offerings: [],
  });

  const loadDeliveryModes = useCallback(async () => {
    try {
      console.log('Loading delivery modes...');
      const modes = await courseService.getDeliveryModes();
      console.log('Loaded delivery modes:', modes);
      setDeliveryModes(modes);
    } catch (error) {
      console.error('Error loading delivery modes:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery modes",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleInputChange = useCallback((field: keyof CourseFormData, value: any) => {
    console.log('Input change:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    console.log('Resetting form');
    setFormData({
      course_title: '',
      course_description: '',
      curriculum_file: null,
      offerings: [],
    });
  }, []);

  const submitForm = async (courseId?: string) => {
    setIsLoading(true);
    
    try {
      console.log('Submitting form with data:', formData);
      
      // Enhanced validation
      if (!formData.course_title.trim()) {
        throw new Error('Course title is required');
      }

      if (!formData.offerings || formData.offerings.length === 0) {
        throw new Error('At least one course offering is required');
      }

      // Validate each offering thoroughly
      for (let i = 0; i < formData.offerings.length; i++) {
        const offering = formData.offerings[i];
        
        if (!offering.delivery_mode_id) {
          throw new Error(`Delivery mode is required for offering ${i + 1}`);
        }
        
        if (!offering.duration_days || offering.duration_days <= 0) {
          throw new Error(`Duration must be greater than 0 for offering ${i + 1}`);
        }
        
        if (typeof offering.unit_fee !== 'number' || offering.unit_fee <= 0) {
          throw new Error(`Unit fee must be greater than 0 for offering ${i + 1}`);
        }

        if (typeof offering.fee !== 'number' || offering.fee < 0) {
          throw new Error(`Course fee must be a valid positive number for offering ${i + 1}`);
        }
      }

      // Submit the form
      if (courseId) {
        console.log('Updating course:', courseId);
        await courseService.updateCourse(courseId, formData);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        console.log('Creating new course');
        await courseService.createCourse(formData);
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }
      
      resetForm();
      onSuccess?.();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stableSetFormData = useCallback((newFormData: CourseFormData) => {
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
  }, []);

  return {
    formData,
    setFormData: stableSetFormData,
    handleInputChange,
    resetForm,
    submitForm,
    isLoading,
    deliveryModes,
    loadDeliveryModes,
  };
};
