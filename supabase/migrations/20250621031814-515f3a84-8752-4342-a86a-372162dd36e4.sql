
-- Create students table with all required fields
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  email TEXT UNIQUE NOT NULL,
  mobile_number TEXT,
  nationality TEXT NOT NULL,
  education_background TEXT CHECK (education_background IN ('school', 'graduation', 'masters', 'phd', 'diploma', 'certification')),
  english_proficiency TEXT CHECK (english_proficiency IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  german_proficiency TEXT CHECK (german_proficiency IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  street TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure only authenticated users can access student records
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to SELECT student records
CREATE POLICY "Authenticated users can view students" 
  ON public.students 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to INSERT student records
CREATE POLICY "Authenticated users can create students" 
  ON public.students 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows authenticated users to UPDATE student records
CREATE POLICY "Authenticated users can update students" 
  ON public.students 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to DELETE student records
CREATE POLICY "Authenticated users can delete students" 
  ON public.students 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON public.students 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
