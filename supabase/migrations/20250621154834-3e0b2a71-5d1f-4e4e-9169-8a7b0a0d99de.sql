
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_title TEXT NOT NULL,
  course_description TEXT,
  massnahmenummer TEXT,
  number_of_days INTEGER,
  delivery_mode TEXT CHECK (delivery_mode IN ('Online', 'Remote')),
  delivery_type TEXT CHECK (delivery_type IN ('Full time', 'Part time')),
  curriculum_file_name TEXT,
  curriculum_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access (consistent with student tables)
CREATE POLICY "Allow all operations on courses" 
  ON public.courses 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for course curriculum files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-curriculum', 'course-curriculum', true);

-- Create storage policy for curriculum files
CREATE POLICY "Allow all operations on course curriculum files"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'course-curriculum')
  WITH CHECK (bucket_id = 'course-curriculum');

-- Add trigger for updating updated_at column
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
