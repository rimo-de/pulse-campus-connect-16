
-- First, let's check and update the RLS policies for the roles table
-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;

-- Create more permissive policies for roles table
-- Allow authenticated users to read roles
CREATE POLICY "Allow authenticated users to read roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert roles (for admin functions)
CREATE POLICY "Allow authenticated users to create roles"
  ON public.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update roles
CREATE POLICY "Allow authenticated users to update roles"
  ON public.roles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete roles
CREATE POLICY "Allow authenticated users to delete roles"
  ON public.roles
  FOR DELETE
  TO authenticated
  USING (true);

-- Also update the app_users table policies to be more permissive for admin operations
DROP POLICY IF EXISTS "Admin can manage all users" ON public.app_users;

CREATE POLICY "Allow authenticated users to manage app_users"
  ON public.app_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure we have the default roles (this will not create duplicates due to the unique constraint)
INSERT INTO public.roles (role_name, description) VALUES
  ('admin', 'Full access to admin portal with all permissions'),
  ('student', 'Access to student-specific views and functions'),
  ('trainer', 'Access to trainer-specific views and functions')
ON CONFLICT (role_name) DO NOTHING;

-- Create a default admin user for admin@digital4pulse.edu if it doesn't exist
DO $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM public.roles WHERE role_name = 'admin';
  
  -- Insert the admin user if it doesn't exist
  INSERT INTO public.app_users (email, name, role_id, password_hash, status)
  VALUES (
    'admin@digital4pulse.edu',
    'Sarah Johnson',
    admin_role_id,
    encode(sha256('password123'::bytea), 'base64'), -- Simple hash for demo
    'active'
  )
  ON CONFLICT (email) DO NOTHING;
END $$;
