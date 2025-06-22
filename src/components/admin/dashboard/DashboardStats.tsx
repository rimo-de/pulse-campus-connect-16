
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, UserPlus, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  studentCount: number;
  courseCount: number;
  trainerCount: number;
}

const DashboardStats = ({ studentCount, courseCount, trainerCount }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="edu-card hover-scale">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{studentCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="edu-card hover-scale">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trainers</p>
              <p className="text-2xl font-bold text-gray-900">{trainerCount}</p>
            </div>
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="edu-card hover-scale">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courseCount}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="edu-card hover-scale">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">+15%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
