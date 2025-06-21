
-- Drop existing RLS policies that require authentication
DROP POLICY IF EXISTS "Authenticated users can view student headers" ON public.student_headers;
DROP POLICY IF EXISTS "Authenticated users can create student headers" ON public.student_headers;
DROP POLICY IF EXISTS "Authenticated users can update student headers" ON public.student_headers;
DROP POLICY IF EXISTS "Authenticated users can delete student headers" ON public.student_headers;

DROP POLICY IF EXISTS "Authenticated users can view student addresses" ON public.student_addresses;
DROP POLICY IF EXISTS "Authenticated users can create student addresses" ON public.student_addresses;
DROP POLICY IF EXISTS "Authenticated users can update student addresses" ON public.student_addresses;
DROP POLICY IF EXISTS "Authenticated users can delete student addresses" ON public.student_addresses;

DROP POLICY IF EXISTS "Authenticated users can view student enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can create student enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can update student enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can delete student enrollments" ON public.student_enrollments;

-- Create new policies that allow public access
CREATE POLICY "Allow all operations on student headers" 
  ON public.student_headers 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on student addresses" 
  ON public.student_addresses 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on student enrollments" 
  ON public.student_enrollments 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
