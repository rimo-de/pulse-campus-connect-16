
import * as z from 'zod';

// Individual table schemas
export const studentHeaderSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email address'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
});

export const studentAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
});

export const studentEnrollmentSchema = z.object({
  education_background: z.enum(['school', 'graduation', 'masters', 'phd', 'diploma', 'certification']),
  english_proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  german_proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
});

// Combined form schema
export const studentFormSchema = studentHeaderSchema
  .merge(studentAddressSchema)
  .merge(studentEnrollmentSchema);

export type StudentHeaderData = z.infer<typeof studentHeaderSchema>;
export type StudentAddressData = z.infer<typeof studentAddressSchema>;
export type StudentEnrollmentData = z.infer<typeof studentEnrollmentSchema>;
export type StudentFormData = z.infer<typeof studentFormSchema>;

// Complete student type for display (joined data)
export interface CompleteStudent {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  mobile_number: string;
  nationality: string;
  street: string;
  postal_code: string;
  city: string;
  education_background: string;
  english_proficiency: string;
  german_proficiency: string;
  created_at: string;
  updated_at: string;
}

// New StudentCourseAssignment interface
export interface StudentCourseAssignment {
  id: string;
  student_id: string;
  schedule_id: string;
  enrollment_date: string;
  status: 'enrolled' | 'completed' | 'dropped';
  created_at: string;
  updated_at: string;
  student?: CompleteStudent;
}
