
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Clock,
  PlayCircle,
  FileText,
  Users,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const courses = [
    { 
      title: 'Introduction to Programming', 
      progress: 75, 
      nextDeadline: 'Assignment due in 3 days',
      instructor: 'Dr. Smith'
    },
    { 
      title: 'Web Development Fundamentals', 
      progress: 45, 
      nextDeadline: 'Quiz tomorrow',
      instructor: 'Prof. Johnson'
    },
    { 
      title: 'Database Management', 
      progress: 90, 
      nextDeadline: 'Final exam in 1 week',
      instructor: 'Dr. Chen'
    }
  ];

  const upcomingEvents = [
    { title: 'Programming Assignment', date: 'Today, 11:59 PM', type: 'assignment' },
    { title: 'Web Dev Quiz', date: 'Tomorrow, 2:00 PM', type: 'quiz' },
    { title: 'Career Fair', date: 'Friday, 10:00 AM', type: 'event' },
    { title: 'Study Group Meeting', date: 'Saturday, 3:00 PM', type: 'meeting' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Digital4 Pulse</h1>
                <p className="text-sm text-gray-500">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}</h2>
            <p className="text-gray-600">Continue your learning journey and track your progress.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
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
            
            <Card>
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
            
            <Card>
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
            
            <Card>
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

          {/* Course Progress */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.title} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <CardDescription>Instructor: {course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-yellow-800">{course.nextDeadline}</p>
                      </div>
                      <Button className="w-full" variant="outline">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Events and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your schedule for the next few days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BookOpen className="w-6 h-6 mb-2" />
                    <span className="text-sm">My Courses</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-sm">Assignments</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Award className="w-6 h-6 mb-2" />
                    <span className="text-sm">Grades</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Users className="w-6 h-6 mb-2" />
                    <span className="text-sm">Study Groups</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
