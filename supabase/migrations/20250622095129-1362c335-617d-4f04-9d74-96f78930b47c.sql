
-- Create StudentCourseAssignments table to map students to course schedules
CREATE TABLE public.student_course_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_headers(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.course_schedules(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, schedule_id) -- Prevent duplicate assignments
);

-- Add RLS policies for the new table
ALTER TABLE public.student_course_assignments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (since we don't have authentication implemented)
CREATE POLICY "Allow all operations on student_course_assignments" 
  ON public.student_course_assignments 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_student_course_assignments_updated_at
  BEFORE UPDATE ON public.student_course_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
