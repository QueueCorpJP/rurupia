import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface TherapistFiltersProps {
  onFilterChange: (filters: any) => void;
}

const TherapistFilters = ({ onFilterChange }: TherapistFiltersProps) => {
  const [location, setLocation] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [rating, setRating] = useState(0);
  const [availability, setAvailability] = useState<string[]>([]);

  const locations = ["東京", "大阪", "名古屋", "福岡", "京都"];
  const specialties = [
    "マッサージ",
    "鍼灸",
    "整体",
    "リフレクソロジー",
    "アロマセラピー",
    "カイロプラクティック",
  ];
  const availabilityOptions = ["平日", "週末", "夜間"];

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const handleSpecialtyClick = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(
        selectedSpecialties.filter((s) => s !== specialty)
      );
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };

  const handleAvailabilityChange = (value: string) => {
    if (availability.includes(value)) {
      setAvailability(availability.filter((a) => a !== value));
    } else {
      setAvailability([...availability, value]);
    }
  };

  const handleReset = () => {
    setLocation("");
    setSelectedSpecialties([]);
    setPriceRange([0, 20000]);
    setRating(0);
    setAvailability([]);
  };

  useEffect(() => {
    onFilterChange({
      location,
      specialties: selectedSpecialties,
      priceRange,
      rating,
      availability,
    });
  }, [location, selectedSpecialties, priceRange, rating, availability]);

  return (
    <div className="bg-card rounded-lg shadow-sm border mb-4 p-3">
      <h3 className="font-medium text-base mb-3">フィルター</h3>

      <div className="space-y-3">
        {/* Location filter */}
        <div>
          <Label htmlFor="location" className="text-sm mb-1 block">場所</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {locations.map((loc) => (
              <Badge
                key={loc}
                variant={location === loc ? "default" : "outline"}
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => setLocation(location === loc ? "" : loc)}
              >
                {loc}
              </Badge>
            ))}
          </div>
        </div>

        {/* Specialties filter */}
        <div>
          <Label className="text-sm mb-1 block">専門分野</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant={
                  selectedSpecialties.includes(specialty)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleSpecialtyClick(specialty)}
              >
                {specialty}
              </Badge>
            ))}
          </div>
          {selectedSpecialties.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 mt-1"
              onClick={() => setSelectedSpecialties([])}
            >
              クリア
            </Button>
          )}
        </div>

        {/* Price range filter */}
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-sm">価格帯</Label>
            <span className="text-xs text-muted-foreground">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </span>
          </div>
          <Slider
            defaultValue={priceRange}
            max={50000}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="my-3"
          />
        </div>

        {/* Rating filter */}
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-sm">評価</Label>
            <span className="text-xs text-muted-foreground">
              {rating}/5 以上
            </span>
          </div>
          <Slider
            defaultValue={[rating]}
            max={5}
            step={0.5}
            value={[rating]}
            onValueChange={(value) => setRating(value[0])}
            className="my-3"
          />
        </div>

        {/* Availability filter */}
        <div>
          <Label className="text-sm mb-1 block">利用可能時間</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {availabilityOptions.map((option) => (
              <Badge
                key={option}
                variant={
                  availability.includes(option) ? "default" : "outline"
                }
                className="cursor-pointer py-0.5 px-2 text-xs"
                onClick={() => handleAvailabilityChange(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-2 border-t border-border">
          <Button size="sm" variant="secondary" onClick={handleReset} className="h-8">
            リセット
          </Button>
          <Button size="sm" className="ml-auto h-8">
            適用
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TherapistFilters;
