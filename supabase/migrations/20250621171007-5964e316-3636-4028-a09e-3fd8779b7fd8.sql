
-- Create delivery_modes table to store delivery type configurations
CREATE TABLE public.delivery_modes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Online Full-time", "Remote Part-time"
  delivery_method TEXT NOT NULL, -- "Online" or "Remote"
  delivery_type TEXT NOT NULL, -- "Full time" or "Part time"
  default_duration_days INTEGER NOT NULL DEFAULT 0,
  default_units INTEGER GENERATED ALWAYS AS (default_duration_days * 8) STORED,
  base_fee DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(delivery_method, delivery_type)
);

-- Create course_offerings table (junction table)
CREATE TABLE public.course_offerings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  delivery_mode_id UUID NOT NULL REFERENCES public.delivery_modes(id) ON DELETE CASCADE,
  massnahmenummer TEXT, -- Specific to this course-delivery combination
  duration_days INTEGER NOT NULL,
  units INTEGER GENERATED ALWAYS AS (duration_days * 8) STORED,
  fee DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, delivery_mode_id)
);

-- Insert default delivery modes
INSERT INTO public.delivery_modes (name, delivery_method, delivery_type, default_duration_days, base_fee) VALUES
('Online Full-time', 'Online', 'Full time', 30, 2500.00),
('Online Part-time', 'Online', 'Part time', 60, 2000.00),
('Remote Full-time', 'Remote', 'Full time', 30, 3000.00),
('Remote Part-time', 'Remote', 'Part time', 60, 2500.00);

-- Migrate existing course data to the new structure
-- First, create course offerings for existing courses
INSERT INTO public.course_offerings (course_id, delivery_mode_id, massnahmenummer, duration_days, fee)
SELECT 
  c.id as course_id,
  dm.id as delivery_mode_id,
  c.massnahmenummer,
  COALESCE(c.number_of_days, dm.default_duration_days) as duration_days,
  dm.base_fee
FROM public.courses c
CROSS JOIN public.delivery_modes dm
WHERE c.delivery_mode = dm.delivery_method 
  AND c.delivery_type = dm.delivery_type;

-- Remove redundant columns from courses table (keeping curriculum info)
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS massnahmenummer,
DROP COLUMN IF EXISTS number_of_days,
DROP COLUMN IF EXISTS delivery_mode,
DROP COLUMN IF EXISTS delivery_type;

-- Add triggers for updated_at columns
CREATE TRIGGER update_delivery_modes_updated_at
  BEFORE UPDATE ON public.delivery_modes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_offerings_updated_at
  BEFORE UPDATE ON public.course_offerings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_course_offerings_course_id ON public.course_offerings(course_id);
CREATE INDEX idx_course_offerings_delivery_mode_id ON public.course_offerings(delivery_mode_id);
CREATE INDEX idx_course_offerings_active ON public.course_offerings(is_active);
