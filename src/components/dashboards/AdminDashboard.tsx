
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Settings,
  UserPlus,
  GraduationCap,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const stats = [
    { title: 'Total Students', value: '1,247', icon: Users, change: '+12%' },
    { title: 'Active Courses', value: '34', icon: BookOpen, change: '+3%' },
    { title: 'Trainers', value: '48', icon: GraduationCap, change: '+1%' },
    { title: 'Completion Rate', value: '89%', icon: TrendingUp, change: '+5%' }
  ];

  const quickActions = [
    { title: 'Add New Student', icon: UserPlus, description: 'Register a new student' },
    { title: 'Create Course', icon: BookOpen, description: 'Set up a new course' },
    { title: 'Schedule Event', icon: Calendar, description: 'Plan institutional events' },
    { title: 'View Reports', icon: BarChart3, description: 'Access analytics and reports' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Digital4 Pulse</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
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
                  <p className="text-xs text-gray-500">Administrator</p>
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
            <p className="text-gray-600">Here's what's happening at your institution today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change} from last month</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="bg-indigo-50 p-3 rounded-full w-fit">
                      <action.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-base mb-2">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
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
                    <div key={enrollment.name} className="flex items-center justify-between">
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

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Important notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-800">Server Maintenance</p>
                    <p className="text-xs text-yellow-600">Scheduled for Sunday 2:00 AM - 4:00 AM</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800">Backup Completed</p>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
