
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  studentCount: number;
  courseCount: number;
}

const DashboardStats = ({ studentCount, courseCount }: DashboardStatsProps) => {
  const stats = [
    { title: 'Total Students', value: studentCount.toString(), icon: Users, change: '+12%' },
    { title: 'Active Courses', value: courseCount.toString(), icon: BookOpen, change: '+3%' },
    { title: 'Trainers', value: '48', icon: GraduationCap, change: '+1%' },
    { title: 'Completion Rate', value: '89%', icon: TrendingUp, change: '+5%' }
  ];

  return (
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
  );
};

export default DashboardStats;
