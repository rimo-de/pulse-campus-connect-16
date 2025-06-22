
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];

interface PhysicalAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAsset?: PhysicalAsset | null;
}

const PhysicalAssetForm = ({ isOpen, onClose, onSuccess, editingAsset }: PhysicalAssetFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    order_number: '',
    status: 'available',
    price_per_month: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && editingAsset) {
      setFormData({
        name: editingAsset.name,
        serial_number: editingAsset.serial_number || '',
        order_number: editingAsset.order_number || '',
        status: editingAsset.status,
        price_per_month: editingAsset.price_per_month?.toString() || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        serial_number: '',
        order_number: '',
        status: 'available',
        price_per_month: '',
      });
    }
  }, [isOpen, editingAsset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const assetData = {
        name: formData.name,
        serial_number: formData.serial_number || null,
        order_number: formData.order_number || null,
        status: formData.status,
        price_per_month: formData.price_per_month ? parseFloat(formData.price_per_month) : null,
      };

      if (editingAsset) {
        await physicalAssetService.updateAsset(editingAsset.id, assetData);
        toast({
          title: "Success",
          description: "Physical asset updated successfully",
        });
      } else {
        await physicalAssetService.createAsset(assetData);
        toast({
          title: "Success",
          description: "Physical asset created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving physical asset:', error);
      
      // Handle specific duplicate serial number error
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        toast({
          title: "Duplicate Serial Number",
          description: "This serial number already exists. Please use a different serial number.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save physical asset",
          variant: "destructive",
        });
      }
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
              {editingAsset ? 'Edit Physical Asset' : 'Add New Physical Asset'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter asset name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    placeholder="Enter unique serial number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty if no serial number available
                  </p>
                </div>

                <div>
                  <Label htmlFor="order_number">Order Number</Label>
                  <Input
                    id="order_number"
                    value={formData.order_number}
                    onChange={(e) => setFormData({...formData, order_number: e.target.value})}
                    placeholder="Enter order number"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="ready_to_return">Ready to Return</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price_per_month">Price per Month (€)</Label>
                  <Input
                    id="price_per_month"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_month}
                    onChange={(e) => setFormData({...formData, price_per_month: e.target.value})}
                    placeholder="0.00"
                  />
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
                      <Package className="w-4 h-4 mr-2 animate-spin" />
                      {editingAsset ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
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

export default PhysicalAssetForm;
