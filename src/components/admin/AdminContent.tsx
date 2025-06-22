
import React from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp,
  GraduationCap,
  UserPlus,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';
import StudentManagement from './StudentManagement';
import CourseManagement from './CourseManagement';
import CourseScheduleManagement from './CourseScheduleManagement';
import EnrolledStudentsView from './EnrolledStudentsView';
import TrainerManagement from './TrainerManagement';
import AssignedTrainersView from './AssignedTrainersView';
import DashboardOverview from './dashboard/DashboardOverview';
import PlaceholderContent from './dashboard/PlaceholderContent';

interface AdminContentProps {
  activeSection: string;
}

const AdminContent = ({ activeSection }: AdminContentProps) => {
  switch (activeSection) {
    case 'dashboard':
      return <DashboardOverview />;
    case 'maintain-students':
      return <StudentManagement />;
    case 'view-enrolled-students':
      return <EnrolledStudentsView />;
    case 'create-course':
      return <CourseManagement />;
    case 'course-schedule':
      return <CourseScheduleManagement />;
    case 'manage-trainers':
      return <TrainerManagement />;
    case 'assigned-trainers':
      return <AssignedTrainersView />;
    case 'add-student':
      return <PlaceholderContent title="Add Student" description="Register new students to the system" icon={UserPlus} />;
    case 'view-students':
      return <PlaceholderContent title="View Students" description="Manage and view all registered students" icon={Users} />;
    case 'enrollments':
      return <PlaceholderContent title="Enrollments" description="Track and manage student enrollments" icon={BookOpen} />;
    case 'trainer-assignments':
      return <PlaceholderContent title="Trainer Assignments" description="Assign trainers to courses and students" icon={Users} />;
    case 'analytics':
      return <PlaceholderContent title="Analytics" description="View detailed analytics and insights" icon={BarChart3} />;
    case 'completion-rates':
      return <PlaceholderContent title="Completion Rates" description="Track student progress and completion rates" icon={TrendingUp} />;
    case 'system-reports':
      return <PlaceholderContent title="System Reports" description="Generate and download system reports" icon={BarChart3} />;
    case 'schedule-events':
      return <PlaceholderContent title="Schedule Events" description="Plan and schedule institutional events" icon={Calendar} />;
    case 'calendar-view':
      return <PlaceholderContent title="Calendar View" description="View all events in calendar format" icon={Calendar} />;
    case 'system-settings':
      return <PlaceholderContent title="System Settings" description="Configure system-wide settings" icon={Settings} />;
    case 'user-management':
      return <PlaceholderContent title="User Management" description="Manage user accounts and permissions" icon={Users} />;
    case 'manage-assets':
      return <PlaceholderContent title="Manage Assets" description="Manage system assets and resources" icon={Settings} />;
    case 'media-library':
      return <PlaceholderContent title="Media Library" description="Manage media files and documents" icon={Settings} />;
    case 'file-storage':
      return <PlaceholderContent title="File Storage" description="Manage file storage and organization" icon={Settings} />;
    default:
      return <DashboardOverview />;
  }
};

export default AdminContent;
