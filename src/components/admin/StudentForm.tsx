
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email address'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  education_background: z.enum(['school', 'graduation', 'masters', 'phd', 'diploma', 'certification']),
  english_proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  german_proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  street: z.string().min(1, 'Street address is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: any;
  onSuccess: () => void;
}

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 
  'Brazil', 'Canada', 'China', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Italy', 'Japan', 'Jordan', 'Kenya', 
  'Malaysia', 'Mexico', 'Netherlands', 'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland', 
  'Portugal', 'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 
  'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam'
];

const StudentForm = ({ student, onSuccess }: StudentFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student ? {
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
      email: student.email,
      mobile_number: student.mobile_number,
      nationality: student.nationality,
      education_background: student.education_background,
      english_proficiency: student.english_proficiency,
      german_proficiency: student.german_proficiency,
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
          .insert(data);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Education & Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Education & Address</h3>
            
            <FormField
              control={form.control}
              name="education_background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Background</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="masters">Masters</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="english_proficiency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Proficiency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="C1">C1</SelectItem>
                      <SelectItem value="C2">C2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="german_proficiency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>German Proficiency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="C1">C1</SelectItem>
                      <SelectItem value="C2">C2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
