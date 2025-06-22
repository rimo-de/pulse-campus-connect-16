
import { supabase } from '@/integrations/supabase/client';
import { courseScheduleOperations } from './courseScheduleOperations';

export const courseScheduleStatusService = {
  calculateStatus(startDate: Date, endDate: Date): 'upcoming' | 'ongoing' | 'completed' {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) {
      return 'upcoming';
    } else if (today > end) {
      return 'completed';
    } else {
      return 'ongoing';
    }
  },

  // Update statuses for all schedules (can be called periodically)
  async updateAllStatuses(): Promise<void> {
    const schedules = await courseScheduleOperations.getAllSchedules();
    
    for (const schedule of schedules) {
      const currentStatus = this.calculateStatus(
        new Date(schedule.start_date), 
        new Date(schedule.end_date)
      );
      
      if (currentStatus !== schedule.status) {
        await supabase
          .from('course_schedules')
          .update({ status: currentStatus })
          .eq('id', schedule.id);
      }
    }
  }
};
