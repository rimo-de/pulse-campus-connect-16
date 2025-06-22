
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import TrainerForm from './TrainerForm';
import type { Trainer } from '@/types/trainer';

interface TrainerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer?: Trainer | null;
  onSuccess: () => void;
}

const TrainerFormModal = ({ isOpen, onClose, trainer, onSuccess }: TrainerFormModalProps) => {
  console.log('TrainerFormModal: Rendering with:', { isOpen, trainerId: trainer?.id || 'new' });

  const handleSuccess = () => {
    console.log('TrainerFormModal: Success callback triggered');
    onSuccess();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    console.log('TrainerFormModal: Open state changed to:', open);
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trainer ? 'Edit Trainer' : 'Add New Trainer'}
          </DialogTitle>
          <DialogDescription>
            {trainer ? 'Update trainer information and settings.' : 'Create a new trainer profile with their details and expertise.'}
          </DialogDescription>
        </DialogHeader>
        
        {isOpen && (
          <TrainerForm
            trainer={trainer}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrainerFormModal;
