
import React, { useEffect, useState } from 'react';
import { StudentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { TrainerService } from '@/services/trainerService';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';

const DashboardOverview = () => {
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [trainerCount, setTrainerCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch student count
        const studentsResult = await StudentService.getAllStudents();
        setStudentCount(studentsResult.data.length);

        // Fetch course count
        const coursesResult = await courseService.getAllCourses();
        setCourseCount(coursesResult.length);

        // Fetch trainer count
        const trainersResult = await TrainerService.getAllTrainers();
        setTrainerCount(trainersResult.data.length);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold edu-gradient-text mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Here's what's happening at your institution today.</p>
      </div>

      <DashboardStats 
        studentCount={studentCount} 
        courseCount={courseCount} 
        trainerCount={trainerCount}
      />
      <RecentActivity />
    </div>
  );
};

export default DashboardOverview;
