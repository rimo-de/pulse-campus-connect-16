
-- Create assets table for managing downloadable resources
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_assets table to associate assets with courses
CREATE TABLE public.course_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, asset_id)
);

-- Add triggers for updated_at
CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_assets_updated_at
    BEFORE UPDATE ON public.course_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_assets_category ON public.assets(category);
CREATE INDEX idx_assets_is_active ON public.assets(is_active);
CREATE INDEX idx_course_assets_course_id ON public.course_assets(course_id);
CREATE INDEX idx_course_assets_asset_id ON public.course_assets(asset_id);

-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the course-assets bucket
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public uploads to course-assets bucket'
    ) THEN
        CREATE POLICY "Allow public uploads to course-assets bucket" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'course-assets');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public access to course-assets bucket'
    ) THEN
        CREATE POLICY "Allow public access to course-assets bucket" ON storage.objects
        FOR SELECT USING (bucket_id = 'course-assets');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public updates to course-assets bucket'
    ) THEN
        CREATE POLICY "Allow public updates to course-assets bucket" ON storage.objects
        FOR UPDATE USING (bucket_id = 'course-assets');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public deletes from course-assets bucket'
    ) THEN
        CREATE POLICY "Allow public deletes from course-assets bucket" ON storage.objects
        FOR DELETE USING (bucket_id = 'course-assets');
    END IF;
END $$;
