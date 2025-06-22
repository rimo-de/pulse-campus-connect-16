
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services/courseService';
import { courseScheduleService } from '@/services/courseScheduleService';
import { holidayService } from '@/services/holidayService';
import CourseSelectionFields from './form/CourseSelectionFields';
import DateSelectionField from './form/DateSelectionField';
import DateCalculationDisplay from './form/DateCalculationDisplay';
import CourseScheduleFormActions from './form/CourseScheduleFormActions';
import type { CourseWithOfferings, CourseOffering, CourseSchedule, DateCalculationResult } from '@/types/course';

interface CourseScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSchedule?: CourseSchedule | null;
}

const CourseScheduleForm = ({ isOpen, onClose, onSuccess, editingSchedule }: CourseScheduleFormProps) => {
  const [courses, setCourses] = useState<CourseWithOfferings[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [dateCalculation, setDateCalculation] = useState<DateCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCourses();
      if (editingSchedule) {
        setSelectedCourseId(editingSchedule.course_id);
        setSelectedOfferingId(editingSchedule.course_offering_id);
        setStartDate(new Date(editingSchedule.start_date));
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingSchedule]);

  useEffect(() => {
    if (startDate && selectedOfferingId) {
      calculateEndDate();
    } else {
      setDateCalculation(null);
    }
  }, [startDate, selectedOfferingId]);

  const loadCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedCourseId('');
    setSelectedOfferingId('');
    setStartDate(undefined);
    setDateCalculation(null);
  };

  const calculateEndDate = async () => {
    if (!startDate || !selectedOfferingId) return;

    setIsCalculating(true);
    try {
      const offering = getSelectedOffering();
      if (!offering) return;

      const calculation = await holidayService.calculateEndDate(startDate, offering.duration_days);
      setDateCalculation(calculation);
    } catch (error) {
      console.error('Error calculating end date:', error);
      toast({
        title: "Warning",
        description: "Could not calculate exact end date. Using simple calculation instead.",
        variant: "destructive",
      });
      
      // Fallback calculation without holidays
      const offering = getSelectedOffering();
      if (offering) {
        const endDate = new Date(startDate);
        let workingDaysAdded = 0;
        
        while (workingDaysAdded < offering.duration_days) {
          endDate.setDate(endDate.getDate() + 1);
          const dayOfWeek = endDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
            workingDaysAdded++;
          }
        }
        
        setDateCalculation({
          end_date: endDate,
          total_calendar_days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
          working_days: offering.duration_days,
          holidays_skipped: [],
          weekends_skipped: 0
        });
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const getSelectedCourse = () => {
    return courses.find(course => course.id === selectedCourseId);
  };

  const getSelectedOffering = (): CourseOffering | undefined => {
    const selectedCourse = getSelectedCourse();
    return selectedCourse?.course_offerings.find(offering => offering.id === selectedOfferingId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId || !selectedOfferingId || !startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const scheduleData = {
        course_id: selectedCourseId,
        course_offering_id: selectedOfferingId,
        start_date: startDate,
      };

      if (editingSchedule) {
        await courseScheduleService.updateSchedule(editingSchedule.id, scheduleData);
        toast({
          title: "Success",
          description: "Course schedule updated successfully",
        });
      } else {
        await courseScheduleService.createSchedule(scheduleData);
        toast({
          title: "Success",
          description: "Course schedule created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: editingSchedule ? "Failed to update schedule" : "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedCourseId && selectedOfferingId && startDate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingSchedule ? 'Edit Course Schedule' : 'Schedule New Course Batch'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <CourseSelectionFields
                courses={courses}
                selectedCourseId={selectedCourseId}
                selectedOfferingId={selectedOfferingId}
                onCourseChange={setSelectedCourseId}
                onOfferingChange={setSelectedOfferingId}
              />

              <DateSelectionField
                startDate={startDate}
                onDateChange={setStartDate}
              />

              <DateCalculationDisplay
                dateCalculation={dateCalculation}
                isCalculating={isCalculating}
              />

              <CourseScheduleFormActions
                onCancel={onClose}
                isLoading={isLoading}
                isFormValid={!!isFormValid}
                isEditMode={!!editingSchedule}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseScheduleForm;
