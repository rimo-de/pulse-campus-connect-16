
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, UserPlus, Package } from 'lucide-react';

interface DashboardStatsProps {
  studentCount: number;
  courseCount: number;
  trainerCount: number;
  assetCount?: number;
}

const DashboardStats = ({ studentCount, courseCount, trainerCount, assetCount = 0 }: DashboardStatsProps) => {
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
              <p className="text-sm font-medium text-gray-600">Physical Assets</p>
              <p className="text-2xl font-bold text-gray-900">{assetCount}</p>
            </div>
            <Package className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
