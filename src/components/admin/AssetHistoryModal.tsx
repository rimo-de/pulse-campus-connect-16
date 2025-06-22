
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { X, History } from 'lucide-react';
import { physicalAssetService } from '@/services/physicalAssetService';
import type { Database } from '@/integrations/supabase/types';

type PhysicalAsset = Database['public']['Tables']['physical_assets']['Row'];
type AssetAssignment = Database['public']['Tables']['asset_assignments']['Row'];

interface AssetHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: PhysicalAsset | null;
}

const AssetHistoryModal = ({ isOpen, onClose, asset }: AssetHistoryModalProps) => {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && asset) {
      loadAssignmentHistory();
    }
  }, [isOpen, asset]);

  const loadAssignmentHistory = async () => {
    if (!asset) return;
    
    setIsLoading(true);
    try {
      const data = await physicalAssetService.getAssetAssignments(asset.id);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssignmentStatus = (assignment: AssetAssignment) => {
    return assignment.return_date ? 'returned' : 'active';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Assignment History: {asset.name}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading assignment history...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No assignment history available for this asset.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Assigned By</TableHead>
                      <TableHead>Assignment Date</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">ID: {assignment.assigned_to_id.slice(0, 8)}...</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assignment.assigned_to_type?.charAt(0).toUpperCase() + assignment.assigned_to_type?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.assigned_by || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(assignment.assignment_date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {assignment.return_date ? formatDate(assignment.return_date) : 'Not returned'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getAssignmentStatus(assignment))}>
                            {getAssignmentStatus(assignment).toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {assignment.notes || 'No notes'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetHistoryModal;
