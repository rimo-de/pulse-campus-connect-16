
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
        trainer_files (*),
        trainer_skills (*),
        trainer_documents (*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trainers:', error);
      throw new Error('Failed to fetch trainers');
    }

    const trainers = (data || []).map(trainer => ({
      ...trainer,
      trainer_files: trainer.trainer_files || [],
      trainer_skills: trainer.trainer_skills || [],
      trainer_documents: trainer.trainer_documents || []
    })) as TrainerWithFiles[];

    return { data: trainers, count: count || 0 };
  },

  async createTrainer(trainerData: TrainerFormData & { skills?: string[] }): Promise<Trainer> {
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

    // Add skills if provided
    if (trainerData.skills && trainerData.skills.length > 0) {
      const skillsData = trainerData.skills.map(skill => ({
        trainer_id: trainer.id,
        skill: skill
      }));

      const { error: skillsError } = await supabase
        .from('trainer_skills')
        .insert(skillsData);

      if (skillsError) {
        console.error('Error adding trainer skills:', skillsError);
      }
    }

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

    // Update skills if provided
    if (trainerData.skills !== undefined) {
      // First, remove existing skills
      await supabase
        .from('trainer_skills')
        .delete()
        .eq('trainer_id', id);

      // Then add new skills
      if (trainerData.skills.length > 0) {
        const skillsData = trainerData.skills.map(skill => ({
          trainer_id: id,
          skill: skill
        }));

        const { error: skillsError } = await supabase
          .from('trainer_skills')
          .insert(skillsData);

        if (skillsError) {
          console.error('Error updating trainer skills:', skillsError);
        }
      }
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
