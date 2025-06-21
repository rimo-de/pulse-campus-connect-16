
export interface Course {
  id: string;
  course_title: string;
  course_description?: string | null;
  massnahmenummer?: string | null;
  number_of_days?: number | null;
  delivery_mode?: string | null;
  delivery_type?: string | null;
  curriculum_file_name?: string | null;
  curriculum_file_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseFormData {
  course_title: string;
  course_description: string;
  massnahmenummer: string;
  number_of_days: number;
  delivery_mode: 'Online' | 'Remote';
  delivery_type: 'Full time' | 'Part time';
  curriculum_file: File | null;
}
