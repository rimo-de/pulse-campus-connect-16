
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import type { CourseFormData, DeliveryMode, CourseOfferingFormData } from '@/types/course';

interface CourseOfferingsFieldsProps {
  formData: CourseFormData;
  deliveryModes: DeliveryMode[];
  onFieldChange: (field: keyof CourseFormData, value: any) => void;
}

const CourseOfferingsFields = ({ formData, deliveryModes, onFieldChange }: CourseOfferingsFieldsProps) => {
  console.log('CourseOfferingsFields rendered with deliveryModes:', deliveryModes);
  
  const addOffering = () => {
    const newOffering: CourseOfferingFormData = {
      delivery_mode_id: '',
      massnahmenummer: '',
      duration_days: 30,
      unit_fee: 0,
      fee: 0,
      is_active: true,
    };
    onFieldChange('offerings', [...formData.offerings, newOffering]);
  };

  const removeOffering = (index: number) => {
    const updatedOfferings = formData.offerings.filter((_, i) => i !== index);
    onFieldChange('offerings', updatedOfferings);
  };

  const updateOffering = (index: number, field: keyof CourseOfferingFormData, value: any) => {
    const updatedOfferings = formData.offerings.map((offering, i) => {
      if (i === index) {
        const updatedOffering = { ...offering, [field]: value };
        
        // Auto-calculate course fee when duration_days or unit_fee changes
        if (field === 'duration_days' || field === 'unit_fee') {
          const units = field === 'duration_days' ? value * 8 : offering.duration_days * 8;
          const unitFee = field === 'unit_fee' ? value : offering.unit_fee;
          updatedOffering.fee = units * unitFee;
        }
        
        return updatedOffering;
      }
      return offering;
    });
    onFieldChange('offerings', updatedOfferings);
  };

  const handleDeliveryModeChange = (index: number, deliveryModeId: string) => {
    console.log('Delivery mode selected:', deliveryModeId);
    
    // Find the selected delivery mode
    const selectedMode = deliveryModes.find(m => m.id === deliveryModeId);
    
    if (selectedMode) {
      console.log('Auto-filling with mode defaults:', selectedMode);
      
      // Calculate unit fee from delivery mode
      const unitFee = selectedMode.default_units > 0 ? selectedMode.base_fee / selectedMode.default_units : 0;
      const calculatedFee = selectedMode.default_duration_days * 8 * unitFee;
      
      // Update all fields at once to prevent state conflicts
      const updatedOfferings = formData.offerings.map((offering, i) => 
        i === index ? {
          ...offering,
          delivery_mode_id: deliveryModeId,
          duration_days: selectedMode.default_duration_days,
          unit_fee: unitFee,
          fee: calculatedFee,
        } : offering
      );
      
      onFieldChange('offerings', updatedOfferings);
    } else {
      // Just update the delivery mode if no matching mode found
      updateOffering(index, 'delivery_mode_id', deliveryModeId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Course Offerings</CardTitle>
          <Button type="button" onClick={addOffering} size="sm" className="edu-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Offering
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.offerings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No offerings added yet. Click "Add Offering" to create delivery options for this course.
          </p>
        ) : (
          formData.offerings.map((offering, index) => {
            const selectedMode = deliveryModes.find(mode => mode.id === offering.delivery_mode_id);
            const calculatedUnits = offering.duration_days * 8;

            return (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOffering(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Delivery Mode *</Label>
                      <Select
                        value={offering.delivery_mode_id}
                        onValueChange={(value) => handleDeliveryModeChange(index, value)}
                      >
                        <SelectTrigger className="w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                          <SelectValue placeholder="Select delivery mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
                          {deliveryModes.length === 0 ? (
                            <div className="p-3 text-gray-500 text-sm">Loading delivery modes...</div>
                          ) : (
                            deliveryModes.map((mode) => (
                              <SelectItem 
                                key={mode.id} 
                                value={mode.id}
                                className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-3 py-2"
                              >
                                {mode.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {!offering.delivery_mode_id && (
                        <p className="text-red-500 text-xs">Delivery mode is required</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Maßnahmenummer</Label>
                      <Input
                        value={offering.massnahmenummer}
                        onChange={(e) => updateOffering(index, 'massnahmenummer', e.target.value)}
                        placeholder="Enter Maßnahmenummer"
                        className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (Days) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={offering.duration_days}
                        onChange={(e) => updateOffering(index, 'duration_days', parseInt(e.target.value) || 0)}
                        required
                        className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      {(!offering.duration_days || offering.duration_days <= 0) && (
                        <p className="text-red-500 text-xs">Duration must be greater than 0</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Units (Read Only)</Label>
                      <Input
                        value={calculatedUnits}
                        readOnly
                        className="bg-gray-50 border border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Fee (€) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={offering.unit_fee}
                        onChange={(e) => updateOffering(index, 'unit_fee', parseFloat(e.target.value) || 0)}
                        className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      {(typeof offering.unit_fee !== 'number' || offering.unit_fee <= 0) && (
                        <p className="text-red-500 text-xs">Unit fee must be greater than 0</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Course Fee (€) - Calculated</Label>
                      <Input
                        value={offering.fee.toFixed(2)}
                        readOnly
                        className="bg-gray-50 border border-gray-300"
                      />
                      <p className="text-xs text-gray-500">
                        Calculated as: {calculatedUnits} units × €{offering.unit_fee} = €{offering.fee.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <Switch
                        checked={offering.is_active}
                        onCheckedChange={(checked) => updateOffering(index, 'is_active', checked)}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>

                  {selectedMode && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <strong>{selectedMode.name}</strong>
                        <br />
                        <span className="text-blue-600">
                          {selectedMode.delivery_method} • {selectedMode.delivery_type}
                        </span>
                        <br />
                        <span className="text-blue-600">
                          Default: {selectedMode.default_duration_days} days • €{selectedMode.base_fee} total
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default CourseOfferingsFields;
