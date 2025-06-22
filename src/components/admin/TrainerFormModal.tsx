
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

interface Tra

DialogProps {
  isOpen: boolean;
  onClose: () => void;
  trainer?: Trainer | null;
  onSuccess: () => void;
}

const TrainerFormModal = ({ isOpen, onClose, trainer, onSuccess }: TrainerFormModalProps) => {
  const handleSuccess = () => {
    console.log('Trainer form completed successfully');
    onSuccess();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trainer ? 'Edit Trainer' : 'Add New Trainer'}
          </DialogTitle>
          <DialogDescription>
            {trainer ? 'Update trainer information, skills, and documents.' : 'Create a new trainer profile with their details, skills, and documents.'}
          </DialogDescription>
        </DialogHeader>
        
        <TrainerForm
          trainer={trainer}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TrainerFormModal;
