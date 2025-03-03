
import { Therapist } from '../utils/types';
import { Award, Clock } from 'lucide-react';

interface TherapistQualificationsProps {
  therapist: Therapist;
}

const TherapistQualifications = ({ therapist }: TherapistQualificationsProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 mt-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium flex items-center mb-3">
          <Award className="h-4 w-4 mr-2 text-muted-foreground" />
          資格
        </h3>
        <ul className="space-y-2">
          {therapist.qualifications.map((qualification, index) => (
            <li key={index} className="text-sm">
              • {qualification === "Certified Massage Therapist (CMT)" ? "認定マッサージセラピスト" :
                  qualification === "Sports Massage Certification" ? "スポーツマッサージ認定" :
                  qualification === "Bachelor's in Kinesiology" ? "運動学学士" :
                  qualification === "Licensed Massage Therapist (LMT)" ? "ライセンスマッサージセラピスト" :
                  qualification === "Aromatherapy Certification" ? "アロマセラピー認定" :
                  qualification === "Hot Stone Therapy Certification" ? "ホットストーンセラピー認定" :
                  qualification}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-medium flex items-center mb-3">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          勤務日
        </h3>
        <div className="flex flex-wrap gap-2">
          {therapist.availability.map((day, index) => (
            <span 
              key={index}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
            >
              {day === "Mon" ? "月曜日" :
               day === "Tue" ? "火曜日" :
               day === "Wed" ? "水曜日" :
               day === "Thu" ? "木曜日" :
               day === "Fri" ? "金曜日" :
               day === "Sat" ? "土曜日" :
               day === "Sun" ? "日曜日" : day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistQualifications;
