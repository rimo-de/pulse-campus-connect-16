
import React from 'react';
import { Info } from 'lucide-react';
import { format } from 'date-fns';
import type { DateCalculationResult } from '@/types/course';

interface DateCalculationDisplayProps {
  dateCalculation: DateCalculationResult | null;
  isCalculating: boolean;
}

const DateCalculationDisplay = ({ dateCalculation, isCalculating }: DateCalculationDisplayProps) => {
  if (!dateCalculation) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center space-x-2">
        <Info className="w-4 h-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">Schedule Calculation</h4>
      </div>
      <div className="text-sm text-blue-800 space-y-1">
        <div><strong>End Date:</strong> {format(dateCalculation.end_date, 'PPP')}</div>
        <div><strong>Working Days:</strong> {dateCalculation.working_days}</div>
        <div><strong>Total Calendar Days:</strong> {dateCalculation.total_calendar_days}</div>
        {dateCalculation.weekends_skipped > 0 && (
          <div><strong>Weekends Skipped:</strong> {dateCalculation.weekends_skipped}</div>
        )}
        {dateCalculation.holidays_skipped.length > 0 && (
          <div>
            <strong>Holidays Skipped:</strong> {dateCalculation.holidays_skipped.length}
            <div className="ml-4 text-xs">
              {dateCalculation.holidays_skipped.map(holiday => (
                <div key={holiday.date}>{holiday.name} ({format(new Date(holiday.date), 'dd MMM')})</div>
              ))}
            </div>
          </div>
        )}
      </div>
      {isCalculating && (
        <div className="text-sm text-blue-600">Calculating with German holidays...</div>
      )}
    </div>
  );
};

export default DateCalculationDisplay;
