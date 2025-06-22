
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const RecentActivity = () => {
  const enrollments = [
    { name: 'Emma Thompson', course: 'Computer Science 101', time: '2 hours ago' },
    { name: 'Michael Chen', course: 'Data Analytics', time: '4 hours ago' },
    { name: 'Sofia Garcia', course: 'Digital Marketing', time: '1 day ago' }
  ];

  const alerts = [
    {
      type: 'warning',
      title: 'Server Maintenance',
      description: 'Scheduled for Sunday 2:00 AM - 4:00 AM',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600'
    },
    {
      type: 'success',
      title: 'Backup Completed',
      description: 'Database backup successful',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      type: 'info',
      title: 'New Feature',
      description: 'Student progress tracking now available',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="edu-card">
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>Latest student registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
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
            {alerts.map((alert, index) => (
              <div key={index} className={`${alert.bgColor} border ${alert.borderColor} rounded-lg p-3`}>
                <p className={`text-sm font-medium ${alert.type === 'warning' ? 'edu-highlight' : alert.type === 'success' ? 'edu-positive' : 'text-blue-800'}`}>
                  {alert.title}
                </p>
                <p className={`text-xs ${alert.textColor}`}>{alert.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;
