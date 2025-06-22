
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { courseScheduleService } from '@/services/courseScheduleService';
import CourseScheduleForm from './course-schedule/CourseScheduleForm';
import CourseScheduleCalendar from './course-schedule/CourseScheduleCalendar';
import CourseScheduleControls from './course-schedule/CourseScheduleControls';
import CourseScheduleTable from './course-schedule/CourseScheduleTable';
import StudentAssignmentModal from './course-schedule/StudentAssignmentModal';
import EnrolledStudentsList from './course-schedule/EnrolledStudentsList';
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
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isEnrolledListOpen, setIsEnrolledListOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CourseSchedule | null>(null);
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

  const handleAssignStudents = (schedule: CourseSchedule) => {
    setSelectedSchedule(schedule);
    setIsAssignmentModalOpen(true);
  };

  const handleViewEnrolledStudents = (schedule: CourseSchedule) => {
    setSelectedSchedule(schedule);
    setIsEnrolledListOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Course Schedule Management</h1>
        <p className="text-gray-600">Schedule and manage course batches with intelligent date calculations.</p>
      </div>

      <Card className="edu-card">
        <CardHeader>
          <CardTitle>Course Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseScheduleControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAddSchedule={handleAddSchedule}
            schedules={schedules}
          />

          {viewMode === 'calendar' ? (
            <CourseScheduleCalendar schedules={filteredSchedules} />
          ) : (
            <>
              {isLoading ? (
                <div className="text-center py-8">Loading schedules...</div>
              ) : filteredSchedules.length === 0 && (searchTerm || statusFilter !== 'all' || monthFilter !== 'all') ? (
                <div className="text-center py-8 text-gray-500">
                  No schedules found matching your filters.
                </div>
              ) : (
                <CourseScheduleTable
                  schedules={filteredSchedules}
                  onEditSchedule={handleEditSchedule}
                  onDeleteSchedule={handleDeleteSchedule}
                  onDuplicateSchedule={handleDuplicateSchedule}
                  onAssignStudents={handleAssignStudents}
                  onViewEnrolledStudents={handleViewEnrolledStudents}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CourseScheduleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadSchedules}
        editingSchedule={editingSchedule}
      />

      {selectedSchedule && (
        <>
          <StudentAssignmentModal
            isOpen={isAssignmentModalOpen}
            onClose={() => setIsAssignmentModalOpen(false)}
            onSuccess={loadSchedules}
            scheduleId={selectedSchedule.id}
            courseName={selectedSchedule.course?.course_title || 'Course'}
          />

          <EnrolledStudentsList
            isOpen={isEnrolledListOpen}
            onClose={() => setIsEnrolledListOpen(false)}
            scheduleId={selectedSchedule.id}
            courseName={selectedSchedule.course?.course_title || 'Course'}
          />
        </>
      )}
    </div>
  );
};

export default CourseScheduleManagement;
