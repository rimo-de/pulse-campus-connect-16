
-- Add schedule_id to asset_assignments table to track bootcamp assignments
ALTER TABLE public.asset_assignments 
ADD COLUMN schedule_id UUID REFERENCES public.course_schedules(id);

-- Add new status options to physical_assets
ALTER TABLE public.physical_assets 
DROP CONSTRAINT IF EXISTS physical_assets_status_check;

ALTER TABLE public.physical_assets 
ADD CONSTRAINT physical_assets_status_check 
CHECK (status IN ('available', 'ready_to_return', 'rental_in_progress', 'maintenance', 'lost', 'returned'));

-- Add index for schedule_id in asset_assignments
CREATE INDEX idx_asset_assignments_schedule_id ON public.asset_assignments(schedule_id);

-- Update physical_assets to add ready_to_assign status
ALTER TABLE public.physical_assets 
DROP CONSTRAINT physical_assets_status_check;

ALTER TABLE public.physical_assets 
ADD CONSTRAINT physical_assets_status_check 
CHECK (status IN ('available', 'ready_to_assign', 'rental_in_progress', 'maintenance', 'lost', 'returned'));
