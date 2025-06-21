
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface AdminContentProps {
  activeSection: string;
}

const AdminContent = ({ activeSection }: AdminContentProps) => {
  const renderDashboard = () => {
    const stats = [
      { title: 'Total Students', value: '1,247', icon: Users, change: '+12%' },
      { title: 'Active Courses', value: '34', icon: BookOpen, change: '+3%' },
      { title: 'Trainers', value: '48', icon: GraduationCap, change: '+1%' },
      { title: 'Completion Rate', value: '89%', icon: TrendingUp, change: '+5%' }
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold edu-gradient-text mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Here's what's happening at your institution today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="edu-card hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm edu-positive">{stat.change} from last month</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-full">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="edu-card">
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
              <CardDescription>Latest student registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Emma Thompson', course: 'Computer Science 101', time: '2 hours ago' },
                  { name: 'Michael Chen', course: 'Data Analytics', time: '4 hours ago' },
                  { name: 'Sofia Garcia', course: 'Digital Marketing', time: '1 day ago' }
                ].map((enrollment) => (
                  <div key={enrollment.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{enrollment.name}</p>
                      <p className="text-sm text-gray-500">{enrollment.course}</p>
                    </div>
                    <p className="text-xs text-gray-400">{enrollment.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="edu-card">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium edu-highlight">Server Maintenance</p>
                  <p className="text-xs text-yellow-600">Scheduled for Sunday 2:00 AM - 4:00 AM</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium edu-positive">Backup Completed</p>
                  <p className="text-xs text-green-600">Database backup successful</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">New Feature</p>
                  <p className="text-xs text-blue-600">Student progress tracking now available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderPlaceholderContent = (title: string, description: string, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold edu-gradient-text mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <Card className="edu-card text-center py-12">
          <CardContent>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-4">This functionality is under development.</p>
            <Button className="edu-button">
              Get Notified
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  switch (activeSection) {
    case 'dashboard':
      return renderDashboard();
    case 'maintain-students':
      return <StudentManagement />;
    case 'create-course':
    case 'manage-courses':
      return <CourseManagement />;
    case 'course-schedule':
      return <CourseScheduleManagement />;
    case 'add-student':
      return renderPlaceholderContent('Add Student', 'Register new students to the system', UserPlus);
    case 'view-students':
      return renderPlaceholderContent('View Students', 'Manage and view all registered students', Users);
    case 'enrollments':
      return renderPlaceholderContent('Enrollments', 'Track and manage student enrollments', BookOpen);
    case 'manage-trainers':
      return renderPlaceholderContent('Manage Trainers', 'Add and manage trainer accounts', GraduationCap);
    case 'trainer-assignments':
      return renderPlaceholderContent('Trainer Assignments', 'Assign trainers to courses and students', Users);
    case 'analytics':
      return renderPlaceholderContent('Analytics', 'View detailed analytics and insights', BarChart3);
    case 'completion-rates':
      return renderPlaceholderContent('Completion Rates', 'Track student progress and completion rates', TrendingUp);
    case 'system-reports':
      return renderPlaceholderContent('System Reports', 'Generate and download system reports', BarChart3);
    case 'schedule-events':
      return renderPlaceholderContent('Schedule Events', 'Plan and schedule institutional events', Calendar);
    case 'calendar-view':
      return renderPlaceholderContent('Calendar View', 'View all events in calendar format', Calendar);
    case 'system-settings':
      return renderPlaceholderContent('System Settings', 'Configure system-wide settings', Settings);
    case 'user-management':
      return renderPlaceholderContent('User Management', 'Manage user accounts and permissions', Users);
    default:
      return renderDashboard();
  }
};

export default AdminContent;
