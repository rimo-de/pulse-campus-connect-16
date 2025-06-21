
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
    <>
      {/* Course Title */}
      <div>
        <Label htmlFor="course_title">Course Title *</Label>
        <Input
          id="course_title"
          value={formData.course_title}
          onChange={(e) => onFieldChange('course_title', e.target.value)}
          required
          className="mt-1"
          placeholder="Enter course title"
        />
      </div>

      {/* Course Description */}
      <div>
        <Label htmlFor="course_description">Course Description</Label>
        <Textarea
          id="course_description"
          value={formData.course_description}
          onChange={(e) => onFieldChange('course_description', e.target.value)}
          rows={3}
          className="mt-1"
          placeholder="Enter course description"
        />
      </div>

      {/* Maßnahmenummer */}
      <div>
        <Label htmlFor="massnahmenummer">Maßnahmenummer</Label>
        <Input
          id="massnahmenummer"
          value={formData.massnahmenummer}
          onChange={(e) => onFieldChange('massnahmenummer', e.target.value)}
          className="mt-1"
          placeholder="Enter Maßnahmenummer"
        />
      </div>
    </>
  );
};

export default CourseBasicFields;
