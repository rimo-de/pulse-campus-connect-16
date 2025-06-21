
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { CourseFormData } from '@/types/course';

interface CourseDurationFieldsProps {
  formData: CourseFormData;
  onFieldChange: (field: keyof CourseFormData, value: any) => void;
}

const CourseDurationFields = ({ formData, onFieldChange }: CourseDurationFieldsProps) => {
  const numberOfUnits = formData.number_of_days * 8;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="number_of_days">Number of Days</Label>
        <Input
          id="number_of_days"
          type="number"
          min="0"
          value={formData.number_of_days}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            onFieldChange('number_of_days', value);
          }}
          className="mt-1"
          placeholder="0"
        />
      </div>
      <div>
        <Label htmlFor="number_of_units">Number of Units (Read Only)</Label>
        <Input
          id="number_of_units"
          value={numberOfUnits}
          readOnly
          className="mt-1 bg-gray-50"
        />
      </div>
    </div>
  );
};

export default CourseDurationFields;
