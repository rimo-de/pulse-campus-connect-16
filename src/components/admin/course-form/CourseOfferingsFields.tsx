
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
  const addOffering = () => {
    const newOffering: CourseOfferingFormData = {
      delivery_mode_id: '',
      massnahmenummer: '',
      duration_days: 30,
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
    const updatedOfferings = formData.offerings.map((offering, i) => 
      i === index ? { ...offering, [field]: value } : offering
    );
    onFieldChange('offerings', updatedOfferings);
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Delivery Mode</Label>
                      <Select
                        value={offering.delivery_mode_id}
                        onValueChange={(value) => {
                          updateOffering(index, 'delivery_mode_id', value);
                          // Auto-fill defaults when delivery mode is selected
                          const mode = deliveryModes.find(m => m.id === value);
                          if (mode) {
                            updateOffering(index, 'duration_days', mode.default_duration_days);
                            updateOffering(index, 'fee', mode.base_fee);
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select delivery mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryModes.map((mode) => (
                            <SelectItem key={mode.id} value={mode.id}>
                              {mode.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Maßnahmenummer</Label>
                      <Input
                        value={offering.massnahmenummer}
                        onChange={(e) => updateOffering(index, 'massnahmenummer', e.target.value)}
                        className="mt-1"
                        placeholder="Enter Maßnahmenummer"
                      />
                    </div>

                    <div>
                      <Label>Duration (Days)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={offering.duration_days}
                        onChange={(e) => updateOffering(index, 'duration_days', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Units (Read Only)</Label>
                      <Input
                        value={calculatedUnits}
                        readOnly
                        className="mt-1 bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label>Fee (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={offering.fee}
                        onChange={(e) => updateOffering(index, 'fee', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
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
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      <strong>{selectedMode.name}</strong> - {selectedMode.delivery_method}, {selectedMode.delivery_type}
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
