
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
      
      // Validate that we have at least one offering
      if (!formData.offerings || formData.offerings.length === 0) {
        throw new Error('At least one course offering is required');
      }

      // Validate each offering
      for (const offering of formData.offerings) {
        if (!offering.delivery_mode_id) {
          throw new Error('Delivery mode is required for all offerings');
        }
        if (!offering.duration_days || offering.duration_days <= 0) {
          throw new Error('Duration must be greater than 0 for all offerings');
        }
        if (typeof offering.fee !== 'number' || offering.fee < 0) {
          throw new Error('Fee must be a valid positive number for all offerings');
        }
      }

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
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
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
