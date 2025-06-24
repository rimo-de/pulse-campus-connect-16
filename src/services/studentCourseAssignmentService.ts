import { supabase } from '@/integrations/supabase/client';
import type { StudentCourseAssignment } from '@/types/student';
import type { CourseSchedule } from '@/types/course';

export const studentCourseAssignmentService = {
  async getAssignmentsBySchedule(scheduleId: string): Promise<StudentCourseAssignment[]> {
    const { data, error } = await supabase
      .from('student_course_assignments')
      .select(`
        *,
        student:student_headers (
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
        )
      `)
      .eq('schedule_id', scheduleId)
      .order('enrollment_date', { ascending: false });

    if (error) {
      console.error('Error fetching schedule assignments:', error);
      throw new Error('Failed to fetch schedule assignments');
    }

    // Transform the joined data to match CompleteStudent interface
    return (data || []).map(assignment => ({
      ...assignment,
      student: assignment.student ? {
        id: assignment.student.id,
        first_name: assignment.student.first_name,
        last_name: assignment.student.last_name,
        gender: assignment.student.gender || '',
        email: assignment.student.email,
        mobile_number: assignment.student.mobile_number || '',
        nationality: assignment.student.nationality,
        street: assignment.student.student_addresses?.[0]?.street || '',
        postal_code: assignment.student.student_addresses?.[0]?.postal_code || '',
        city: assignment.student.student_addresses?.[0]?.city || '',
        education_background: assignment.student.student_enrollments?.[0]?.education_background || '',
        english_proficiency: assignment.student.student_enrollments?.[0]?.english_proficiency || '',
        german_proficiency: assignment.student.student_enrollments?.[0]?.german_proficiency || '',
        created_at: assignment.student.created_at,
        updated_at: assignment.student.updated_at,
      } : undefined
    })) as StudentCourseAssignment[];
  },

  async getAssignmentsByStudent(studentEmail: string): Promise<StudentCourseAssignment[]> {
    // First get the student by email
    const { data: studentData, error: studentError } = await supabase
      .from('student_headers')
      .select('id')
      .eq('email', studentEmail)
      .single();

    if (studentError || !studentData) {
      console.log('Student not found:', studentEmail);
      return [];
    }

    // Get assignments for this specific student
    const { data, error } = await supabase
      .from('student_course_assignments')
      .select(`
        *,
        student:student_headers (
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
        )
      `)
      .eq('student_id', studentData.id)
      .order('enrollment_date', { ascending: false });

    if (error) {
      console.error('Error fetching student assignments:', error);
      throw new Error('Failed to fetch student assignments');
    }

    // Transform the joined data to match CompleteStudent interface
    return (data || []).map(assignment => ({
      ...assignment,
      student: assignment.student ? {
        id: assignment.student.id,
        first_name: assignment.student.first_name,
        last_name: assignment.student.last_name,
        gender: assignment.student.gender || '',
        email: assignment.student.email,
        mobile_number: assignment.student.mobile_number || '',
        nationality: assignment.student.nationality,
        street: assignment.student.student_addresses?.[0]?.street || '',
        postal_code: assignment.student.student_addresses?.[0]?.postal_code || '',
        city: assignment.student.student_addresses?.[0]?.city || '',
        education_background: assignment.student.student_enrollments?.[0]?.education_background || '',
        english_proficiency: assignment.student.student_enrollments?.[0]?.english_proficiency || '',
        german_proficiency: assignment.student.student_enrollments?.[0]?.german_proficiency || '',
        created_at: assignment.student.created_at,
        updated_at: assignment.student.updated_at,
      } : undefined
    })) as StudentCourseAssignment[];
  },

  async getSchedulesByStudent(studentEmail: string): Promise<CourseSchedule[]> {
    // First get the student by email
    const { data: studentData, error: studentError } = await supabase
      .from('student_headers')
      .select('id')
      .eq('email', studentEmail)
      .single();

    if (studentError || !studentData) {
      console.log('Student not found:', studentEmail);
      return [];
    }

    // Get schedules for courses assigned to this student
    const { data, error } = await supabase
      .from('student_course_assignments')
      .select(`
        schedule_id,
        course_schedules!inner (
          *,
          course:courses (*),
          course_offering:course_offerings (
            *,
            delivery_mode:delivery_modes (*)
          )
        )
      `)
      .eq('student_id', studentData.id);

    if (error) {
      console.error('Error fetching student schedules:', error);
      throw new Error('Failed to fetch student schedules');
    }

    // Extract the course schedules and properly type the status field
    return (data || []).map(item => ({
      ...item.course_schedules,
      status: item.course_schedules.status as 'upcoming' | 'ongoing' | 'completed'
    }));
  },

  async assignStudentsToSchedule(scheduleId: string, studentIds: string[]): Promise<void> {
    const assignments = studentIds.map(studentId => ({
      student_id: studentId,
      schedule_id: scheduleId,
      enrollment_date: new Date().toISOString(),
      status: 'enrolled' as const
    }));

    const { error } = await supabase
      .from('student_course_assignments')
      .insert(assignments);

    if (error) {
      console.error('Error assigning students to schedule:', error);
      throw new Error('Failed to assign students to schedule');
    }
  },

  async removeStudentFromSchedule(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('student_course_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Error removing student from schedule:', error);
      throw new Error('Failed to remove student from schedule');
    }
  },

  async updateAssignmentStatus(assignmentId: string, status: 'enrolled' | 'completed' | 'dropped'): Promise<void> {
    const { error } = await supabase
      .from('student_course_assignments')
      .update({ status })
      .eq('id', assignmentId);

    if (error) {
      console.error('Error updating assignment status:', error);
      throw new Error('Failed to update assignment status');
    }
  }
};
