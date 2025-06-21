
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
  delivery_method: string;
  delivery_type: string;
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
  unit_fee: number;
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
  unit_fee: number;
  fee: number;
  is_active: boolean;
}

// New interfaces for course scheduling
export interface CourseSchedule {
  id: string;
  course_id: string;
  course_offering_id: string;
  start_date: string;
  end_date: string;
  instructor_id?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  created_at: string;
  updated_at: string;
  course?: Course;
  course_offering?: CourseOffering;
}

export interface CourseScheduleFormData {
  course_id: string;
  course_offering_id: string;
  start_date: Date;
  instructor_id?: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: string;
}

export interface DateCalculationResult {
  end_date: Date;
  total_calendar_days: number;
  working_days: number;
  holidays_skipped: Holiday[];
  weekends_skipped: number;
}
