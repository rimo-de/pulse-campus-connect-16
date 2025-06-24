
import React from 'react';
import DashboardOverview from './dashboard/DashboardOverview';
import StudentManagement from './StudentManagement';
import TrainerManagement from './TrainerManagement';
import CourseManagement from './CourseManagement';
import CourseScheduleManagement from './CourseScheduleManagement';
import AssetManagement from './AssetManagement';
import PhysicalAssetManagement from './PhysicalAssetManagement';
import AssetAssignmentView from './AssetAssignmentView';
import UserManagement from './UserManagement';

interface AdminContentProps {
  activeSection: string;
}

const AdminContent = ({ activeSection }: AdminContentProps) => {
  switch (activeSection) {
    case 'dashboard':
      return <DashboardOverview />;
    case 'students':
      return <StudentManagement />;
    case 'trainers':
      return <TrainerManagement />;
    case 'courses':
      return <CourseManagement />;
    case 'schedules':
      return <CourseScheduleManagement />;
    case 'assets':
      return <AssetManagement />;
    case 'maintain-assets':
      return <PhysicalAssetManagement />;
    case 'view-asset-assignments':
      return <AssetAssignmentView />;
    case 'user-management':
      return <UserManagement />;
    default:
      return <DashboardOverview />;
  }
};

export default AdminContent;
