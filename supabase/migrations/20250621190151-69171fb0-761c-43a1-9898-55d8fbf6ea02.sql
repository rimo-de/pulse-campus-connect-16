
-- Add unit_fee column to course_offerings table
ALTER TABLE course_offerings 
ADD COLUMN unit_fee NUMERIC(10,2) DEFAULT 0.00;

-- Update existing records to have a default unit_fee based on current fee and units
UPDATE course_offerings 
SET unit_fee = CASE 
  WHEN units > 0 THEN fee / units 
  ELSE 0 
END;
