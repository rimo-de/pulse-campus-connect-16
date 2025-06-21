
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CourseFormData } from '@/types/course';

interface CourseDeliveryFieldsProps {
  formData: CourseFormData;
  onFieldChange: (field: keyof CourseFormData, value: any) => void;
}

const CourseDeliveryFields = ({ formData, onFieldChange }: CourseDeliveryFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="delivery_mode">Delivery Mode</Label>
        <Select
          value={formData.delivery_mode}
          onValueChange={(value: 'Online' | 'Remote') => {
            onFieldChange('delivery_mode', value);
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Online">Online</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="delivery_type">Delivery Type</Label>
        <Select
          value={formData.delivery_type}
          onValueChange={(value: 'Full time' | 'Part time') => {
            onFieldChange('delivery_type', value);
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full time">Full time</SelectItem>
            <SelectItem value="Part time">Part time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CourseDeliveryFields;
