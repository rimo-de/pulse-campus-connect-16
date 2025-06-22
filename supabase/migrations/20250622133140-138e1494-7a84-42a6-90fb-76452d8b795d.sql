
-- Create storage policies for the trainer-files bucket (if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public uploads to trainer-files bucket'
    ) THEN
        CREATE POLICY "Allow public uploads to trainer-files bucket" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'trainer-files');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public access to trainer-files bucket'
    ) THEN
        CREATE POLICY "Allow public access to trainer-files bucket" ON storage.objects
        FOR SELECT USING (bucket_id = 'trainer-files');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public updates to trainer-files bucket'
    ) THEN
        CREATE POLICY "Allow public updates to trainer-files bucket" ON storage.objects
        FOR UPDATE USING (bucket_id = 'trainer-files');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public deletes from trainer-files bucket'
    ) THEN
        CREATE POLICY "Allow public deletes from trainer-files bucket" ON storage.objects
        FOR DELETE USING (bucket_id = 'trainer-files');
    END IF;
END $$;

-- Fix the trainer_documents table file_type constraint
ALTER TABLE trainer_documents DROP CONSTRAINT IF EXISTS trainer_documents_file_type_check;
ALTER TABLE trainer_documents ADD CONSTRAINT trainer_documents_file_type_check 
CHECK (file_type IN ('profile', 'certificate'));

-- Add foreign key constraints if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'trainer_skills_trainer_id_fkey'
    ) THEN
        ALTER TABLE trainer_skills ADD CONSTRAINT trainer_skills_trainer_id_fkey 
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'trainer_documents_trainer_id_fkey'
    ) THEN
        ALTER TABLE trainer_documents ADD CONSTRAINT trainer_documents_trainer_id_fkey 
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE;
    END IF;
END $$;
