import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/contexts/AuthContext';
import { studentCourseAssignmentService } from '@/services/studentCourseAssignmentService';
import type { CourseSchedule } from '@/types/course';
import { format } from 'date-fns';

interface StudentContentProps {
  activeSection: string;
}

const StudentContent = ({ activeSection }: StudentContentProps) => {
  const { user } = useAuth();
  const [assignedSchedules, setAssignedSchedules] = useState<CourseSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadStudentCourses();
    }
  }, [user?.email]);

  const loadStudentCourses = async () => {
    try {
      setIsLoading(true);
      // Get schedules specifically assigned to this student
      const schedules = await studentCourseAssignmentService.getSchedulesByStudent(user?.email || '');
      setAssignedSchedules(schedules);
    } catch (error) {
      console.error('Error loading student courses:', error);
      setAssignedSchedules([]);
    } finally {
      setIsLoading(false);
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

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const getAverageProgress = () => {
    if (assignedSchedules.length === 0) return 0;
    const totalProgress = assignedSchedules.reduce((sum, schedule) => {
      return sum + calculateProgress(schedule.start_date, schedule.end_date);
    }, 0);
    return Math.round(totalProgress / assignedSchedules.length);
  };

  const getActiveCoursesCount = () => {
    return assignedSchedules.filter(schedule => schedule.status === 'ongoing').length;
  };

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
                <p className="text-2xl font-bold text-gray-900">{getActiveCoursesCount()}</p>
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
                <p className="text-2xl font-bold text-gray-900">{getAverageProgress()}%</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="edu-card hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{assignedSchedules.length}</p>
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
      
      {isLoading ? (
        <div className="text-center py-8">Loading courses...</div>
      ) : assignedSchedules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No courses assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedSchedules.map((schedule) => {
            const progress = calculateProgress(schedule.start_date, schedule.end_date);
            return (
              <Card key={schedule.id} className="edu-card hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{schedule.course?.course_title}</span>
                    <Badge className={getStatusBadgeColor(schedule.status)}>
                      {schedule.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{schedule.course?.course_description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Instructor: {schedule.instructor_id || 'TBD'}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="w-4 h-4" />
                        <span>{format(new Date(schedule.start_date), 'dd MMM yyyy')} - {format(new Date(schedule.end_date), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.course_offering?.duration_days} working days</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span>Delivery: {schedule.course_offering?.delivery_mode?.delivery_method} - {schedule.course_offering?.delivery_mode?.delivery_type}</span>
                      </div>
                    </div>
                    {schedule.status === 'ongoing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    <Button className="w-full">
                      {schedule.status === 'ongoing' ? 'Continue Learning' : 'View Course'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
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
      
      {isLoading ? (
        <div className="text-center py-8">Loading schedules...</div>
      ) : assignedSchedules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No schedules available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignedSchedules.map((schedule) => (
            <Card key={schedule.id} className="edu-card hover-scale">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {schedule.course?.course_title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="w-4 h-4" />
                        <span>{format(new Date(schedule.start_date), 'dd MMM yyyy')} - {format(new Date(schedule.end_date), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Instructor: {schedule.instructor_id || 'TBD'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.course_offering?.duration_days} working days</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Delivery: {schedule.course_offering?.delivery_mode?.delivery_method}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(schedule.status)}>
                    {schedule.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
