
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { studentSchema, StudentFormData } from '@/types/student';
import { Tables } from '@/integrations/supabase/types';

interface UseStudentFormProps {
  student?: Tables<'students'>;
  onSuccess: () => void;
}

export const useStudentForm = ({ student, onSuccess }: UseStudentFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student ? {
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender as 'male' | 'female' | 'other',
      email: student.email,
      mobile_number: student.mobile_number || '',
      nationality: student.nationality,
      education_background: student.education_background as 'school' | 'graduation' | 'masters' | 'phd' | 'diploma' | 'certification',
      english_proficiency: student.english_proficiency as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
      german_proficiency: student.german_proficiency as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
      street: student.street,
      postal_code: student.postal_code,
      city: student.city,
    } : {
      first_name: '',
      last_name: '',
      gender: 'male',
      email: '',
      mobile_number: '',
      nationality: '',
      education_background: 'graduation',
      english_proficiency: 'B1',
      german_proficiency: 'A1',
      street: '',
      postal_code: '',
      city: '',
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (student) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(data)
          .eq('id', student.id);

        if (error) {
          console.error('Error updating student:', error);
          toast({
            title: 'Error',
            description: 'Failed to update student',
            variant: 'destructive',
          });
          return;
        }
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert(data as Tables<'students'>['Insert']);

        if (error) {
          console.error('Error creating student:', error);
          toast({
            title: 'Error',
            description: 'Failed to create student',
            variant: 'destructive',
          });
          return;
        }
      }

      toast({
        title: 'Success',
        description: student ? 'Student updated successfully' : 'Student created successfully',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return { form, onSubmit };
};
