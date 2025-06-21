
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCourseForm } from '@/hooks/useCourseForm';
import type { Course } from '@/types/course';
import CourseFormHeader from './course-form/CourseFormHeader';
import CourseBasicFields from './course-form/CourseBasicFields';
import CourseDurationFields from './course-form/CourseDurationFields';
import CourseDeliveryFields from './course-form/CourseDeliveryFields';
import CourseFileUpload from './course-form/CourseFileUpload';
import CourseFormActions from './course-form/CourseFormActions';

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCourse?: Course | null;
}

const CourseForm = ({ isOpen, onClose, onSuccess, editingCourse }: CourseFormProps) => {
  const { formData, handleInputChange, submitForm, resetForm, isLoading, setFormData } = useCourseForm(() => {
    onSuccess();
    onClose();
  });

  // Helper functions to validate and provide fallbacks for literal types
  const validateDeliveryMode = (value: string | null): 'Online' | 'Remote' => {
    return value === 'Online' || value === 'Remote' ? value : 'Online';
  };

  const validateDeliveryType = (value: string | null): 'Full time' | 'Part time' => {
    return value === 'Full time' || value === 'Part time' ? value : 'Full time';
  };

  useEffect(() => {
    console.log('CourseForm useEffect triggered - isOpen:', isOpen, 'editingCourse:', editingCourse?.id);
    
    if (isOpen) {
      if (editingCourse) {
        console.log('Setting form data for editing course:', editingCourse.course_title);
        setFormData({
          course_title: editingCourse.course_title,
          course_description: editingCourse.course_description || '',
          massnahmenummer: editingCourse.massnahmenummer || '',
          number_of_days: editingCourse.number_of_days || 0,
          delivery_mode: validateDeliveryMode(editingCourse.delivery_mode),
          delivery_type: validateDeliveryType(editingCourse.delivery_type),
          curriculum_file: null,
        });
      } else {
        console.log('Resetting form for new course');
        resetForm();
      }
    }
  }, [isOpen, editingCourse, setFormData, resetForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    submitForm(editingCourse?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CourseFormHeader editingCourse={editingCourse} onClose={onClose} />
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CourseBasicFields
                formData={formData}
                onFieldChange={handleInputChange}
              />
              
              <CourseDurationFields
                formData={formData}
                onFieldChange={handleInputChange}
              />
              
              <CourseDeliveryFields
                formData={formData}
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
