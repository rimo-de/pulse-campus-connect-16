
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Copy, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { courseScheduleService } from '@/services/courseScheduleService';
import { format } from 'date-fns';
import CourseScheduleForm from './course-schedule/CourseScheduleForm';
import CourseScheduleCalendar from './course-schedule/CourseScheduleCalendar';
import type { CourseSchedule } from '@/types/course';

const CourseScheduleManagement = () => {
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<CourseSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schedules, searchTerm, statusFilter, monthFilter]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const data = await courseScheduleService.getAllSchedules();
      setSchedules(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course schedules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = schedules;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.course?.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.course_offering?.delivery_mode?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }

    // Month filter
    if (monthFilter !== 'all') {
      const [year, month] = monthFilter.split('-');
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.start_date);
        return scheduleDate.getFullYear() === parseInt(year) && 
               scheduleDate.getMonth() === parseInt(month) - 1;
      });
    }

    setFilteredSchedules(filtered);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const handleEditSchedule = (schedule: CourseSchedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this course schedule?')) return;

    try {
      await courseScheduleService.deleteSchedule(scheduleId);
      toast({
        title: "Success",
        description: "Course schedule deleted successfully",
      });
      loadSchedules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course schedule",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateSchedule = async (schedule: CourseSchedule) => {
    // For simplicity, duplicate with start date 30 days from original
    const originalStartDate = new Date(schedule.start_date);
    const newStartDate = new Date(originalStartDate);
    newStartDate.setDate(newStartDate.getDate() + 30);

    try {
      await courseScheduleService.duplicateSchedule(schedule.id, newStartDate);
      toast({
        title: "Success",
        description: "Course schedule duplicated successfully",
      });
      loadSchedules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate course schedule",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonthOptions = () => {
    const months = new Set<string>();
    schedules.forEach(schedule => {
      const date = new Date(schedule.start_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    return Array.from(months).sort().map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        value: monthKey,
        label: format(date, 'MMMM yyyy')
      };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Course Schedule Management</h1>
        <p className="text-gray-600">Schedule and manage course batches with intelligent date calculations.</p>
      </div>

      {/* Controls */}
      <Card className="edu-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Course Schedules</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button onClick={handleAddSchedule} className="edu-button">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Course
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by course name or delivery mode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {getMonthOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          {viewMode === 'calendar' ? (
            <CourseScheduleCalendar schedules={filteredSchedules} />
          ) : (
            <>
              {isLoading ? (
                <div className="text-center py-8">Loading schedules...</div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all' || monthFilter !== 'all' 
                    ? 'No schedules found matching your filters.' 
                    : 'No course schedules available. Create your first schedule!'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Delivery Mode</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <div className="font-medium">
                              {schedule.course?.course_title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{schedule.course_offering?.delivery_mode?.name}</div>
                              <div className="text-gray-500">
                                {schedule.course_offering?.delivery_mode?.delivery_method} • {schedule.course_offering?.delivery_mode?.delivery_type}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(schedule.start_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(schedule.end_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {schedule.course_offering?.duration_days} working days
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(schedule.status)}>
                              {schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSchedule(schedule)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateSchedule(schedule)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSchedule(schedule.id)}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Schedule Form Modal */}
      <CourseScheduleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadSchedules}
        editingSchedule={editingSchedule}
      />
    </div>
  );
};

export default CourseScheduleManagement;
