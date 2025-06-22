
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type AssetUpdate = Database['public']['Tables']['assets']['Update'];

export const assetService = {
  async getAllAssets(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAsset(asset: AssetInsert): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAsset(id: string, updates: AssetUpdate): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadAssetFile(file: File, fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('course-assets')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  },

  getAssetFileUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('course-assets')
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  async deleteAssetFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('course-assets')
      .remove([filePath]);

    if (error) throw error;
  }
};
