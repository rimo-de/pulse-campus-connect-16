
import { courseScheduleOperations } from './courseSchedule/courseScheduleOperations';
import { courseScheduleStatusService } from './courseSchedule/courseScheduleStatusService';

// Main service that exports all functionality
export const courseScheduleService = {
  // Operations
  getAllSchedules: courseScheduleOperations.getAllSchedules,
  getSchedulesByStatus: courseScheduleOperations.getSchedulesByStatus,
  createSchedule: courseScheduleOperations.createSchedule,
  updateSchedule: courseScheduleOperations.updateSchedule,
  deleteSchedule: courseScheduleOperations.deleteSchedule,
  duplicateSchedule: courseScheduleOperations.duplicateSchedule,

  // Status management
  calculateStatus: courseScheduleStatusService.calculateStatus,
  updateAllStatuses: courseScheduleStatusService.updateAllStatuses
};
