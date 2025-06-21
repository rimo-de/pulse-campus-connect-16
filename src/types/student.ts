
import * as z from 'zod';

export const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email address'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  education_background: z.enum(['school', 'graduation', 'masters', 'phd', 'diploma', 'certification']),
  english_proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  german_proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  street: z.string().min(1, 'Street address is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
});

export type StudentFormData = z.infer<typeof studentSchema>;
