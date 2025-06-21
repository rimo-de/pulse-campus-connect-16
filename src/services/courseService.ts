
import { supabase } from '@/integrations/supabase/client';
import type { Course, CourseFormData, DeliveryMode, CourseOffering, CourseWithOfferings } from '@/types/course';

export const courseService = {
  async getAllCourses(): Promise<CourseWithOfferings[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_offerings (
          *,
          delivery_mode:delivery_modes (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }

    return (data || []) as CourseWithOfferings[];
  },

  async getCourse(id: string): Promise<CourseWithOfferings | null> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_offerings (
          *,
          delivery_mode:delivery_modes (*)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course');
    }

    return data as CourseWithOfferings | null;
  },

  async getDeliveryModes(): Promise<DeliveryMode[]> {
    console.log('Fetching delivery modes from database...');
    
    // Calculate base unit fee from base_fee and default_units
    const { data, error } = await supabase
      .from('delivery_modes')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching delivery modes:', error);
      throw new Error('Failed to fetch delivery modes');
    }

    // Add calculated unit_fee to each delivery mode
    const modesWithUnitFee = (data || []).map(mode => ({
      ...mode,
      unit_fee: mode.default_units > 0 ? mode.base_fee / mode.default_units : 0
    }));

    console.log('Delivery modes with unit fee:', modesWithUnitFee);
    return modesWithUnitFee as DeliveryMode[];
  },

  async createCourse(courseData: CourseFormData): Promise<Course> {
    console.log('Creating course with data:', courseData);
    
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

    // Create the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        course_title: courseData.course_title,
        course_description: courseData.course_description,
        curriculum_file_name,
        curriculum_file_path,
      })
      .select()
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      throw new Error('Failed to create course');
    }

    console.log('Course created successfully:', course);

    // Create course offerings
    if (courseData.offerings && courseData.offerings.length > 0) {
      console.log('Creating course offerings:', courseData.offerings);
      
      const offerings = courseData.offerings.map(offering => ({
        course_id: course.id,
        delivery_mode_id: offering.delivery_mode_id,
        massnahmenummer: offering.massnahmenummer || null,
        duration_days: offering.duration_days,
        unit_fee: offering.unit_fee,
        fee: offering.fee, // This should be calculated as units * unit_fee
        is_active: offering.is_active,
      }));

      console.log('Inserting offerings:', offerings);

      const { error: offeringsError } = await supabase
        .from('course_offerings')
        .insert(offerings);

      if (offeringsError) {
        console.error('Error creating course offerings:', offeringsError);
        // If course offerings fail, we should delete the course to maintain consistency
        await supabase.from('courses').delete().eq('id', course.id);
        throw new Error('Failed to create course offerings');
      }

      console.log('Course offerings created successfully');
    }

    return course;
  },

  async updateCourse(id: string, courseData: Partial<CourseFormData>): Promise<Course> {
    let updateData: any = {
      course_title: courseData.course_title,
      course_description: courseData.course_description,
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

    // Update course offerings if provided
    if (courseData.offerings) {
      // Delete existing offerings
      await supabase
        .from('course_offerings')
        .delete()
        .eq('course_id', id);

      // Insert new offerings
      if (courseData.offerings.length > 0) {
        const offerings = courseData.offerings.map(offering => ({
          course_id: id,
          delivery_mode_id: offering.delivery_mode_id,
          massnahmenummer: offering.massnahmenummer || null,
          duration_days: offering.duration_days,
          unit_fee: offering.unit_fee,
          fee: offering.fee, // This should be calculated as units * unit_fee
          is_active: offering.is_active,
        }));

        const { error: offeringsError } = await supabase
          .from('course_offerings')
          .insert(offerings);

        if (offeringsError) {
          console.error('Error updating course offerings:', offeringsError);
          throw new Error('Failed to update course offerings');
        }
      }
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
