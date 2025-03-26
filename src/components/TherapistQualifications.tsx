import { Therapist } from '../utils/types';
import { Award, Clock } from 'lucide-react';

interface TherapistQualificationsProps {
  therapist: Therapist;
}

const TherapistQualifications = ({ therapist }: TherapistQualificationsProps) => {
  // Format working hours from Supabase data
  const formatWorkingHours = (workingHours: any): string => {
    if (!workingHours) return '-';
    
    // Handle if working hours is an object with start and end properties
    if (typeof workingHours === 'object') {
      const start = workingHours.start || '';
      const end = workingHours.end || '';
      
      if (start && end) {
        return `${start} - ${end}`;
      }
    }
    
    // Fallback: return the stringified value or a default
    return workingHours.toString() || '-';
  };

  // Convert English day name to Japanese
  const getDayInJapanese = (day: string): string => {
    const dayMap: Record<string, string> = {
      'monday': '月曜日',
      'tuesday': '火曜日',
      'wednesday': '水曜日',
      'thursday': '木曜日',
      'friday': '金曜日',
      'saturday': '土曜日',
      'sunday': '日曜日',
      'Monday': '月曜日',
      'Tuesday': '火曜日',
      'Wednesday': '水曜日',
      'Thursday': '木曜日',
      'Friday': '金曜日',
      'Saturday': '土曜日',
      'Sunday': '日曜日',
      'mon': '月曜日',
      'tue': '火曜日',
      'wed': '水曜日',
      'thu': '木曜日',
      'fri': '金曜日',
      'sat': '土曜日',
      'sun': '日曜日',
      'Mon': '月曜日',
      'Tue': '火曜日',
      'Wed': '水曜日',
      'Thu': '木曜日',
      'Fri': '金曜日',
      'Sat': '土曜日',
      'Sun': '日曜日',
    };
    
    return dayMap[day] || day; // Return the Japanese day or the original if not found
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 mt-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium flex items-center mb-3">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          営業時間
        </h3>
        <div className="text-sm">
          {formatWorkingHours(therapist.workingHours)}
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-medium flex items-center mb-3">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          営業日
        </h3>
        <div className="flex flex-wrap gap-2">
          {therapist.workingDays && therapist.workingDays.length > 0 ? (
            therapist.workingDays.map((day, index) => (
              <span 
                key={index}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
              >
                {getDayInJapanese(day)}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistQualifications;
