
import { supabase } from '@/integrations/supabase/client';
import { CompleteStudent } from '@/types/student';
import { studentTransformers } from './studentTransformers';

export const studentQueries = {
  async getAllStudents(): Promise<{ data: CompleteStudent[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('student_headers')
        .select(`
          id,
          first_name,
          last_name,
          gender,
          email,
          mobile_number,
          nationality,
          created_at,
          updated_at,
          student_addresses (
            street,
            postal_code,
            city
          ),
          student_enrollments (
            education_background,
            english_proficiency,
            german_proficiency
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        return { data: [], error: error.message };
      }

      const students = studentTransformers.transformJoinedDataToStudents(data);
      return { data: students };
    } catch (error) {
      console.error('Unexpected error fetching students:', error);
      return { data: [], error: 'An unexpected error occurred' };
    }
  },

  async getStudentById(studentId: string): Promise<{ data?: CompleteStudent; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('student_headers')
        .select(`
          id,
          first_name,
          last_name,
          gender,
          email,
          mobile_number,
          nationality,
          created_at,
          updated_at,
          student_addresses (
            street,
            postal_code,
            city
          ),
          student_enrollments (
            education_background,
            english_proficiency,
            german_proficiency
          )
        `)
        .eq('id', studentId)
        .single();

      if (error) {
        console.error('Error fetching student:', error);
        return { error: error.message };
      }

      const student = studentTransformers.transformJoinedDataToStudent(data);
      return { data: student };
    } catch (error) {
      console.error('Unexpected error fetching student:', error);
      return { error: 'An unexpected error occurred' };
    }
  }
};
