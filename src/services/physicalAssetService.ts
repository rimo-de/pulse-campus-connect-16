
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

  async returnAsset(assetId: string, assignmentId: string): Promise<void> {
    // Update assignment with return date
    const { error: assignmentError } = await supabase
      .from('asset_assignments')
      .update({ return_date: new Date().toISOString() })
      .eq('id', assignmentId);

    if (assignmentError) throw assignmentError;

    // Update asset status to available
    const { error: assetError } = await supabase
      .from('physical_assets')
      .update({
        status: 'available',
        assigned_to_id: null,
        assigned_to_type: null,
        rental_end_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', assetId);

    if (assetError) throw assetError;
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

  async getAssignmentHistory(): Promise<AssetAssignment[]> {
    const { data, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        physical_assets!inner(name, serial_number)
      `)
      .order('assignment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
