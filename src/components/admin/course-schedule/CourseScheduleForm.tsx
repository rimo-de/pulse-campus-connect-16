
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Info, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/services/courseService';
import { courseScheduleService } from '@/services/courseScheduleService';
import { holidayService } from '@/services/holidayService';
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

  const getAvailableOfferings = (): CourseOffering[] => {
    const selectedCourse = getSelectedCourse();
    return selectedCourse?.course_offerings.filter(offering => offering.is_active) || [];
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
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
              {/* Course Selection */}
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
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
                  onValueChange={setSelectedOfferingId}
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

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={isDateDisabled}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Calculation Results */}
              {dateCalculation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Schedule Calculation</h4>
                  </div>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>End Date:</strong> {format(dateCalculation.end_date, 'PPP')}</div>
                    <div><strong>Working Days:</strong> {dateCalculation.working_days}</div>
                    <div><strong>Total Calendar Days:</strong> {dateCalculation.total_calendar_days}</div>
                    {dateCalculation.weekends_skipped > 0 && (
                      <div><strong>Weekends Skipped:</strong> {dateCalculation.weekends_skipped}</div>
                    )}
                    {dateCalculation.holidays_skipped.length > 0 && (
                      <div>
                        <strong>Holidays Skipped:</strong> {dateCalculation.holidays_skipped.length}
                        <div className="ml-4 text-xs">
                          {dateCalculation.holidays_skipped.map(holiday => (
                            <div key={holiday.date}>{holiday.name} ({format(new Date(holiday.date), 'dd MMM')})</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {isCalculating && (
                    <div className="text-sm text-blue-600">Calculating with German holidays...</div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !selectedCourseId || !selectedOfferingId || !startDate}
                  className="edu-button"
                >
                  {isLoading ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseScheduleForm;
