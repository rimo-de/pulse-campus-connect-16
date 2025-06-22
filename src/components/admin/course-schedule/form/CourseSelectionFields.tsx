
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CourseWithOfferings, CourseOffering } from '@/types/course';

interface CourseSelectionFieldsProps {
  courses: CourseWithOfferings[];
  selectedCourseId: string;
  selectedOfferingId: string;
  onCourseChange: (courseId: string) => void;
  onOfferingChange: (offeringId: string) => void;
}

const CourseSelectionFields = ({
  courses,
  selectedCourseId,
  selectedOfferingId,
  onCourseChange,
  onOfferingChange
}: CourseSelectionFieldsProps) => {
  const getAvailableOfferings = (): CourseOffering[] => {
    const selectedCourse = courses.find(course => course.id === selectedCourseId);
    return selectedCourse?.course_offerings.filter(offering => offering.is_active) || [];
  };

  return (
    <>
      {/* Course Selection */}
      <div className="space-y-2">
        <Label htmlFor="course">Course *</Label>
        <Select value={selectedCourseId} onValueChange={onCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.course_title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Offering Selection */}
      <div className="space-y-2">
        <Label htmlFor="offering">Delivery Mode *</Label>
        <Select 
          value={selectedOfferingId} 
          onValueChange={onOfferingChange}
          disabled={!selectedCourseId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select delivery mode" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableOfferings().map(offering => (
              <SelectItem key={offering.id} value={offering.id}>
                <div>
                  <div>{offering.delivery_mode?.name}</div>
                  <div className="text-sm text-gray-500">
                    {offering.delivery_mode?.delivery_method} • {offering.delivery_mode?.delivery_type} • {offering.duration_days} days
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default CourseSelectionFields;
