
import { supabase } from '@/integrations/supabase/client';
import { StudentFormData } from '@/types/student';

export const studentOperations = {
  async createStudent(data: StudentFormData): Promise<{ success: boolean; error?: string }> {
    try {
      // Start a transaction by creating the header first
      const { data: headerData, error: headerError } = await supabase
        .from('student_headers')
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender,
          email: data.email,
          mobile_number: data.mobile_number,
          nationality: data.nationality,
        })
        .select('id')
        .single();

      if (headerError) {
        console.error('Error creating student header:', headerError);
        return { success: false, error: headerError.message };
      }

      const studentId = headerData.id;

      // Create address record
      const { error: addressError } = await supabase
        .from('student_addresses')
        .insert({
          student_id: studentId,
          street: data.street,
          postal_code: data.postal_code,
          city: data.city,
        });

      if (addressError) {
        console.error('Error creating student address:', addressError);
        // Cleanup: delete the header record
        await supabase.from('student_headers').delete().eq('id', studentId);
        return { success: false, error: addressError.message };
      }

      // Create enrollment record
      const { error: enrollmentError } = await supabase
        .from('student_enrollments')
        .insert({
          student_id: studentId,
          education_background: data.education_background,
          english_proficiency: data.english_proficiency,
          german_proficiency: data.german_proficiency,
        });

      if (enrollmentError) {
        console.error('Error creating student enrollment:', enrollmentError);
        // Cleanup: delete header and address records
        await supabase.from('student_headers').delete().eq('id', studentId);
        return { success: false, error: enrollmentError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error creating student:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  async updateStudent(studentId: string, data: StudentFormData): Promise<{ success: boolean; error?: string }> {
    try {
      // Update header
      const { error: headerError } = await supabase
        .from('student_headers')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender,
          email: data.email,
          mobile_number: data.mobile_number,
          nationality: data.nationality,
        })
        .eq('id', studentId);

      if (headerError) {
        console.error('Error updating student header:', headerError);
        return { success: false, error: headerError.message };
      }

      // Update address
      const { error: addressError } = await supabase
        .from('student_addresses')
        .update({
          street: data.street,
          postal_code: data.postal_code,
          city: data.city,
        })
        .eq('student_id', studentId);

      if (addressError) {
        console.error('Error updating student address:', addressError);
        return { success: false, error: addressError.message };
      }

      // Update enrollment
      const { error: enrollmentError } = await supabase
        .from('student_enrollments')
        .update({
          education_background: data.education_background,
          english_proficiency: data.english_proficiency,
          german_proficiency: data.german_proficiency,
        })
        .eq('student_id', studentId);

      if (enrollmentError) {
        console.error('Error updating student enrollment:', enrollmentError);
        return { success: false, error: enrollmentError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating student:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  async deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('student_headers')
        .delete()
        .eq('id', studentId);

      if (error) {
        console.error('Error deleting student:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error deleting student:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};
