
-- Create trainer assignments table to link trainers with course schedules
CREATE TABLE public.trainer_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.course_schedules(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, schedule_id) -- Prevent duplicate assignments
);

-- Add trigger for updated_at
CREATE TRIGGER update_trainer_assignments_updated_at
    BEFORE UPDATE ON public.trainer_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_trainer_assignments_trainer_id ON public.trainer_assignments(trainer_id);
CREATE INDEX idx_trainer_assignments_schedule_id ON public.trainer_assignments(schedule_id);
