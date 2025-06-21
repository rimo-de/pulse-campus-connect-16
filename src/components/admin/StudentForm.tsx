
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useStudentForm } from '@/hooks/useStudentForm';
import { CompleteStudent } from '@/types/student';
import PersonalInfoSection from './forms/PersonalInfoSection';
import EducationAddressSection from './forms/EducationAddressSection';

interface StudentFormProps {
  student?: CompleteStudent;
  onSuccess: () => void;
}

const StudentForm = ({ student, onSuccess }: StudentFormProps) => {
  const { form, onSubmit } = useStudentForm({ student, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PersonalInfoSection control={form.control} />
          <EducationAddressSection control={form.control} />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" className="edu-button">
            {student ? 'Update Student' : 'Create Student'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StudentForm;
