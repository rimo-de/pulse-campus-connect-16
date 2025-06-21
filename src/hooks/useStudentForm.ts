
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { studentFormSchema, StudentFormData, CompleteStudent } from '@/types/student';
import { StudentService } from '@/services/studentService';

interface UseStudentFormProps {
  student?: CompleteStudent;
  onSuccess: () => void;
}

export const useStudentForm = ({ student, onSuccess }: UseStudentFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
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
    console.log('Submitting student form with data:', data);
    
    try {
      let result;
      
      if (student) {
        // Update existing student
        result = await StudentService.updateStudent(student.id, data);
      } else {
        // Create new student
        result = await StudentService.createStudent(data);
      }

      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save student',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: student ? 'Student updated successfully' : 'Student created successfully',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return { form, onSubmit };
};
