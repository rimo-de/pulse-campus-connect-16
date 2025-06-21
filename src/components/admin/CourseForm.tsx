
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCourseForm } from '@/hooks/useCourseForm';
import type { CourseWithOfferings } from '@/types/course';
import CourseFormHeader from './course-form/CourseFormHeader';
import CourseBasicFields from './course-form/CourseBasicFields';
import CourseOfferingsFields from './course-form/CourseOfferingsFields';
import CourseFileUpload from './course-form/CourseFileUpload';
import CourseFormActions from './course-form/CourseFormActions';

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCourse?: CourseWithOfferings | null;
}

const CourseForm = ({ isOpen, onClose, onSuccess, editingCourse }: CourseFormProps) => {
  const { 
    formData, 
    handleInputChange, 
    submitForm, 
    resetForm, 
    isLoading, 
    setFormData,
    deliveryModes,
    loadDeliveryModes
  } = useCourseForm(() => {
    onSuccess();
    onClose();
  });

  useEffect(() => {
    if (isOpen) {
      console.log('CourseForm opened, loading delivery modes...');
      loadDeliveryModes();
    }
  }, [isOpen, loadDeliveryModes]);

  useEffect(() => {
    console.log('CourseForm useEffect triggered - isOpen:', isOpen, 'editingCourse:', editingCourse?.id);
    
    if (isOpen) {
      if (editingCourse) {
        console.log('Setting form data for editing course:', editingCourse.course_title);
        setFormData({
          course_title: editingCourse.course_title,
          course_description: editingCourse.course_description || '',
          curriculum_file: null,
          offerings: editingCourse.course_offerings?.map(offering => ({
            delivery_mode_id: offering.delivery_mode_id,
            massnahmenummer: offering.massnahmenummer || '',
            duration_days: offering.duration_days,
            fee: offering.fee,
            is_active: offering.is_active,
          })) || [],
        });
      } else {
        console.log('Resetting form for new course');
        resetForm();
      }
    }
  }, [isOpen, editingCourse, setFormData, resetForm]);

  const validateForm = () => {
    if (!formData.course_title.trim()) {
      return { isValid: false, message: "Course title is required" };
    }

    if (formData.offerings.length === 0) {
      return { isValid: false, message: "At least one course offering is required" };
    }

    for (let i = 0; i < formData.offerings.length; i++) {
      const offering = formData.offerings[i];
      if (!offering.delivery_mode_id) {
        return { isValid: false, message: `Delivery mode is required for offering ${i + 1}` };
      }
      if (!offering.duration_days || offering.duration_days <= 0) {
        return { isValid: false, message: `Valid duration is required for offering ${i + 1}` };
      }
      if (typeof offering.fee !== 'number' || offering.fee < 0) {
        return { isValid: false, message: `Valid fee is required for offering ${i + 1}` };
      }
    }

    return { isValid: true, message: "" };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      console.error('Form validation failed:', validation.message);
      // You could show a toast here if needed
      return;
    }

    console.log('Form submitted with data:', formData);
    submitForm(editingCourse?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CourseFormHeader editingCourse={editingCourse} onClose={onClose} />
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CourseBasicFields
                formData={formData}
                onFieldChange={handleInputChange}
              />
              
              <CourseOfferingsFields
                formData={formData}
                deliveryModes={deliveryModes}
                onFieldChange={handleInputChange}
              />
              
              <CourseFileUpload
                formData={formData}
                editingCourse={editingCourse}
                onFieldChange={handleInputChange}
              />

              <CourseFormActions
                editingCourse={editingCourse}
                isLoading={isLoading}
                onClose={onClose}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseForm;
