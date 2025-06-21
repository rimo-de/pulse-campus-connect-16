
import type { Holiday, DateCalculationResult } from '@/types/course';

export const holidayService = {
  // Cache for holidays to avoid repeated API calls
  holidayCache: new Map<string, Holiday[]>(),

  async getGermanHolidays(year: number): Promise<Holiday[]> {
    const cacheKey = `germany-${year}`;
    
    if (this.holidayCache.has(cacheKey)) {
      return this.holidayCache.get(cacheKey)!;
    }

    try {
      // Using timeanddate.com API alternative - we'll use a free holiday API
      // Note: In production, you might want to use a paid service for more reliability
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/DE`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }

      const data = await response.json();
      const holidays: Holiday[] = data.map((holiday: any) => ({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type || 'public'
      }));

      this.holidayCache.set(cacheKey, holidays);
      return holidays;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      // Return empty array if API fails - the system will still work without holidays
      return [];
    }
  },

  async calculateEndDate(startDate: Date, workingDays: number): Promise<DateCalculationResult> {
    const startYear = startDate.getFullYear();
    const endYear = startYear + 1; // Get holidays for current and next year to be safe
    
    const currentYearHolidays = await this.getGermanHolidays(startYear);
    const nextYearHolidays = startYear !== endYear ? await this.getGermanHolidays(endYear) : [];
    const allHolidays = [...currentYearHolidays, ...nextYearHolidays];
    
    // Create a set of holiday dates for quick lookup
    const holidayDates = new Set(allHolidays.map(h => h.date));
    
    let currentDate = new Date(startDate);
    let workingDaysAdded = 0;
    let weekendsSkipped = 0;
    const holidaysSkipped: Holiday[] = [];
    
    // Don't count the start date itself
    currentDate.setDate(currentDate.getDate() + 1);
    
    while (workingDaysAdded < workingDays) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if it's a weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendsSkipped++;
      }
      // Check if it's a holiday
      else if (holidayDates.has(dateString)) {
        const holiday = allHolidays.find(h => h.date === dateString);
        if (holiday) {
          holidaysSkipped.push(holiday);
        }
      }
      // It's a working day
      else {
        workingDaysAdded++;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Subtract one day because we've gone one day too far
    currentDate.setDate(currentDate.getDate() - 1);
    
    const totalCalendarDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      end_date: currentDate,
      total_calendar_days: totalCalendarDays,
      working_days: workingDays,
      holidays_skipped: holidaysSkipped,
      weekends_skipped
    };
  },

  isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  },

  async isHoliday(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const holidays = await this.getGermanHolidays(year);
    const dateString = date.toISOString().split('T')[0];
    return holidays.some(h => h.date === dateString);
  }
};
