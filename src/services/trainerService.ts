
import { supabase } from '@/integrations/supabase/client';
import type { Trainer, TrainerFormData, TrainerFile, TrainerWithFiles } from '@/types/trainer';

export const trainerService = {
  // Get all trainers with their expertise course info
  async getAllTrainers(): Promise<Trainer[]> {
    const { data, error } = await supabase
      .from('trainers')
      .select(`
        *,
        expertise_course:courses(course_title)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get trainer by ID with files
  async getTrainerById(id: string): Promise<TrainerWithFiles | null> {
    const { data, error } = await supabase
      .from('trainers')
      .select(`
        *,
        expertise_course:courses(course_title),
        trainer_files(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new trainer
  async createTrainer(trainerData: TrainerFormData): Promise<Trainer> {
    const { data, error } = await supabase
      .from('trainers')
      .insert([trainerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update trainer
  async updateTrainer(id: string, trainerData: Partial<TrainerFormData>): Promise<Trainer> {
    const { data, error } = await supabase
      .from('trainers')
      .update(trainerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete trainer
  async deleteTrainer(id: string): Promise<void> {
    const { error } = await supabase
      .from('trainers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Upload trainer file
  async uploadTrainerFile(
    trainerId: string,
    file: File,
    fileType: 'Profile' | 'Photo' | 'Certificate'
  ): Promise<TrainerFile> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${trainerId}/${fileType}_${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('trainer-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save file record to database
    const { data, error } = await supabase
      .from('trainer_files')
      .insert([{
        trainer_id: trainerId,
        file_name: file.name,
        file_path: fileName,
        file_type: fileType,
        file_size: file.size,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete trainer file
  async deleteTrainerFile(fileId: string): Promise<void> {
    // Get file info first
    const { data: fileData, error: fetchError } = await supabase
      .from('trainer_files')
      .select('file_path')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('trainer-files')
      .remove([fileData.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error } = await supabase
      .from('trainer_files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  },

  // Get file URL
  getFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('trainer-files')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
};
