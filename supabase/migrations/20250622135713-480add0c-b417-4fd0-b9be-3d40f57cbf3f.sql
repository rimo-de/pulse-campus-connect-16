
-- Create physical_assets table for tracking rental equipment
CREATE TABLE public.physical_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  assigned_to_id UUID,
  assigned_to_type TEXT CHECK (assigned_to_type IN ('student', 'employee')),
  order_number TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'ready_to_return', 'rental_in_progress', 'maintenance', 'lost')),
  price_per_month DECIMAL(10,2),
  rental_start_date DATE,
  rental_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_assignments table for tracking assignment history
CREATE TABLE public.asset_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.physical_assets(id) ON DELETE CASCADE,
  assigned_to_id UUID NOT NULL,
  assigned_to_type TEXT NOT NULL CHECK (assigned_to_type IN ('student', 'employee')),
  assigned_by TEXT,
  assignment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  return_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add triggers for updated_at
CREATE TRIGGER update_physical_assets_updated_at
    BEFORE UPDATE ON public.physical_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_assignments_updated_at
    BEFORE UPDATE ON public.asset_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_physical_assets_status ON public.physical_assets(status);
CREATE INDEX idx_physical_assets_assigned_to ON public.physical_assets(assigned_to_id, assigned_to_type);
CREATE INDEX idx_physical_assets_serial ON public.physical_assets(serial_number);
CREATE INDEX idx_asset_assignments_asset_id ON public.asset_assignments(asset_id);
CREATE INDEX idx_asset_assignments_assigned_to ON public.asset_assignments(assigned_to_id, assigned_to_type);
