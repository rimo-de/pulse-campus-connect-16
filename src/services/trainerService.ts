
import { trainerOperations } from './trainer/trainerOperations';
import { trainerAssignments } from './trainer/trainerAssignments';
import { trainerFiles } from './trainer/trainerFiles';

export const TrainerService = {
  // Core trainer operations
  getAllTrainers: trainerOperations.getAllTrainers,
  createTrainer: trainerOperations.createTrainer,
  updateTrainer: trainerOperations.updateTrainer,
  deleteTrainer: trainerOperations.deleteTrainer,

  // Trainer assignment methods
  getAssignedTrainers: trainerAssignments.getAssignedTrainers,
  updateTrainerAssignments: trainerAssignments.updateTrainerAssignments,
  getAllTrainerAssignments: trainerAssignments.getAllTrainerAssignments,
  removeTrainerAssignment: trainerAssignments.removeTrainerAssignment,

  // File operations
  uploadTrainerFile: trainerFiles.uploadTrainerFile,
  deleteTrainerFile: trainerFiles.deleteTrainerFile,
  getFileUrl: trainerFiles.getFileUrl
};
