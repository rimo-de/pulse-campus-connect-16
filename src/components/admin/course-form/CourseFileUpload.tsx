
import React from 'react';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import type { CourseFormData, Course } from '@/types/course';

interface CourseFileUploadProps {
  formData: CourseFormData;
  editingCourse?: Course | null;
  onFieldChange: (field: keyof CourseFormData, value: any) => void;
}

const CourseFileUpload = ({ formData, editingCourse, onFieldChange }: CourseFileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    onFieldChange('curriculum_file', file);
  };

  return (
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
  );
};

export default CourseFileUpload;
