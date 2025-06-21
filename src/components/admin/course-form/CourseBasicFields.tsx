
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CourseFormData } from '@/types/course';

interface CourseBasicFieldsProps {
  formData: CourseFormData;
  onFieldChange: (field: keyof CourseFormData, value: any) => void;
}

const CourseBasicFields = ({ formData, onFieldChange }: CourseBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="course_title">Course Title *</Label>
        <Input
          id="course_title"
          value={formData.course_title}
          onChange={(e) => onFieldChange('course_title', e.target.value)}
          className="mt-1"
          placeholder="Enter course title"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="course_description">Course Description</Label>
        <Textarea
          id="course_description"
          value={formData.course_description}
          onChange={(e) => onFieldChange('course_description', e.target.value)}
          className="mt-1"
          placeholder="Enter course description"
          rows={3}
        />
      </div>
    </div>
  );
};

export default CourseBasicFields;
