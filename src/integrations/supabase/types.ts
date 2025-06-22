export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_assets: {
        Row: {
          asset_id: string
          course_id: string
          created_at: string
          id: string
        }
        Insert: {
          asset_id: string
          course_id: string
          created_at?: string
          id?: string
        }
        Update: {
          asset_id?: string
          course_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assets_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_offerings: {
        Row: {
          course_id: string
          created_at: string
          delivery_mode_id: string
          duration_days: number
          fee: number | null
          id: string
          is_active: boolean | null
          massnahmenummer: string | null
          unit_fee: number | null
          units: number | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          delivery_mode_id: string
          duration_days: number
          fee?: number | null
          id?: string
          is_active?: boolean | null
          massnahmenummer?: string | null
          unit_fee?: number | null
          units?: number | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          delivery_mode_id?: string
          duration_days?: number
          fee?: number | null
          id?: string
          is_active?: boolean | null
          massnahmenummer?: string | null
          unit_fee?: number | null
          units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_offerings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_offerings_delivery_mode_id_fkey"
            columns: ["delivery_mode_id"]
            isOneToOne: false
            referencedRelation: "delivery_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      course_schedules: {
        Row: {
          course_id: string
          course_offering_id: string
          created_at: string
          end_date: string
          id: string
          instructor_id: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          course_id: string
          course_offering_id: string
          created_at?: string
          end_date: string
          id?: string
          instructor_id?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          course_offering_id?: string
          created_at?: string
          end_date?: string
          id?: string
          instructor_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_schedules_course_offering_id_fkey"
            columns: ["course_offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_description: string | null
          course_title: string
          created_at: string
          curriculum_file_name: string | null
          curriculum_file_path: string | null
          id: string
          updated_at: string
        }
        Insert: {
          course_description?: string | null
          course_title: string
          created_at?: string
          curriculum_file_name?: string | null
          curriculum_file_path?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          course_description?: string | null
          course_title?: string
          created_at?: string
          curriculum_file_name?: string | null
          curriculum_file_path?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_modes: {
        Row: {
          base_fee: number | null
          created_at: string
          default_duration_days: number
          default_units: number | null
          delivery_method: string
          delivery_type: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          base_fee?: number | null
          created_at?: string
          default_duration_days?: number
          default_units?: number | null
          delivery_method: string
          delivery_type: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          base_fee?: number | null
          created_at?: string
          default_duration_days?: number
          default_units?: number | null
          delivery_method?: string
          delivery_type?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          postal_code: string
          street: string
          student_id: string
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          postal_code: string
          street: string
          student_id: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          postal_code?: string
          street?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_addresses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_headers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_course_assignments: {
        Row: {
          created_at: string
          enrollment_date: string
          id: string
          schedule_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enrollment_date?: string
          id?: string
          schedule_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enrollment_date?: string
          id?: string
          schedule_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_course_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_course_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_headers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          created_at: string
          education_background: string | null
          english_proficiency: string | null
          german_proficiency: string | null
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          education_background?: string | null
          english_proficiency?: string | null
          german_proficiency?: string | null
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          education_background?: string | null
          english_proficiency?: string | null
          german_proficiency?: string | null
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_headers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_headers: {
        Row: {
          created_at: string
          email: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          mobile_number: string | null
          nationality: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          mobile_number?: string | null
          nationality: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          mobile_number?: string | null
          nationality?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainer_assignments: {
        Row: {
          created_at: string
          id: string
          schedule_id: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          schedule_id: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          schedule_id?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_documents: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_documents_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_files_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_skills: {
        Row: {
          created_at: string
          id: string
          skill: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          skill?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_skills_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          created_at: string
          email: string
          experience_level: string
          expertise_area: string | null
          first_name: string
          id: string
          last_name: string
          mobile_number: string | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          experience_level: string
          expertise_area?: string | null
          first_name: string
          id?: string
          last_name: string
          mobile_number?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          experience_level?: string
          expertise_area?: string | null
          first_name?: string
          id?: string
          last_name?: string
          mobile_number?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainers_expertise_area_fkey"
            columns: ["expertise_area"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
