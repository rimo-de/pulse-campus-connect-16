
import { supabase } from '@/integrations/supabase/client';

export const trainerAssignments = {
  async getAssignedTrainers(scheduleId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('trainer_assignments')
        .select('*')
        .eq('schedule_id', scheduleId);

      if (error) {
        console.error('Error fetching assigned trainers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching assigned trainers:', error);
      return [];
    }
  },

  async updateTrainerAssignments(scheduleId: string, trainerIds: string[]): Promise<void> {
    try {
      // First, remove existing assignments
      const { error: deleteError } = await supabase
        .from('trainer_assignments')
        .delete()
        .eq('schedule_id', scheduleId);

      if (deleteError) {
        console.error('Error removing existing assignments:', deleteError);
        throw new Error('Failed to remove existing trainer assignments');
      }

      // Then add new assignments
      if (trainerIds.length > 0) {
        const assignments = trainerIds.map(trainerId => ({
          schedule_id: scheduleId,
          trainer_id: trainerId
        }));

        const { error } = await supabase
          .from('trainer_assignments')
          .insert(assignments);

        if (error) {
          console.error('Error updating trainer assignments:', error);
          throw new Error('Failed to update trainer assignments');
        }
      }
    } catch (error) {
      console.error('Error updating trainer assignments:', error);
      throw new Error('Failed to update trainer assignments');
    }
  },

  async getAllTrainerAssignments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('trainer_assignments')
        .select(`
          *,
          trainer:trainers (
            first_name,
            last_name,
            email,
            experience_level,
            expertise_course:courses (
              course_title
            )
          ),
          course_schedule:course_schedules (
            start_date,
            end_date,
            status,
            course:courses (
              course_title
            ),
            course_offering:course_offerings (
              delivery_mode:delivery_modes (
                name,
                delivery_method,
                delivery_type
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trainer assignments:', error);
        throw new Error('Failed to fetch trainer assignments');
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching trainer assignments:', error);
      return [];
    }
  },

  async removeTrainerAssignment(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('trainer_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error removing trainer assignment:', error);
      throw new Error('Failed to remove trainer assignment');
    }
  }
};
