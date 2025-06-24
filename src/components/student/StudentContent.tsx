
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
  User,
  MapPin,
  CalendarDays
} from 'lucide-react';

interface StudentContentProps {
  activeSection: string;
}

const StudentContent = ({ activeSection }: StudentContentProps) => {
  // Mock data for courses assigned to student
  const mockCourses = [
    {
      id: '1',
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      status: 'In Progress',
      progress: 75,
      instructor: 'Shams Ahmed',
      startDate: '2024-06-01',
      endDate: '2024-08-01'
    },
    {
      id: '2',
      title: 'Digital Marketing Essentials',
      description: 'Comprehensive guide to modern digital marketing',
      status: 'Upcoming',
      progress: 0,
      instructor: 'Shams Ahmed',
      startDate: '2024-07-15',
      endDate: '2024-09-15'
    }
  ];

  // Mock data for schedules
  const mockSchedules = [
    {
      id: '1',
      courseTitle: 'Web Development Fundamentals',
      startDate: '2024-06-01',
      endDate: '2024-08-01',
      instructor: 'Shams Ahmed',
      status: 'Active',
      location: 'Room 101',
      time: '9:00 AM - 12:00 PM'
    },
    {
      id: '2',
      courseTitle: 'Digital Marketing Essentials',
      startDate: '2024-07-15',
      endDate: '2024-09-15',
      instructor: 'Shams Ahmed',
      status: 'Upcoming',
      location: 'Room 203',
      time: '2:00 PM - 5:00 PM'
    }
  ];

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
                <p className="text-2xl font-bold text-gray-900">2</p>
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
                <p className="text-2xl font-bold text-gray-900">38%</p>
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
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMyCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold edu-gradient-text">My Courses</h2>
          <p className="text-gray-600">Courses assigned to you by the admin</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCourses.map((course) => (
          <Card key={course.id} className="edu-card hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{course.title}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.status === 'In Progress' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {course.status}
                </span>
              </CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Instructor: {course.instructor}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{course.startDate} - {course.endDate}</span>
                </div>
                {course.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}
                <Button className="w-full">
                  {course.status === 'In Progress' ? 'Continue Learning' : 'View Course'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSchedules = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calendar className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold edu-gradient-text">Schedules</h2>
          <p className="text-gray-600">Course schedules defined by the admin</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {mockSchedules.map((schedule) => (
          <Card key={schedule.id} className="edu-card hover-scale">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {schedule.courseTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>{schedule.startDate} - {schedule.endDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Instructor: {schedule.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{schedule.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{schedule.time}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  schedule.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {schedule.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
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
      return renderMyCourses();
    case 'schedules':
      return renderSchedules();
    case 'course-materials':
      return renderGenericSection('Course Materials', PlayCircle, 'Access course materials and resources');
    default:
      return renderDashboard();
  }
};

export default StudentContent;
