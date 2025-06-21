
import { supabase } from '@/integrations/supabase/client';
import type { Course, CourseFormData } from '@/types/course';

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }

    return data || [];
  },

  async getCourse(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }

    return data;
  },

  async createCourse(courseData: CourseFormData): Promise<Course> {
    let curriculum_file_name = null;
    let curriculum_file_path = null;

    // Upload curriculum file if provided
    if (courseData.curriculum_file) {
      const fileExt = courseData.curriculum_file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-curriculum')
        .upload(fileName, courseData.curriculum_file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Failed to upload curriculum file');
      }

      curriculum_file_name = courseData.curriculum_file.name;
      curriculum_file_path = fileName;
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        course_title: courseData.course_title,
        course_description: courseData.course_description,
        massnahmenummer: courseData.massnahmenummer,
        number_of_days: courseData.number_of_days,
        delivery_mode: courseData.delivery_mode,
        delivery_type: courseData.delivery_type,
        curriculum_file_name,
        curriculum_file_path,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }

    return data;
  },

  async updateCourse(id: string, courseData: Partial<CourseFormData>): Promise<Course> {
    let updateData: any = {
      course_title: courseData.course_title,
      course_description: courseData.course_description,
      massnahmenummer: courseData.massnahmenummer,
      number_of_days: courseData.number_of_days,
      delivery_mode: courseData.delivery_mode,
      delivery_type: courseData.delivery_type,
    };

    // Upload new curriculum file if provided
    if (courseData.curriculum_file) {
      const fileExt = courseData.curriculum_file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-curriculum')
        .upload(fileName, courseData.curriculum_file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Failed to upload curriculum file');
      }

      updateData.curriculum_file_name = courseData.curriculum_file.name;
      updateData.curriculum_file_path = fileName;
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }

    return data;
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  },

  getCurriculumFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('course-curriculum')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
};
