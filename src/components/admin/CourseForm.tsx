
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, FileText } from 'lucide-react';
import { useCourseForm } from '@/hooks/useCourseForm';
import type { Course } from '@/types/course';

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCourse?: Course | null;
}

const CourseForm = ({ isOpen, onClose, onSuccess, editingCourse }: CourseFormProps) => {
  const { formData, handleInputChange, submitForm, resetForm, isLoading, setFormData } = useCourseForm(() => {
    onSuccess();
    onClose();
  });

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        course_title: editingCourse.course_title,
        course_description: editingCourse.course_description || '',
        massnahmenummer: editingCourse.massnahmenummer || '',
        number_of_days: editingCourse.number_of_days || 0,
        delivery_mode: editingCourse.delivery_mode || 'Online',
        delivery_type: editingCourse.delivery_type || 'Full time',
        curriculum_file: null,
      });
    } else {
      resetForm();
    }
  }, [editingCourse, setFormData, resetForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(editingCourse?.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    handleInputChange('curriculum_file', file);
  };

  if (!isOpen) return null;

  const numberOfUnits = formData.number_of_days * 8;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="edu-gradient-text">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Title */}
              <div>
                <Label htmlFor="course_title">Course Title *</Label>
                <Input
                  id="course_title"
                  value={formData.course_title}
                  onChange={(e) => handleInputChange('course_title', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              {/* Course Description */}
              <div>
                <Label htmlFor="course_description">Course Description</Label>
                <Textarea
                  id="course_description"
                  value={formData.course_description}
                  onChange={(e) => handleInputChange('course_description', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Maßnahmenummer */}
              <div>
                <Label htmlFor="massnahmenummer">Maßnahmenummer</Label>
                <Input
                  id="massnahmenummer"
                  value={formData.massnahmenummer}
                  onChange={(e) => handleInputChange('massnahmenummer', e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Number of Days and Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number_of_days">Number of Days</Label>
                  <Input
                    id="number_of_days"
                    type="number"
                    min="0"
                    value={formData.number_of_days}
                    onChange={(e) => handleInputChange('number_of_days', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="number_of_units">Number of Units (Read Only)</Label>
                  <Input
                    id="number_of_units"
                    value={numberOfUnits}
                    readOnly
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>

              {/* Delivery Mode and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_mode">Delivery Mode</Label>
                  <Select
                    value={formData.delivery_mode}
                    onValueChange={(value: 'Online' | 'Remote') => handleInputChange('delivery_mode', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="delivery_type">Delivery Type</Label>
                  <Select
                    value={formData.delivery_type}
                    onValueChange={(value: 'Full time' | 'Part time') => handleInputChange('delivery_type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full time">Full time</SelectItem>
                      <SelectItem value="Part time">Part time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Curriculum File Upload */}
              <div>
                <Label htmlFor="curriculum_file">Detailed Curriculum (PDF)</Label>
                <div className="mt-1">
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="text-center">
                      {formData.curriculum_file ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <FileText className="w-6 h-6" />
                          <span className="text-sm font-medium">{formData.curriculum_file.name}</span>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Click to upload PDF file</p>
                          <p className="text-xs">or drag and drop</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {editingCourse?.curriculum_file_name && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current file: {editingCourse.curriculum_file_name}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={isLoading} className="edu-button flex-1">
                  {isLoading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseForm;
