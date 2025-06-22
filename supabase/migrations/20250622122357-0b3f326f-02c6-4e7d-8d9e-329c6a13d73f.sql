
-- Create trainer_skills table for multiple expertise areas per trainer
CREATE TABLE public.trainer_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, skill)
);

-- Add trigger for updated_at
CREATE TRIGGER update_trainer_skills_updated_at
    BEFORE UPDATE ON public.trainer_skills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trainer_documents table for certificates and files
CREATE TABLE public.trainer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'docx')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_trainer_documents_updated_at
    BEFORE UPDATE ON public.trainer_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add profile_image_url column to trainers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainers' AND column_name = 'profile_image_url') THEN
        ALTER TABLE public.trainers ADD COLUMN profile_image_url TEXT;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX idx_trainer_skills_trainer_id ON public.trainer_skills(trainer_id);
CREATE INDEX idx_trainer_documents_trainer_id ON public.trainer_documents(trainer_id);
