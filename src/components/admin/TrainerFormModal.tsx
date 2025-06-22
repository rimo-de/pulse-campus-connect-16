
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trainer ? 'Edit Trainer' : 'Add New Trainer'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <TrainerForm
            trainer={trainer}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerFormModal;
