
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Filter, 
  Clock, 
  MapPin, 
  DollarSign,
  Award,
  Star as StarIcon
} from 'lucide-react';

interface Filters {
  specialties: string[];
  maxPrice: number;
  minRating: number;
  availability: string[];
  location: string[];
}

interface TherapistFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

const TherapistFilters = ({ onFilterChange }: TherapistFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    specialties: [],
    maxPrice: 150,
    minRating: 4,
    availability: [],
    location: [],
  });

  // Mock data for filter options
  const specialtyOptions = ['Swedish', 'Deep Tissue', 'Sports', 'Hot Stone', 'Aromatherapy', 'Shiatsu', 'Thai', 'Reflexology'];
  const availabilityOptions = ['Weekdays', 'Weekends', 'Evenings', 'Mornings'];
  const locationOptions = ['Downtown', 'Midtown', 'Uptown', 'Suburbs'];

  const handleSpecialtyToggle = (specialty: string) => {
    setFilters(prev => {
      const specialties = prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty];
      
      return { ...prev, specialties };
    });
  };

  const handleAvailabilityToggle = (availability: string) => {
    setFilters(prev => {
      const newAvailability = prev.availability.includes(availability)
        ? prev.availability.filter(a => a !== availability)
        : [...prev.availability, availability];
      
      return { ...prev, availability: newAvailability };
    });
  };

  const handleLocationToggle = (location: string) => {
    setFilters(prev => {
      const locations = prev.location.includes(location)
        ? prev.location.filter(l => l !== location)
        : [...prev.location, location];
      
      return { ...prev, location: locations };
    });
  };

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, maxPrice: value[0] }));
  };

  const handleRatingChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, minRating: value[0] }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setFilters({
      specialties: [],
      maxPrice: 150,
      minRating: 4,
      availability: [],
      location: [],
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="mb-4 flex items-center gap-2 text-sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          フィルター
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
        
        {/* Filter tags/chips would go here */}
        <div className="flex flex-wrap gap-2">
          {filters.specialties.length > 0 && (
            <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {filters.specialties.length}種類の施術
            </div>
          )}
          {filters.maxPrice < 150 && (
            <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              最大¥{filters.maxPrice * 1000}
            </div>
          )}
          {filters.minRating > 4 && (
            <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {filters.minRating}+ ★
            </div>
          )}
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-card rounded-lg border p-4 mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Specialties Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <Award className="h-4 w-4 mr-2 text-muted-foreground" />
              施術の種類
            </h3>
            <div className="space-y-2">
              {specialtyOptions.map(specialty => (
                <div key={specialty} className="flex items-center">
                  <Switch
                    id={`specialty-${specialty}`}
                    checked={filters.specialties.includes(specialty)}
                    onCheckedChange={() => handleSpecialtyToggle(specialty)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`specialty-${specialty}`}
                    className="text-sm cursor-pointer"
                  >
                    {specialty === 'Swedish' ? 'スウェーディッシュ' : 
                     specialty === 'Deep Tissue' ? 'ディープティシュー' : 
                     specialty === 'Sports' ? 'スポーツ' : 
                     specialty === 'Hot Stone' ? 'ホットストーン' : 
                     specialty === 'Aromatherapy' ? 'アロマセラピー' : 
                     specialty === 'Shiatsu' ? '指圧' : 
                     specialty === 'Thai' ? 'タイ古式' : 
                     specialty === 'Reflexology' ? 'リフレクソロジー' : 
                     specialty}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Price Range Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              最大料金
            </h3>
            <div className="px-2">
              <Slider
                defaultValue={[filters.maxPrice]}
                max={150}
                min={50}
                step={10}
                onValueChange={handlePriceChange}
              />
              <div className="mt-2 text-sm">
                ¥{(filters.maxPrice * 1000).toLocaleString()}まで
              </div>
            </div>
          </div>
          
          {/* Minimum Rating Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <StarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              最低評価
            </h3>
            <div className="px-2">
              <Slider
                defaultValue={[filters.minRating]}
                max={5}
                min={1}
                step={0.5}
                onValueChange={handleRatingChange}
              />
              <div className="mt-2 text-sm flex items-center">
                {filters.minRating}
                <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500 ml-1" />
                以上
              </div>
            </div>
          </div>
          
          {/* Availability Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-medium mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              対応可能時間
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availabilityOptions.map(option => (
                <div key={option} className="flex items-center">
                  <Switch
                    id={`availability-${option}`}
                    checked={filters.availability.includes(option)}
                    onCheckedChange={() => handleAvailabilityToggle(option)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`availability-${option}`}
                    className="text-sm cursor-pointer"
                  >
                    {option === 'Weekdays' ? '平日' : 
                     option === 'Weekends' ? '週末' : 
                     option === 'Evenings' ? '夕方/夜' : 
                     option === 'Mornings' ? '午前中' : 
                     option}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-sm"
            >
              リセット
            </Button>
            <Button 
              size="sm"
              onClick={applyFilters}
              className="text-sm"
            >
              適用する
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistFilters;
