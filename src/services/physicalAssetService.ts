import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];
type PhysicalAssetInsert = Database['public']['Tables']['physical_assets']['Insert'];
type PhysicalAssetUpdate = Database['public']['Tables']['physical_assets']['Update'];
type AssetAssignment = Database['public']['Tables']['asset_assignments']['Row'];
type AssetAssignmentInsert = Database['public']['Tables']['asset_assignments']['Insert'];

export const physicalAssetService = {
  async getAllAssets(): Promise<PhysicalAsset[]> {
    const { data, error } = await supabase
      .from('physical_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAssetsWithAssignments(): Promise<any[]> {
    const { data, error } = await supabase
      .from('physical_assets')
      .select(`
        *,
        asset_assignments!left(
          id,
          assigned_to_id,
          assigned_to_type,
          assigned_by,
          assignment_date,
          return_date,
          notes,
          schedule_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAsset(asset: PhysicalAssetInsert): Promise<PhysicalAsset> {
    const { data, error } = await supabase
      .from('physical_assets')
      .insert(asset)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAsset(id: string, updates: PhysicalAssetUpdate): Promise<PhysicalAsset> {
    const { data, error } = await supabase
      .from('physical_assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('physical_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async assignAssetToStudent(assetId: string, studentId: string): Promise<void> {
    // Create assignment record
    const assignment: AssetAssignmentInsert = {
      asset_id: assetId,
      assigned_to_id: studentId,
      assigned_to_type: 'student',
      assignment_date: new Date().toISOString()
    };

    const { error: assignmentError } = await supabase
      .from('asset_assignments')
      .insert(assignment);

    if (assignmentError) throw assignmentError;

    // Update asset status and assignment info
    await this.updateAsset(assetId, {
      status: 'rental_in_progress',
      assigned_to_id: studentId,
      assigned_to_type: 'student',
      rental_start_date: new Date().toISOString().split('T')[0]
    });
  },

  async returnAsset(assetId: string): Promise<void> {
    // Get current assignment
    const { data: assignments, error: fetchError } = await supabase
      .from('asset_assignments')
      .select('*')
      .eq('asset_id', assetId)
      .is('return_date', null)
      .order('assignment_date', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    if (assignments && assignments.length > 0) {
      // Update assignment with return date
      const { error: assignmentError } = await supabase
        .from('asset_assignments')
        .update({ return_date: new Date().toISOString() })
        .eq('id', assignments[0].id);

      if (assignmentError) throw assignmentError;
    }

    // Update asset status to available
    await this.updateAsset(assetId, {
      status: 'available',
      assigned_to_id: null,
      assigned_to_type: null,
      rental_start_date: null,
      rental_end_date: new Date().toISOString().split('T')[0]
    });
  },

  async getAvailableStudents(): Promise<any[]> {
    const { data, error } = await supabase
      .from('student_headers')
      .select('id, first_name, last_name, email')
      .order('first_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getStudentById(studentId: string): Promise<any> {
    const { data, error } = await supabase
      .from('student_headers')
      .select('id, first_name, last_name, email')
      .eq('id', studentId)
      .single();

    if (error) throw error;
    return data;
  },

  async assignAsset(assignment: AssetAssignmentInsert): Promise<void> {
    const { error } = await supabase
      .from('asset_assignments')
      .insert(assignment);

    if (error) throw error;

    // Update asset status to rental_in_progress
    await this.updateAsset(assignment.asset_id, {
      status: 'rental_in_progress',
      assigned_to_id: assignment.assigned_to_id,
      assigned_to_type: assignment.assigned_to_type,
      rental_start_date: new Date().toISOString().split('T')[0]
    });
  },

  async assignAssetToCourse(assignment: AssetAssignmentInsert & { schedule_id: string }): Promise<void> {
    const { error } = await supabase
      .from('asset_assignments')
      .insert(assignment);

    if (error) throw error;

    // Update asset status to rental_in_progress
    await this.updateAsset(assignment.asset_id, {
      status: 'rental_in_progress',
      assigned_to_id: assignment.assigned_to_id,
      assigned_to_type: assignment.assigned_to_type,
      rental_start_date: new Date().toISOString().split('T')[0]
    });
  },

  async markAssetReadyToReturn(assetId: string): Promise<void> {
    await this.updateAsset(assetId, {
      status: 'ready_to_return'
    });
  },

  async markAssetAsAvailable(assetId: string): Promise<void> {
    await this.updateAsset(assetId, {
      status: 'available',
      assigned_to_id: null,
      assigned_to_type: null,
      rental_start_date: null,
      rental_end_date: null
    });
  },

  async getAssetAssignments(assetId: string): Promise<AssetAssignment[]> {
    const { data, error } = await supabase
      .from('asset_assignments')
      .select('*')
      .eq('asset_id', assetId)
      .order('assignment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAssignmentHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        physical_assets!inner(name, serial_number),
        course_schedules(
          id,
          start_date,
          end_date,
          courses(course_title)
        )
      `)
      .order('assignment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAssetsByStatus(status: string): Promise<PhysicalAsset[]> {
    const { data, error } = await supabase
      .from('physical_assets')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async bulkUpdateAssetStatus(assetIds: string[], status: string): Promise<void> {
    const { error } = await supabase
      .from('physical_assets')
      .update({ status })
      .in('id', assetIds);

    if (error) throw error;
  }
};
