
-- Drop the existing students table and recreate with normalized structure
DROP TABLE IF EXISTS public.students CASCADE;

-- Create student_headers table (core personal information)
CREATE TABLE public.student_headers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  email TEXT UNIQUE NOT NULL,
  mobile_number TEXT,
  nationality TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_addresses table
CREATE TABLE public.student_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_headers(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_enrollments table
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_headers(id) ON DELETE CASCADE,
  education_background TEXT CHECK (education_background IN ('school', 'graduation', 'masters', 'phd', 'diploma', 'certification')),
  english_proficiency TEXT CHECK (english_proficiency IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  german_proficiency TEXT CHECK (german_proficiency IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.student_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_headers
CREATE POLICY "Authenticated users can view student headers" 
  ON public.student_headers 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create student headers" 
  ON public.student_headers 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update student headers" 
  ON public.student_headers 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete student headers" 
  ON public.student_headers 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Create RLS policies for student_addresses
CREATE POLICY "Authenticated users can view student addresses" 
  ON public.student_addresses 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create student addresses" 
  ON public.student_addresses 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update student addresses" 
  ON public.student_addresses 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete student addresses" 
  ON public.student_addresses 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Create RLS policies for student_enrollments
CREATE POLICY "Authenticated users can view student enrollments" 
  ON public.student_enrollments 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create student enrollments" 
  ON public.student_enrollments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update student enrollments" 
  ON public.student_enrollments 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete student enrollments" 
  ON public.student_enrollments 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_student_headers_updated_at 
    BEFORE UPDATE ON public.student_headers 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_addresses_updated_at 
    BEFORE UPDATE ON public.student_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_enrollments_updated_at 
    BEFORE UPDATE ON public.student_enrollments 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
