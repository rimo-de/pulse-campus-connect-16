
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RotateCcw,
  Users,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];

const AssetStatusDashboard = () => {
  const [assets, setAssets] = useState<PhysicalAsset[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    available: 0,
    rental_in_progress: 0,
    ready_to_return: 0,
    returned: 0,
    maintenance: 0,
    lost: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [assetsData, historyData] = await Promise.all([
        physicalAssetService.getAllAssets(),
        physicalAssetService.getAssignmentHistory()
      ]);
      
      setAssets(assetsData);
      setAssignmentHistory(historyData);
      
      // Calculate status counts
      const counts = assetsData.reduce((acc, asset) => {
        acc[asset.status as keyof typeof acc] = (acc[asset.status as keyof typeof acc] || 0) + 1;
        return acc;
      }, {
        available: 0,
        rental_in_progress: 0,
        ready_to_return: 0,
        returned: 0,
        maintenance: 0,
        lost: 0
      });
      
      setStatusCounts(counts);
    } catch (error) {
      console.error('Error loading asset data:', error);
      toast({
        title: "Error",
        description: "Failed to load asset data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedAssets.length === 0) {
      toast({
        title: "Warning",
        description: "Please select assets to update",
        variant: "destructive",
      });
      return;
    }

    try {
      await physicalAssetService.bulkUpdateAssetStatus(selectedAssets, status);
      toast({
        title: "Success",
        description: `Updated ${selectedAssets.length} assets to ${status}`,
      });
      setSelectedAssets([]);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update asset statuses",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Package className="w-4 h-4 text-green-600" />;
      case 'rental_in_progress': return <Users className="w-4 h-4 text-blue-600" />;
      case 'ready_to_return': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'returned': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'lost': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rental_in_progress': return 'bg-blue-100 text-blue-800';
      case 'ready_to_return': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusCard = ({ status, count, title }: { status: string; count: number; title: string }) => (
    <Card className="edu-card hover-scale">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
          </div>
          {getStatusIcon(status)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Asset Status Dashboard</h1>
        <p className="text-gray-600">Monitor and manage physical asset statuses and assignments.</p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatusCard status="available" count={statusCounts.available} title="Available" />
        <StatusCard status="rental_in_progress" count={statusCounts.rental_in_progress} title="In Progress" />
        <StatusCard status="ready_to_return" count={statusCounts.ready_to_return} title="Ready to Return" />
        <StatusCard status="returned" count={statusCounts.returned} title="Returned" />
        <StatusCard status="maintenance" count={statusCounts.maintenance} title="Maintenance" />
        <StatusCard status="lost" count={statusCounts.lost} title="Lost" />
      </div>

      <Tabs defaultValue="status-overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status-overview">Status Overview</TabsTrigger>
          <TabsTrigger value="assignment-history">Assignment History</TabsTrigger>
          <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="status-overview" className="space-y-6">
          <Card className="edu-card">
            <CardHeader>
              <CardTitle>Assets by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading assets...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Rental Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
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
                          <TableCell>
                            {asset.rental_start_date && (
                              <div className="text-sm">
                                <div>Start: {asset.rental_start_date}</div>
                                {asset.rental_end_date && (
                                  <div>End: {asset.rental_end_date}</div>
                                )}
                              </div>
                            )}
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

        <TabsContent value="assignment-history" className="space-y-6">
          <Card className="edu-card">
            <CardHeader>
              <CardTitle>Recent Assignment History</CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No assignment history available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <Table Head>Asset</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Assignment Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignmentHistory.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{assignment.physical_assets?.name}</div>
                              <div className="text-sm text-gray-500">
                                {assignment.physical_assets?.serial_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {assignment.assigned_to_type?.charAt(0).toUpperCase() + assignment.assigned_to_type?.slice(1)}
                              </div>
                              <div className="text-gray-500">ID: {assignment.assigned_to_id.slice(0, 8)}...</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(assignment.assignment_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {assignment.return_date 
                              ? new Date(assignment.return_date).toLocaleDateString()
                              : 'Not returned'
                            }
                          </TableCell>
                          <TableCell>
                            {assignment.course_schedules?.courses?.course_title ? (
                              <div className="text-sm">
                                <div className="font-medium flex items-center">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {assignment.course_schedules.courses.course_title}
                                </div>
                                <div className="text-gray-500">
                                  {assignment.course_schedules.start_date} - {assignment.course_schedules.end_date}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Individual</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={assignment.return_date ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                              {assignment.return_date ? 'Returned' : 'Active'}
                            </Badge>
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

        <TabsContent value="bulk-actions" className="space-y-6">
          <Card className="edu-card">
            <CardHeader>
              <CardTitle>Bulk Status Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Select multiple assets and update their status in bulk.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleBulkStatusUpdate('available')}
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Mark as Available
                </Button>
                <Button 
                  onClick={() => handleBulkStatusUpdate('maintenance')}
                  variant="outline"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  Mark for Maintenance
                </Button>
                <Button 
                  onClick={() => handleBulkStatusUpdate('returned')}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Mark as Returned
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                Selected assets: {selectedAssets.length}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetStatusDashboard;
