
export interface Course {
  id: string;
  course_title: string;
  course_description?: string;
  massnahmenummer?: string;
  number_of_days?: number;
  delivery_mode?: 'Online' | 'Remote';
  delivery_type?: 'Full time' | 'Part time';
  curriculum_file_name?: string;
  curriculum_file_path?: string;
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
