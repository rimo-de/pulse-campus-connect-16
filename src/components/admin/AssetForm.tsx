
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assetService } from '@/services/assetService';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAsset?: Asset | null;
}

const AssetForm = ({ isOpen, onClose, onSuccess, editingAsset }: AssetFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    is_active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && editingAsset) {
      setFormData({
        title: editingAsset.title,
        description: editingAsset.description || '',
        category: editingAsset.category || 'general',
        is_active: editingAsset.is_active ?? true,
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: 'general',
        is_active: true,
      });
    }
    setSelectedFile(null);
  }, [isOpen, editingAsset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAsset && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let filePath = editingAsset?.file_path || '';
      let fileName = editingAsset?.file_name || '';
      let fileType = editingAsset?.file_type || '';
      let fileSize = editingAsset?.file_size || 0;

      if (selectedFile) {
        const timestamp = Date.now();
        const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
        
        filePath = await assetService.uploadAssetFile(selectedFile, uniqueFileName);
        fileName = selectedFile.name;
        fileType = selectedFile.type || selectedFile.name.split('.').pop() || 'unknown';
        fileSize = selectedFile.size;
      }

      const assetData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        is_active: formData.is_active,
        file_name: fileName,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
      };

      if (editingAsset) {
        await assetService.updateAsset(editingAsset.id, assetData);
        toast({
          title: "Success",
          description: "Asset updated successfully",
        });
      } else {
        await assetService.createAsset(assetData);
        toast({
          title: "Success",
          description: "Asset created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: "Error",
        description: "Failed to save asset",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Asset Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter asset title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter asset description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="curriculum">Curriculum</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file">File {!editingAsset && '*'}</Label>
                  <div className="mt-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {editingAsset && !selectedFile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Current file: {editingAsset.file_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="edu-button flex-1"
                >
                  {isLoading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      {editingAsset ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {editingAsset ? 'Update Asset' : 'Create Asset'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetForm;
