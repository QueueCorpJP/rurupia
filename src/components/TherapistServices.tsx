import { Therapist, Service } from '../utils/types';

interface TherapistServicesProps {
  therapist: Therapist;
}

const TherapistServices = ({ therapist }: TherapistServicesProps) => {
  // Translate services to Japanese
  const japaneseServices = therapist.services.map(service => ({
    ...service,
    name: service.name === "Swedish Massage" ? "スウェーディッシュマッサージ" :
          service.name === "Deep Tissue Massage" ? "ディープティシューマッサージ" :
          service.name === "Sports Massage" ? "スポーツマッサージ" :
          service.name === "Hot Stone Massage" ? "ホットストーンマッサージ" :
          service.name === "Aromatherapy Massage" ? "アロマセラピーマッサージ" :
          service.name,
    description: "リラックス効果の高い優しいタッチで全身の疲れを癒します。"
  }));

  return (
    <div className="mt-6">
      <h2 className="font-semibold text-lg mb-3">施術メニュー</h2>
      <div className="space-y-3">
        {japaneseServices.map((service) => (
          <div key={service.id} className="border rounded-lg p-4">
            <div className="flex justify-between">
              <h4 className="font-medium">{service.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {service.duration}分
                </span>
                <span className="font-medium">
                  {(service.price * 150).toLocaleString()}円
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistServices;
