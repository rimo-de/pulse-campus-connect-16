
export interface Course {
  id: string;
  course_title: string;
  course_description?: string | null;
  curriculum_file_name?: string | null;
  curriculum_file_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryMode {
  id: string;
  name: string;
  delivery_method: string; // Changed from literal union to string
  delivery_type: string; // Changed from literal union to string
  default_duration_days: number;
  default_units: number;
  base_fee: number;
  created_at: string;
  updated_at: string;
}

export interface CourseOffering {
  id: string;
  course_id: string;
  delivery_mode_id: string;
  massnahmenummer?: string | null;
  duration_days: number;
  units: number;
  fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  delivery_mode?: DeliveryMode;
}

export interface CourseWithOfferings extends Course {
  course_offerings: CourseOffering[];
}

export interface CourseFormData {
  course_title: string;
  course_description: string;
  curriculum_file: File | null;
  offerings: CourseOfferingFormData[];
}

export interface CourseOfferingFormData {
  delivery_mode_id: string;
  massnahmenummer: string;
  duration_days: number;
  fee: number;
  is_active: boolean;
}
