
-- Check if roles exist and insert them if they don't
INSERT INTO public.roles (role_name, description) 
VALUES 
  ('admin', 'Full access to admin portal with all permissions'),
  ('student', 'Access to student-specific views and functions'),
  ('trainer', 'Access to trainer-specific views and functions')
ON CONFLICT (role_name) DO NOTHING;
