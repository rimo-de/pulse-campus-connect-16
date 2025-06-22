
import { supabase } from '@/integrations/supabase/client';
import type { Trainer, TrainerFormData, TrainerWithFiles } from '@/types/trainer';

export const trainerOperations = {
  async getAllTrainers(): Promise<{ data: TrainerWithFiles[]; count: number }> {
    const { data, error, count } = await supabase
      .from('trainers')
      .select(`
        *,
        expertise_course:courses (
          course_title
        ),
        trainer_files (*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trainers:', error);
      throw new Error('Failed to fetch trainers');
    }

    // Type assertion with proper casting
    const trainers = (data || []).map(trainer => ({
      ...trainer,
      trainer_files: (trainer.trainer_files || []).map((file: any) => ({
        ...file,
        file_type: file.file_type as 'Profile' | 'Photo' | 'Certificate'
      }))
    })) as TrainerWithFiles[];

    return { data: trainers, count: count || 0 };
  },

  async createTrainer(trainerData: TrainerFormData): Promise<Trainer> {
    const { data, error } = await supabase
      .from('trainers')
      .insert({
        first_name: trainerData.first_name,
        last_name: trainerData.last_name,
        mobile_number: trainerData.mobile_number || null,
        email: trainerData.email,
        expertise_area: trainerData.expertise_area || null,
        experience_level: trainerData.experience_level
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trainer:', error);
      throw new Error('Failed to create trainer');
    }

    return data as Trainer;
  },

  async updateTrainer(id: string, trainerData: Partial<TrainerFormData>): Promise<Trainer> {
    const updateData: any = {};
    
    if (trainerData.first_name !== undefined) updateData.first_name = trainerData.first_name;
    if (trainerData.last_name !== undefined) updateData.last_name = trainerData.last_name;
    if (trainerData.mobile_number !== undefined) updateData.mobile_number = trainerData.mobile_number || null;
    if (trainerData.email !== undefined) updateData.email = trainerData.email;
    if (trainerData.expertise_area !== undefined) updateData.expertise_area = trainerData.expertise_area || null;
    if (trainerData.experience_level !== undefined) updateData.experience_level = trainerData.experience_level;

    const { data, error } = await supabase
      .from('trainers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trainer:', error);
      throw new Error('Failed to update trainer');
    }

    return data as Trainer;
  },

  async deleteTrainer(id: string): Promise<void> {
    const { error } = await supabase
      .from('trainers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trainer:', error);
      throw new Error('Failed to delete trainer');
    }
  }
};
