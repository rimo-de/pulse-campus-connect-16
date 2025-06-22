
import { supabase } from '@/integrations/supabase/client';
import type { TrainerFile } from '@/types/trainer';

export const trainerFiles = {
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
