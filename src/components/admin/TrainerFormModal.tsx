
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TrainerForm from './TrainerForm';
import type { Trainer } from '@/types/trainer';

interface TrainerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer?: Trainer | null;
  onSuccess: () => void;
}

const TrainerFormModal = ({ isOpen, onClose, trainer, onSuccess }: TrainerFormModalProps) => {
  console.log('TrainerFormModal rendered with:', { isOpen, trainer: trainer?.id });

  const handleSuccess = () => {
    console.log('TrainerFormModal: Success callback triggered');
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    console.log('TrainerFormModal: Close callback triggered');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            {trainer ? 'Edit Trainer' : 'Add New Trainer'}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="mt-4">
          <TrainerForm
            trainer={trainer}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TrainerFormModal;
