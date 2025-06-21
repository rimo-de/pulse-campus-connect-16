
import React from 'react';
import { Button } from '@/components/ui/button';
import type { Course } from '@/types/course';

interface CourseFormActionsProps {
  editingCourse?: Course | null;
  isLoading: boolean;
  onClose: () => void;
}

const CourseFormActions = ({ editingCourse, isLoading, onClose }: CourseFormActionsProps) => {
  return (
    <div className="flex space-x-3 pt-4">
      <Button type="submit" disabled={isLoading} className="edu-button flex-1">
        {isLoading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
      </Button>
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">
        Cancel
      </Button>
    </div>
  );
};

export default CourseFormActions;
