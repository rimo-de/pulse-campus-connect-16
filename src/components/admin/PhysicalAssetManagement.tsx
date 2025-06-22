
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, UserPlus, RotateCcw, History, BarChart3, CheckCircle, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';
import PhysicalAssetForm from './PhysicalAssetForm';
import StudentAssignmentModal from './StudentAssignmentModal';
import AssetHistoryModal from './AssetHistoryModal';
import AssetStatusDashboard from './AssetStatusDashboard';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];

interface StudentInfo {
  first_name: string;
  last_name: string;
  email: string;
}

interface PhysicalAssetWithStudent extends PhysicalAsset {
  assigned_student?: StudentInfo;
}

const PhysicalAssetManagement = () => {
  const [assets, setAssets] = useState<PhysicalAssetWithStudent[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<PhysicalAssetWithStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PhysicalAsset | null>(null);
  const [studentAssignmentModalOpen, setStudentAssignmentModalOpen] = useState(false);
  const [selectedAssetForAssignment, setSelectedAssetForAssignment] = useState<PhysicalAsset | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<PhysicalAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingStudents, setLoadingStudents] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    let filtered = assets.filter(asset =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, statusFilter]);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log('Loading assets...');
      
      // Use getAllAssets instead of getAssetsWithStudentInfo to avoid the join error
      const data = await physicalAssetService.getAllAssets();
      console.log('Assets loaded successfully:', data.length);
      
      // Convert to the expected format and load student data for assigned assets
      const assetsWithPlaceholder = data.map(asset => ({
        ...asset,
        assigned_student: undefined
      }));
      
      setAssets(assetsWithPlaceholder);
      
      // Load student information for assigned assets
      await loadStudentDataForAssignedAssets(assetsWithPlaceholder);
      
    } catch (error) {
      console.error('Error loading assets:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load assets');
      toast({
        title: "Error",
        description: "Failed to load physical assets. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentDataForAssignedAssets = async (assetsData: PhysicalAssetWithStudent[]) => {
    const studentPromises = assetsData
      .filter(asset => asset.assigned_to_type === 'student' && asset.assigned_to_id)
      .map(async (asset) => {
        try {
          setLoadingStudents(prev => new Set([...prev, asset.id]));
          const studentData = await physicalAssetService.getStudentById(asset.assigned_to_id!);
          return { assetId: asset.id, studentData };
        } catch (error) {
          console.error(`Error loading student data for asset ${asset.id}:`, error);
          return { assetId: asset.id, studentData: null };
        } finally {
          setLoadingStudents(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset.id);
            return newSet;
          });
        }
      });

    if (studentPromises.length > 0) {
      const studentResults = await Promise.allSettled(studentPromises);
      
      setAssets(prevAssets => 
        prevAssets.map(asset => {
          const studentResult = studentResults.find(result => 
            result.status === 'fulfilled' && result.value.assetId === asset.id
          );
          
          if (studentResult && studentResult.status === 'fulfilled' && studentResult.value.studentData) {
            return {
              ...asset,
              assigned_student: studentResult.value.studentData
            };
          }
          
          return asset;
        })
      );
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
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete physical asset",
        variant: "destructive",
      });
    }
  };

  const handleAssignToStudent = (asset: PhysicalAsset) => {
    console.log('Opening student assignment modal for asset:', asset.name);
    setSelectedAssetForAssignment(asset);
    setStudentAssignmentModalOpen(true);
  };

  const handleMarkReadyToReturn = async (asset: PhysicalAsset) => {
    try {
      await physicalAssetService.markAssetReadyToReturn(asset.id);
      toast({
        title: "Success",
        description: "Asset marked as ready to return",
      });
      loadAssets();
    } catch (error) {
      console.error('Error updating asset status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update asset status",
        variant: "destructive",
      });
    }
  };

  const handleReturnAsset = async (asset: PhysicalAsset) => {
    if (!confirm('Are you sure you want to mark this asset as returned?')) return;

    try {
      await physicalAssetService.returnAsset(asset.id);
      toast({
        title: "Success",
        description: "Asset marked as returned successfully",
      });
      loadAssets();
    } catch (error) {
      console.error('Error returning asset:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to return asset",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsAvailable = async (asset: PhysicalAsset) => {
    try {
      await physicalAssetService.markAssetAsAvailable(asset.id);
      toast({
        title: "Success",
        description: "Asset marked as available",
      });
      loadAssets();
    } catch (error) {
      console.error('Error updating asset status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update asset status",
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
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'ready_to_return': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return `€${price.toFixed(2)}/month`;
  };

  const renderAssignedStudent = (asset: PhysicalAssetWithStudent) => {
    if (asset.assigned_to_type === 'student' && asset.assigned_to_id) {
      if (loadingStudents.has(asset.id)) {
        return (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        );
      }

      if (asset.assigned_student) {
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {asset.assigned_student.first_name} {asset.assigned_student.last_name}
              </div>
              <div className="text-gray-500 text-xs">{asset.assigned_student.email}</div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="text-sm text-red-500">
            Student data unavailable
          </div>
        );
      }
    }

    if (asset.status === 'available') {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAssignToStudent(asset)}
          className="text-blue-600 hover:text-blue-700 h-8 px-2"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Assign
        </Button>
      );
    }

    return <span className="text-gray-400 text-sm">Unassigned</span>;
  };

  const getActionButtons = (asset: PhysicalAsset) => {
    const buttons = [];

    // History button (always available)
    buttons.push(
      <Button
        key="history"
        variant="ghost"
        size="sm"
        onClick={() => handleViewHistory(asset)}
        className="text-purple-600 hover:text-purple-700"
        title="View History"
      >
        <History className="w-4 h-4" />
      </Button>
    );

    // Status-specific action buttons
    switch (asset.status) {
      case 'assigned':
        buttons.push(
          <Button
            key="ready-return"
            variant="ghost"
            size="sm"
            onClick={() => handleMarkReadyToReturn(asset)}
            className="text-yellow-600 hover:text-yellow-700"
            title="Mark Ready to Return"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        );
        break;
      
      case 'ready_to_return':
        buttons.push(
          <Button
            key="return"
            variant="ghost"
            size="sm"
            onClick={() => handleReturnAsset(asset)}
            className="text-orange-600 hover:text-orange-700"
            title="Mark as Returned"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
        );
        break;
      
      case 'returned':
        buttons.push(
          <Button
            key="available"
            variant="ghost"
            size="sm"
            onClick={() => handleMarkAsAvailable(asset)}
            className="text-green-600 hover:text-green-700"
            title="Mark as Available"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
        );
        break;
    }

    // Edit and delete buttons (always available)
    buttons.push(
      <Button
        key="edit"
        variant="ghost"
        size="sm"
        onClick={() => handleEditAsset(asset)}
        className="text-blue-600 hover:text-blue-700"
        title="Edit Asset"
      >
        <Edit className="w-4 h-4" />
      </Button>,
      <Button
        key="delete"
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteAsset(asset)}
        className="text-red-600 hover:text-red-700"
        title="Delete Asset"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Physical Asset Management</h1>
        <p className="text-gray-600">Manage rental equipment with enhanced tracking and assignment capabilities.</p>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Asset Management</TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Status Dashboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assets by name, serial number, or order number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="ready_to_return">Ready to Return</option>
                  <option value="returned">Returned</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {loadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Error Loading Assets</h4>
                    <p className="text-sm text-red-700 mt-1">{loadError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadAssets}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8">Loading physical assets...</div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No assets found matching your criteria.' 
                    : 'No physical assets available. Create your first asset!'
                  }
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
                              {asset.status === 'assigned' ? 'ASSIGNED' : asset.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {renderAssignedStudent(asset)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatPrice(asset.price_per_month)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {getActionButtons(asset)}
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
        </TabsContent>

        <TabsContent value="dashboard">
          <AssetStatusDashboard />
        </TabsContent>
      </Tabs>

      <PhysicalAssetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadAssets}
        editingAsset={editingAsset}
      />

      <StudentAssignmentModal
        isOpen={studentAssignmentModalOpen}
        onClose={() => setStudentAssignmentModalOpen(false)}
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
