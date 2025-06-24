
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search, Filter, Download, Calendar, User, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { physicalAssetService } from '@/services/physicalAssetService';

interface AssetAssignment {
  id: string;
  asset_id: string;
  assigned_to_id: string;
  assigned_to_type: string;
  assignment_date: string;
  return_date?: string;
  notes?: string;
  physical_assets: {
    id: string;
    name: string;
    serial_number?: string;
  };
  course_schedules?: {
    id: string;
    start_date: string;
    end_date: string;
    courses: {
      course_title: string;
    };
  };
}

const AssetAssignmentView = () => {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<AssetAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, filterStatus]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await physicalAssetService.getAssignmentHistory();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load asset assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.physical_assets.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.physical_assets.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.assigned_to_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(assignment => {
        if (filterStatus === 'active') {
          return !assignment.return_date;
        } else if (filterStatus === 'returned') {
          return !!assignment.return_date;
        }
        return true;
      });
    }

    setFilteredAssignments(filtered);
  };

  const getStatusBadge = (assignment: AssetAssignment) => {
    if (assignment.return_date) {
      return <Badge variant="secondary">Returned</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAssignmentDuration = (assignment: AssetAssignment) => {
    const startDate = new Date(assignment.assignment_date);
    const endDate = assignment.return_date ? new Date(assignment.return_date) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Asset Assignments</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by asset name, serial number, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'returned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('returned')}
              >
                Returned
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assignment Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No asset assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{assignment.physical_assets.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {assignment.physical_assets.serial_number || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {assignment.assigned_to_type === 'student' ? 'Student' : 'Course'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(assignment.assignment_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.return_date ? (
                          <span className="text-sm">{formatDate(assignment.return_date)}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not returned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getAssignmentDuration(assignment)}</span>
                      </TableCell>
                      <TableCell>
                        {assignment.course_schedules ? (
                          <span className="text-sm">
                            {assignment.course_schedules.courses.course_title}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {assignment.notes || 'No notes'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetAssignmentView;
