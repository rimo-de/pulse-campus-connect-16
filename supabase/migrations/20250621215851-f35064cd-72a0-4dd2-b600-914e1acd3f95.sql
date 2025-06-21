
-- Create course_schedules table
CREATE TABLE public.course_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  course_offering_id UUID NOT NULL REFERENCES public.course_offerings(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  instructor_id UUID NULL, -- For future instructor assignment
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_course_schedules_course_id ON public.course_schedules(course_id);
CREATE INDEX idx_course_schedules_start_date ON public.course_schedules(start_date);
CREATE INDEX idx_course_schedules_status ON public.course_schedules(status);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_course_schedules_updated_at
  BEFORE UPDATE ON public.course_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (Row Level Security) - for now allow all operations
ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for course schedules (adjust based on your auth needs)
CREATE POLICY "Allow all operations on course schedules" 
  ON public.course_schedules 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
