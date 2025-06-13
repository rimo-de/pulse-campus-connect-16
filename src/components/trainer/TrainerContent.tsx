
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp,
  Clock,
  LayoutDashboard,
  PlusCircle,
  Library,
  Calendar,
  UserCheck,
  MessageSquare,
  FileText,
  ClipboardCheck,
  BarChart3,
  Settings
} from 'lucide-react';

interface TrainerContentProps {
  activeSection: string;
}

const TrainerContent = ({ activeSection }: TrainerContentProps) => {
  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold edu-gradient-text mb-2">Trainer Dashboard</h2>
        <p className="text-gray-600">Manage your courses and track student progress.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">74</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold text-gray-900">63%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderGenericSection = (title: string, icon: React.ElementType, description: string) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        {React.createElement(icon, { className: "w-8 h-8 text-purple-600" })}
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
      return renderGenericSection('My Courses', BookOpen, 'Manage and view your courses');
    case 'create-course':
      return renderGenericSection('Create Course', PlusCircle, 'Create new courses and curriculum');
    case 'course-materials':
      return renderGenericSection('Course Materials', Library, 'Upload and manage course content');
    case 'class-schedule':
      return renderGenericSection('Class Schedule', Calendar, 'Manage your class timetable');
    case 'student-list':
      return renderGenericSection('Student List', Users, 'View and manage enrolled students');
    case 'student-progress':
      return renderGenericSection('Student Progress', TrendingUp, 'Track individual student progress');
    case 'attendance':
      return renderGenericSection('Attendance', UserCheck, 'Monitor student attendance');
    case 'communications':
      return renderGenericSection('Communications', MessageSquare, 'Communicate with students');
    case 'create-assignments':
      return renderGenericSection('Create Assignments', FileText, 'Create and assign homework');
    case 'grade-assignments':
      return renderGenericSection('Grade Assignments', ClipboardCheck, 'Review and grade submissions');
    case 'quizzes-exams':
      return renderGenericSection('Quizzes & Exams', FileText, 'Create and manage assessments');
    case 'performance-reports':
      return renderGenericSection('Performance Reports', BarChart3, 'Generate performance analytics');
    case 'course-analytics':
      return renderGenericSection('Course Analytics', TrendingUp, 'Analyze course effectiveness');
    case 'student-insights':
      return renderGenericSection('Student Insights', Users, 'Get detailed student analytics');
    case 'content-library':
      return renderGenericSection('Content Library', Library, 'Access shared content resources');
    case 'shared-resources':
      return renderGenericSection('Shared Resources', BookOpen, 'Share resources with colleagues');
    case 'settings':
      return renderGenericSection('Settings', Settings, 'Manage your account preferences');
    default:
      return renderDashboard();
  }
};

export default TrainerContent;
