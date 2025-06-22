
import { CompleteStudent } from '@/types/student';

type JoinedStudentData = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  email: string;
  mobile_number: string | null;
  nationality: string;
  created_at: string;
  updated_at: string;
  student_addresses: Array<{
    street: string;
    postal_code: string;
    city: string;
  }> | null;
  student_enrollments: Array<{
    education_background: string;
    english_proficiency: string;
    german_proficiency: string;
  }> | null;
};

export const studentTransformers = {
  transformJoinedDataToStudent(data: JoinedStudentData): CompleteStudent {
    return {
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
  },

  transformJoinedDataToStudents(data: JoinedStudentData[]): CompleteStudent[] {
    return data.map(student => this.transformJoinedDataToStudent(student));
  }
};
