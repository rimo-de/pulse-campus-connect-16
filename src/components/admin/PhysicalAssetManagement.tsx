
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, UserPlus, RotateCcw, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';
import PhysicalAssetForm from './PhysicalAssetForm';
import AssetAssignmentModal from './AssetAssignmentModal';
import AssetHistoryModal from './AssetHistoryModal';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];

const PhysicalAssetManagement = () => {
  const [assets, setAssets] = useState<PhysicalAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<PhysicalAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedAssetForAssignment, setSelectedAssetForAssignment] = useState<PhysicalAsset | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<PhysicalAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    const filtered = assets.filter(asset =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssets(filtered);
  }, [assets, searchTerm]);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const data = await physicalAssetService.getAllAssets();
      setAssets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load physical assets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const handleEditAsset = (asset: PhysicalAsset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleDeleteAsset = async (asset: PhysicalAsset) => {
    if (!confirm('Are you sure you want to delete this physical asset?')) return;

    try {
      await physicalAssetService.deleteAsset(asset.id);
      toast({
        title: "Success",
        description: "Physical asset deleted successfully",
      });
      loadAssets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete physical asset",
        variant: "destructive",
      });
    }
  };

  const handleAssignAsset = (asset: PhysicalAsset) => {
    setSelectedAssetForAssignment(asset);
    setAssignmentModalOpen(true);
  };

  const handleReturnAsset = async (asset: PhysicalAsset) => {
    if (!confirm('Are you sure you want to mark this asset as returned?')) return;

    try {
      // Get the latest assignment for this asset
      const assignments = await physicalAssetService.getAssetAssignments(asset.id);
      const activeAssignment = assignments.find(a => !a.return_date);
      
      if (activeAssignment) {
        await physicalAssetService.returnAsset(asset.id, activeAssignment.id);
        toast({
          title: "Success",
          description: "Asset marked as returned successfully",
        });
        loadAssets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to return asset",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = (asset: PhysicalAsset) => {
    setSelectedAssetForHistory(asset);
    setHistoryModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rental_in_progress': return 'bg-blue-100 text-blue-800';
      case 'ready_to_return': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return `€${price.toFixed(2)}/month`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Physical Asset Management</h1>
        <p className="text-gray-600">Manage rental equipment and track assignments.</p>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Physical Assets</CardTitle>
            <Button onClick={handleAddAsset} className="edu-button">
              <Plus className="w-4 h-4 mr-2" />
              Add New Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assets by name, serial number, or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading physical assets...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No assets found matching your search.' : 'No physical assets available. Create your first asset!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          {asset.order_number && (
                            <div className="text-sm text-gray-500">
                              Order: {asset.order_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {asset.serial_number || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.assigned_to_id ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {asset.assigned_to_type?.charAt(0).toUpperCase() + asset.assigned_to_type?.slice(1)}
                            </div>
                            <div className="text-gray-500">ID: {asset.assigned_to_id.slice(0, 8)}...</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatPrice(asset.price_per_month)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistory(asset)}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          {asset.status === 'available' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAssignAsset(asset)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          )}
                          {asset.status === 'rental_in_progress' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReturnAsset(asset)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAsset(asset)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAsset(asset)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PhysicalAssetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadAssets}
        editingAsset={editingAsset}
      />

      <AssetAssignmentModal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        onSuccess={loadAssets}
        asset={selectedAssetForAssignment}
      />

      <AssetHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        asset={selectedAssetForHistory}
      />
    </div>
  );
};

export default PhysicalAssetManagement;
