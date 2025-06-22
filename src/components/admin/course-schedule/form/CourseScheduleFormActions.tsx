
import React from 'react';
import { Button } from '@/components/ui/button';

interface CourseScheduleFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isFormValid: boolean;
  isEditMode: boolean;
}

const CourseScheduleFormActions = ({
  onCancel,
  isLoading,
  isFormValid,
  isEditMode
}: CourseScheduleFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || !isFormValid}
        className="edu-button"
      >
        {isLoading ? 'Saving...' : isEditMode ? 'Update Schedule' : 'Create Schedule'}
      </Button>
    </div>
  );
};

export default CourseScheduleFormActions;
