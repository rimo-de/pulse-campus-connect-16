
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Copy, Users, UserPlus, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import type { CourseSchedule } from '@/types/course';

interface CourseScheduleTableProps {
  schedules: CourseSchedule[];
  onEditSchedule: (schedule: CourseSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onDuplicateSchedule: (schedule: CourseSchedule) => void;
  onAssignStudents: (schedule: CourseSchedule) => void;
  onViewEnrolledStudents: (schedule: CourseSchedule) => void;
  onAssignTrainers: (schedule: CourseSchedule) => void;
}

const CourseScheduleTable = ({
  schedules,
  onEditSchedule,
  onDeleteSchedule,
  onDuplicateSchedule,
  onAssignStudents,
  onViewEnrolledStudents,
  onAssignTrainers
}: CourseScheduleTableProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No course schedules available. Create your first schedule!
      </div>
    );
  }

  return (
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
            <TableHead>Students</TableHead>
            <TableHead>Trainers</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
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
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewEnrolledStudents(schedule)}
                    className="text-blue-600 hover:text-blue-700"
                    title="View enrolled students"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssignStudents(schedule)}
                    className="text-green-600 hover:text-green-700"
                    title="Assign students"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAssignTrainers(schedule)}
                  className="text-purple-600 hover:text-purple-700"
                  title="Assign trainers"
                >
                  <GraduationCap className="w-4 h-4" />
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSchedule(schedule)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicateSchedule(schedule)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSchedule(schedule.id)}
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
  );
};

export default CourseScheduleTable;
