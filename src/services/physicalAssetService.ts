import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];
type PhysicalAssetInsert = Database['public']['Tables']['physical_assets']['Insert'];
type PhysicalAssetUpdate = Database['public']['Tables']['physical_assets']['Update'];
type AssetAssignment = Database['public']['Tables']['asset_assignments']['Row'];
type AssetAssignmentInsert = Database['public']['Tables']['asset_assignments']['Insert'];

export const physicalAssetService = {
  async getAllAssets(): Promise<PhysicalAsset[]> {
    try {
      const { data, error } = await supabase
        .from('physical_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        throw new Error(`Failed to fetch assets: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      console.error('Service error fetching assets:', error);
      throw error;
    }
  },

  async createAsset(asset: PhysicalAssetInsert): Promise<PhysicalAsset> {
    try {
      // Handle empty serial number by setting it to null if empty string
      const assetData = {
        ...asset,
        serial_number: asset.serial_number && asset.serial_number.trim() 
          ? asset.serial_number.trim() 
          : null
      };

      const { data, error } = await supabase
        .from('physical_assets')
        .insert(assetData)
        .select()
        .single();

      if (error) {
        console.error('Error creating asset:', error);
        throw new Error(`Failed to create asset: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Service error creating asset:', error);
      throw error;
    }
  },

  async updateAsset(id: string, updates: PhysicalAssetUpdate): Promise<PhysicalAsset> {
    try {
      // Handle empty serial number by setting it to null if empty string
      const updateData = {
        ...updates,
        serial_number: updates.serial_number && typeof updates.serial_number === 'string' && updates.serial_number.trim() 
          ? updates.serial_number.trim() 
          : null
      };

      const { data, error } = await supabase
        .from('physical_assets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating asset:', error);
        throw new Error(`Failed to update asset: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Service error updating asset:', error);
      throw error;
    }
  },

  async deleteAsset(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('physical_assets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting asset:', error);
        throw new Error(`Failed to delete asset: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error deleting asset:', error);
      throw error;
    }
  },

  async assignAsset(assignmentData: {
    asset_id: string;
    assigned_to_id: string;
    assigned_to_type: string;
    assigned_by?: string | null;
    notes?: string | null;
    schedule_id?: string;
  }): Promise<void> {
    try {
      // First check if asset exists and is available
      const { data: currentAsset, error: fetchError } = await supabase
        .from('physical_assets')
        .select('status, assigned_to_id, name')
        .eq('id', assignmentData.asset_id)
        .single();

      if (fetchError) {
        console.error('Error fetching asset for assignment:', fetchError);
        throw new Error(`Failed to fetch asset: ${fetchError.message}`);
      }

      if (!currentAsset) {
        throw new Error('Asset not found');
      }

      if (currentAsset.status !== 'available') {
        throw new Error(`Asset is currently ${currentAsset.status} and cannot be assigned`);
      }

      // Create assignment record
      const assignment: AssetAssignmentInsert = {
        asset_id: assignmentData.asset_id,
        assigned_to_id: assignmentData.assigned_to_id,
        assigned_to_type: assignmentData.assigned_to_type,
        assignment_date: new Date().toISOString(),
        notes: assignmentData.notes || null,
        assigned_by: assignmentData.assigned_by || null,
        schedule_id: assignmentData.schedule_id || null
      };

      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .insert(assignment);

      if (assignmentError) {
        console.error('Error creating assignment:', assignmentError);
        throw new Error(`Failed to create assignment: ${assignmentError.message}`);
      }

      // Update asset status and assignment info
      const { error: updateError } = await supabase
        .from('physical_assets')
        .update({
          status: 'rental_in_progress',
          assigned_to_id: assignmentData.assigned_to_id,
          assigned_to_type: assignmentData.assigned_to_type,
          rental_start_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', assignmentData.asset_id);

      if (updateError) {
        console.error('Error updating asset after assignment:', updateError);
        throw new Error(`Failed to update asset: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Service error assigning asset:', error);
      throw error;
    }
  },

  async assignAssetToCourse(assignmentData: {
    asset_id: string;
    assigned_to_id: string;
    assigned_to_type: string;
    assigned_by?: string | null;
    notes?: string | null;
    schedule_id: string;
  }): Promise<void> {
    try {
      // Use the same logic as assignAsset but with course context
      await this.assignAsset(assignmentData);
    } catch (error) {
      console.error('Service error assigning asset to course:', error);
      throw error;
    }
  },

  async getAssignmentHistory(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('asset_assignments')
        .select(`
          *,
          physical_assets!inner(
            id,
            name,
            serial_number
          ),
          course_schedules(
            id,
            start_date,
            end_date,
            courses(
              course_title
            )
          )
        `)
        .order('assignment_date', { ascending: false });

      if (error) {
        console.error('Error fetching assignment history:', error);
        throw new Error(`Failed to fetch assignment history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Service error fetching assignment history:', error);
      throw error;
    }
  },

  async bulkUpdateAssetStatus(assetIds: string[], status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('physical_assets')
        .update({ status })
        .in('id', assetIds);

      if (error) {
        console.error('Error bulk updating asset status:', error);
        throw new Error(`Failed to bulk update asset status: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error bulk updating asset status:', error);
      throw error;
    }
  },

  async assignAssetToStudent(assetId: string, studentId: string): Promise<void> {
    try {
      // First check if asset exists and is available
      const { data: currentAsset, error: fetchError } = await supabase
        .from('physical_assets')
        .select('status, assigned_to_id, name')
        .eq('id', assetId)
        .single();

      if (fetchError) {
        console.error('Error fetching asset for assignment:', fetchError);
        throw new Error(`Failed to fetch asset: ${fetchError.message}`);
      }

      if (!currentAsset) {
        throw new Error('Asset not found');
      }

      if (currentAsset.status !== 'available') {
        throw new Error(`Asset is currently ${currentAsset.status} and cannot be assigned`);
      }

      // Create assignment record
      const assignment: AssetAssignmentInsert = {
        asset_id: assetId,
        assigned_to_id: studentId,
        assigned_to_type: 'student',
        assignment_date: new Date().toISOString(),
        notes: `Asset assigned to student`
      };

      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .insert(assignment);

      if (assignmentError) {
        console.error('Error creating assignment:', assignmentError);
        throw new Error(`Failed to create assignment: ${assignmentError.message}`);
      }

      // Update asset status and assignment info
      const { error: updateError } = await supabase
        .from('physical_assets')
        .update({
          status: 'rental_in_progress',
          assigned_to_id: studentId,
          assigned_to_type: 'student',
          rental_start_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', assetId);

      if (updateError) {
        console.error('Error updating asset after assignment:', updateError);
        throw new Error(`Failed to update asset: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Service error assigning asset to student:', error);
      throw error;
    }
  },

  async returnAsset(assetId: string): Promise<void> {
    try {
      // Get current assignment
      const { data: assignments, error: fetchError } = await supabase
        .from('asset_assignments')
        .select('*')
        .eq('asset_id', assetId)
        .is('return_date', null)
        .order('assignment_date', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching assignments for return:', fetchError);
        throw new Error(`Failed to fetch assignments: ${fetchError.message}`);
      }

      if (assignments && assignments.length > 0) {
        // Update assignment with return date
        const { error: assignmentError } = await supabase
          .from('asset_assignments')
          .update({ return_date: new Date().toISOString() })
          .eq('id', assignments[0].id);

        if (assignmentError) {
          console.error('Error updating assignment return date:', assignmentError);
          throw new Error(`Failed to update assignment: ${assignmentError.message}`);
        }
      }

      // Update asset status to returned
      const { error: updateError } = await supabase
        .from('physical_assets')
        .update({
          status: 'returned',
          rental_end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', assetId);

      if (updateError) {
        console.error('Error updating asset status to returned:', updateError);
        throw new Error(`Failed to update asset status: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Service error returning asset:', error);
      throw error;
    }
  },

  async getAvailableStudents(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('student_headers')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching students:', error);
        throw new Error(`Failed to fetch students: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      console.error('Service error fetching students:', error);
      throw error;
    }
  },

  async getStudentById(studentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('student_headers')
        .select('id, first_name, last_name, email')
        .eq('id', studentId)
        .single();

      if (error) {
        console.error('Error fetching student by ID:', error);
        throw new Error(`Failed to fetch student: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Service error fetching student by ID:', error);
      throw error;
    }
  },

  async markAssetReadyToReturn(assetId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('physical_assets')
        .update({ status: 'ready_to_return' })
        .eq('id', assetId);

      if (error) {
        console.error('Error marking asset ready to return:', error);
        throw new Error(`Failed to update asset status: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error marking asset ready to return:', error);
      throw error;
    }
  },

  async markAssetAsAvailable(assetId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('physical_assets')
        .update({
          status: 'available',
          assigned_to_id: null,
          assigned_to_type: null,
          rental_start_date: null,
          rental_end_date: null
        })
        .eq('id', assetId);

      if (error) {
        console.error('Error marking asset as available:', error);
        throw new Error(`Failed to update asset status: ${error.message}`);
      }
    } catch (error) {
      console.error('Service error marking asset as available:', error);
      throw error;
    }
  },

  async getAssetAssignments(assetId: string): Promise<AssetAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('asset_assignments')
        .select('*')
        .eq('asset_id', assetId)
        .order('assignment_date', { ascending: false });

      if (error) {
        console.error('Error fetching asset assignments:', error);
        throw new Error(`Failed to fetch assignments: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      console.error('Service error fetching asset assignments:', error);
      throw error;
    }
  }
};
