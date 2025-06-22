
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

    // Type assertion with proper casting - simplified for current schema
    const trainers = (data || []).map(trainer => ({
      ...trainer,
      trainer_files: (trainer.trainer_files || []).map((file: any) => ({
        ...file,
        file_type: file.file_type as 'Profile' | 'Photo' | 'Certificate'
      })),
      // Add empty arrays for features that will be added later
      trainer_skills: [],
      trainer_documents: []
    })) as TrainerWithFiles[];

    return { data: trainers, count: count || 0 };
  },

  async createTrainer(trainerData: TrainerFormData & { skills?: string[] }): Promise<Trainer> {
    // Create the trainer without skills for now (until tables are properly created)
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .insert({
        first_name: trainerData.first_name,
        last_name: trainerData.last_name,
        mobile_number: trainerData.mobile_number || null,
        email: trainerData.email,
        expertise_area: trainerData.expertise_area || null,
        experience_level: trainerData.experience_level,
        profile_image_url: trainerData.profile_image_url || null
      })
      .select()
      .single();

    if (trainerError) {
      console.error('Error creating trainer:', trainerError);
      throw new Error('Failed to create trainer');
    }

    // TODO: Add skills handling once trainer_skills table is properly created
    console.log('Skills will be added once trainer_skills table is available:', trainerData.skills);

    return trainer as Trainer;
  },

  async updateTrainer(id: string, trainerData: Partial<TrainerFormData> & { skills?: string[] }): Promise<Trainer> {
    const updateData: any = {};
    
    if (trainerData.first_name !== undefined) updateData.first_name = trainerData.first_name;
    if (trainerData.last_name !== undefined) updateData.last_name = trainerData.last_name;
    if (trainerData.mobile_number !== undefined) updateData.mobile_number = trainerData.mobile_number || null;
    if (trainerData.email !== undefined) updateData.email = trainerData.email;
    if (trainerData.expertise_area !== undefined) updateData.expertise_area = trainerData.expertise_area || null;
    if (trainerData.experience_level !== undefined) updateData.experience_level = trainerData.experience_level;
    if (trainerData.profile_image_url !== undefined) updateData.profile_image_url = trainerData.profile_image_url || null;

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

    // TODO: Add skills handling once trainer_skills table is properly created
    console.log('Skills will be updated once trainer_skills table is available:', trainerData.skills);

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
