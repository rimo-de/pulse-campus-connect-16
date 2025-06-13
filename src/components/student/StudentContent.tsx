
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Clock,
  PlayCircle,
  FileText,
  Users,
  GraduationCap,
  BarChart3,
  MessageCircle,
  Bell,
  User,
  Settings
} from 'lucide-react';

interface StudentContentProps {
  activeSection: string;
}

const StudentContent = ({ activeSection }: StudentContentProps) => {
  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold edu-gradient-text mb-2">Student Dashboard</h2>
        <p className="text-gray-600">Continue your learning journey and track your progress.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold text-gray-900">70%</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGenericSection = (title: string, icon: React.ElementType, description: string) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        {React.createElement(icon, { className: "w-8 h-8 text-blue-600" })}
        <div>
          <h2 className="text-2xl font-bold edu-gradient-text">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
      
      <Card className="edu-card">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            We're working hard to bring you the best {title.toLowerCase()} experience. 
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );

  switch (activeSection) {
    case 'dashboard':
      return renderDashboard();
    case 'my-courses':
      return renderGenericSection('My Courses', BookOpen, 'Access and manage your enrolled courses');
    case 'assignments':
      return renderGenericSection('Assignments', FileText, 'View and submit your assignments');
    case 'study-materials':
      return renderGenericSection('Study Materials', PlayCircle, 'Access course materials and resources');
    case 'progress-tracking':
      return renderGenericSection('Progress Tracking', BarChart3, 'Monitor your learning progress');
    case 'class-schedule':
      return renderGenericSection('Class Schedule', Calendar, 'View your class timetable');
    case 'upcoming-events':
      return renderGenericSection('Upcoming Events', Clock, 'Stay updated with upcoming events');
    case 'calendar-view':
      return renderGenericSection('Calendar View', Calendar, 'View your schedule in calendar format');
    case 'grades-results':
      return renderGenericSection('Grades & Results', Award, 'Check your grades and test results');
    case 'certificates':
      return renderGenericSection('Certificates', GraduationCap, 'View and download your certificates');
    case 'study-groups':
      return renderGenericSection('Study Groups', Users, 'Join and participate in study groups');
    case 'forums':
      return renderGenericSection('Forums', MessageCircle, 'Engage in course discussions');
    case 'profile':
      return renderGenericSection('Profile', User, 'Manage your profile information');
    case 'notifications':
      return renderGenericSection('Notifications', Bell, 'Manage your notification preferences');
    case 'preferences':
      return renderGenericSection('Preferences', Settings, 'Customize your account settings');
    default:
      return renderDashboard();
  }
};

export default StudentContent;
