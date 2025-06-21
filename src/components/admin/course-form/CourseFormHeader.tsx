
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import type { Course } from '@/types/course';

interface CourseFormHeaderProps {
  editingCourse?: Course | null;
  onClose: () => void;
}

const CourseFormHeader = ({ editingCourse, onClose }: CourseFormHeaderProps) => {
  return (
    <CardHeader className="border-b">
      <div className="flex items-center justify-between">
        <CardTitle className="edu-gradient-text">
          {editingCourse ? 'Edit Course' : 'Create New Course'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default CourseFormHeader;
