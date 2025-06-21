
import { supabase } from '@/integrations/supabase/client';
import { StudentFormData, CompleteStudent } from '@/types/student';

export class StudentService {
  // Create a new student with data across all three tables
  static async createStudent(data: StudentFormData): Promise<{ success: boolean; error?: string }> {
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
  }

  // Update student data across all three tables
  static async updateStudent(studentId: string, data: StudentFormData): Promise<{ success: boolean; error?: string }> {
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
  }

  // Fetch all students with joined data
  static async getAllStudents(): Promise<{ data: CompleteStudent[]; error?: string }> {
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

      // Transform the joined data to flat structure
      const students: CompleteStudent[] = data.map(student => ({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        gender: student.gender || '',
        email: student.email,
        mobile_number: student.mobile_number || '',
        nationality: student.nationality,
        street: student.student_addresses?.[0]?.street || '',
        postal_code: student.student_addresses?.[0]?.postal_code || '',
        city: student.student_addresses?.[0]?.city || '',
        education_background: student.student_enrollments?.[0]?.education_background || '',
        english_proficiency: student.student_enrollments?.[0]?.english_proficiency || '',
        german_proficiency: student.student_enrollments?.[0]?.german_proficiency || '',
        created_at: student.created_at,
        updated_at: student.updated_at,
      }));

      return { data: students };
    } catch (error) {
      console.error('Unexpected error fetching students:', error);
      return { data: [], error: 'An unexpected error occurred' };
    }
  }

  // Delete student (CASCADE will handle related records)
  static async deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
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

  // Get single student by ID
  static async getStudentById(studentId: string): Promise<{ data?: CompleteStudent; error?: string }> {
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

      const student: CompleteStudent = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender || '',
        email: data.email,
        mobile_number: data.mobile_number || '',
        nationality: data.nationality,
        street: data.student_addresses?.[0]?.street || '',
        postal_code: data.student_addresses?.[0]?.postal_code || '',
        city: data.student_addresses?.[0]?.city || '',
        education_background: data.student_enrollments?.[0]?.education_background || '',
        english_proficiency: data.student_enrollments?.[0]?.english_proficiency || '',
        german_proficiency: data.student_enrollments?.[0]?.german_proficiency || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return { data: student };
    } catch (error) {
      console.error('Unexpected error fetching student:', error);
      return { error: 'An unexpected error occurred' };
    }
  }
}
