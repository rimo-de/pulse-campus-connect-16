
import { supabase } from '@/integrations/supabase/client';
import type { Trainer, TrainerFile, TrainerWithFiles, TrainerFormData } from '@/types/trainer';

export const TrainerService = {
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
  },

  // Trainer assignment methods
  async getAssignedTrainers(scheduleId: string): Promise<any[]> {
    // Use rpc or direct query with type assertion since trainer_assignments might not be in types yet
    const { data, error } = await supabase
      .rpc('get_assigned_trainers_for_schedule', { schedule_id: scheduleId })
      .then(result => result)
      .catch(async () => {
        // Fallback to direct query if RPC doesn't exist
        return await (supabase as any)
          .from('trainer_assignments')
          .select('*')
          .eq('schedule_id', scheduleId);
      });

    if (error) {
      console.error('Error fetching assigned trainers:', error);
      return [];
    }

    return data || [];
  },

  async updateTrainerAssignments(scheduleId: string, trainerIds: string[]): Promise<void> {
    try {
      // First, remove existing assignments
      await (supabase as any)
        .from('trainer_assignments')
        .delete()
        .eq('schedule_id', scheduleId);

      // Then add new assignments
      if (trainerIds.length > 0) {
        const assignments = trainerIds.map(trainerId => ({
          schedule_id: scheduleId,
          trainer_id: trainerId
        }));

        const { error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
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
    const { error } = await (supabase as any)
      .from('trainer_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error removing trainer assignment:', error);
      throw new Error('Failed to remove trainer assignment');
    }
  },

  async uploadTrainerFile(trainerId: string, file: File, fileType: 'Profile' | 'Photo' | 'Certificate'): Promise<TrainerFile> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${trainerId}/${fileType.toLowerCase()}_${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('trainer-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload file');
    }

    const { data, error } = await supabase
      .from('trainer_files')
      .insert({
        trainer_id: trainerId,
        file_name: file.name,
        file_path: uploadData.path,
        file_type: fileType,
        file_size: file.size
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving file record:', error);
      throw new Error('Failed to save file record');
    }

    return {
      ...data,
      file_type: data.file_type as 'Profile' | 'Photo' | 'Certificate'
    } as TrainerFile;
  },

  async deleteTrainerFile(fileId: string): Promise<void> {
    // First get the file path
    const { data: fileData, error: fetchError } = await supabase
      .from('trainer_files')
      .select('file_path')
      .eq('id', fileId)
      .single();

    if (fetchError) {
      console.error('Error fetching file data:', fetchError);
      throw new Error('Failed to fetch file data');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('trainer-files')
      .remove([fileData.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // Delete record from database
    const { error } = await supabase
      .from('trainer_files')
      .delete()
      .eq('id', fileId);

    if (error) {
      console.error('Error deleting file record:', error);
      throw new Error('Failed to delete file record');
    }
  },

  getFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('trainer-files')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
};
