
import * as z from 'zod';

// Base trainer schema
export const trainerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  mobile_number: z.string().optional(),
  email: z.string().email('Invalid email address'),
  expertise_area: z.string().optional(),
  experience_level: z.enum(['Junior', 'Mid-Level', 'Senior', 'Expert'], {
    required_error: 'Experience level is required'
  }),
});

export type TrainerFormData = z.infer<typeof trainerSchema>;

// Complete trainer interface
export interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  mobile_number?: string | null;
  email: string;
  expertise_area?: string | null;
  experience_level: string;
  created_at: string;
  updated_at: string;
  expertise_course?: {
    course_title: string;
  };
}

// Trainer file interface
export interface TrainerFile {
  id: string;
  trainer_id: string;
  file_name: string;
  file_path: string;
  file_type: 'Profile' | 'Photo' | 'Certificate';
  file_size?: number | null;
  created_at: string;
  updated_at: string;
}

// Complete trainer with files
export interface TrainerWithFiles extends Trainer {
  trainer_files: TrainerFile[];
}
