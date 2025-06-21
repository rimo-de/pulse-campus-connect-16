
import { supabase } from '@/integrations/supabase/client';
import type { CourseSchedule, CourseScheduleFormData } from '@/types/course';
import { holidayService } from './holidayService';

export const courseScheduleService = {
  async getAllSchedules(): Promise<CourseSchedule[]> {
    const { data, error } = await supabase
      .from('course_schedules')
      .select(`
        *,
        course:courses (*),
        course_offering:course_offerings (
          *,
          delivery_mode:delivery_modes (*)
        )
      `)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching course schedules:', error);
      throw new Error('Failed to fetch course schedules');
    }

    return (data || []) as CourseSchedule[];
  },

  async getSchedulesByStatus(status: 'upcoming' | 'ongoing' | 'completed'): Promise<CourseSchedule[]> {
    const { data, error } = await supabase
      .from('course_schedules')
      .select(`
        *,
        course:courses (*),
        course_offering:course_offerings (
          *,
          delivery_mode:delivery_modes (*)
        )
      `)
      .eq('status', status)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching course schedules by status:', error);
      throw new Error('Failed to fetch course schedules');
    }

    return (data || []) as CourseSchedule[];
  },

  async createSchedule(scheduleData: CourseScheduleFormData): Promise<CourseSchedule> {
    console.log('Creating course schedule with data:', scheduleData);

    // Get the course offering to determine duration
    const { data: offeringData, error: offeringError } = await supabase
      .from('course_offerings')
      .select('duration_days')
      .eq('id', scheduleData.course_offering_id)
      .single();

    if (offeringError || !offeringData) {
      throw new Error('Failed to fetch course offering details');
    }

    // Calculate end date using holiday service
    const dateCalculation = await holidayService.calculateEndDate(
      scheduleData.start_date,
      offeringData.duration_days
    );

    const { data, error } = await supabase
      .from('course_schedules')
      .insert({
        course_id: scheduleData.course_id,
        course_offering_id: scheduleData.course_offering_id,
        start_date: scheduleData.start_date.toISOString().split('T')[0],
        end_date: dateCalculation.end_date.toISOString().split('T')[0],
        instructor_id: scheduleData.instructor_id || null,
        status: this.calculateStatus(scheduleData.start_date, dateCalculation.end_date)
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course schedule:', error);
      throw new Error('Failed to create course schedule');
    }

    return data as CourseSchedule;
  },

  async updateSchedule(id: string, scheduleData: Partial<CourseScheduleFormData>): Promise<CourseSchedule> {
    let updateData: any = {};

    if (scheduleData.course_id) updateData.course_id = scheduleData.course_id;
    if (scheduleData.course_offering_id) updateData.course_offering_id = scheduleData.course_offering_id;
    if (scheduleData.instructor_id !== undefined) updateData.instructor_id = scheduleData.instructor_id;

    // If start date or offering changes, recalculate end date
    if (scheduleData.start_date || scheduleData.course_offering_id) {
      const startDate = scheduleData.start_date || new Date(); // Would need to get current start date
      
      let durationDays = 0;
      if (scheduleData.course_offering_id) {
        const { data: offeringData } = await supabase
          .from('course_offerings')
          .select('duration_days')
          .eq('id', scheduleData.course_offering_id)
          .single();
        
        durationDays = offeringData?.duration_days || 0;
      }

      if (durationDays > 0) {
        const dateCalculation = await holidayService.calculateEndDate(startDate, durationDays);
        updateData.start_date = startDate.toISOString().split('T')[0];
        updateData.end_date = dateCalculation.end_date.toISOString().split('T')[0];
        updateData.status = this.calculateStatus(startDate, dateCalculation.end_date);
      }
    }

    const { data, error } = await supabase
      .from('course_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course schedule:', error);
      throw new Error('Failed to update course schedule');
    }

    return data as CourseSchedule;
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('course_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course schedule:', error);
      throw new Error('Failed to delete course schedule');
    }
  },

  async duplicateSchedule(scheduleId: string, newStartDate: Date): Promise<CourseSchedule> {
    // Get the original schedule
    const { data: originalSchedule, error } = await supabase
      .from('course_schedules')
      .select('*, course_offering:course_offerings (duration_days)')
      .eq('id', scheduleId)
      .single();

    if (error || !originalSchedule) {
      throw new Error('Failed to fetch original schedule');
    }

    // Create new schedule with new start date
    const scheduleData: CourseScheduleFormData = {
      course_id: originalSchedule.course_id,
      course_offering_id: originalSchedule.course_offering_id,
      start_date: newStartDate,
      instructor_id: originalSchedule.instructor_id
    };

    return this.createSchedule(scheduleData);
  },

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
    const schedules = await this.getAllSchedules();
    
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
