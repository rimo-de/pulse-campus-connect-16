
-- Create trainers table
CREATE TABLE public.trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  mobile_number TEXT,
  email TEXT NOT NULL UNIQUE,
  expertise_area UUID REFERENCES public.courses(id),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('Junior', 'Mid-Level', 'Senior', 'Expert')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trainer_files table
CREATE TABLE public.trainer_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('Profile', 'Photo', 'Certificate')),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger to update updated_at column for trainers
CREATE TRIGGER update_trainers_updated_at
  BEFORE UPDATE ON public.trainers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at column for trainer_files
CREATE TRIGGER update_trainer_files_updated_at
  BEFORE UPDATE ON public.trainer_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for trainer files
INSERT INTO storage.buckets (id, name, public)
VALUES ('trainer-files', 'trainer-files', true);

-- Create storage policy for trainer files
CREATE POLICY "Allow public access to trainer files"
ON storage.objects FOR ALL
USING (bucket_id = 'trainer-files');
