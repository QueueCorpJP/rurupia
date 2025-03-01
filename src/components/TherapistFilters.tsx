
import { useState } from 'react';
import { Search, Filter, X, Check } from 'lucide-react';

interface TherapistFiltersProps {
  onFilterChange: (filters: {
    search: string;
    specialties: string[];
    minPrice: number | null;
    maxPrice: number | null;
    minRating: number | null;
  }) => void;
}

const specialtiesList = [
  "Swedish", "Deep Tissue", "Sports", "Hot Stone", 
  "Aromatherapy", "Shiatsu", "Thai Massage", "Reflexology",
  "Myofascial Release", "Trigger Point", "Medical Massage",
  "Cupping", "Acupressure", "Craniosacral", "Lymphatic Drainage", "Prenatal"
];

const TherapistFilters = ({ onFilterChange }: TherapistFiltersProps) => {
  const [search, setSearch] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    updateFilters(e.target.value, selectedSpecialties, minPrice, maxPrice, minRating);
  };

  const toggleSpecialty = (specialty: string) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    
    setSelectedSpecialties(updated);
    updateFilters(search, updated, minPrice, maxPrice, minRating);
  };

  const handleMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setMinPrice(value);
    updateFilters(search, selectedSpecialties, value, maxPrice, minRating);
  };

  const handleMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setMaxPrice(value);
    updateFilters(search, selectedSpecialties, minPrice, value, minRating);
  };

  const handleRating = (rating: number) => {
    const value = minRating === rating ? null : rating;
    setMinRating(value);
    updateFilters(search, selectedSpecialties, minPrice, maxPrice, value);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSpecialties([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinRating(null);
    updateFilters('', [], null, null, null);
  };

  const updateFilters = (
    search: string,
    specialties: string[],
    minPrice: number | null,
    maxPrice: number | null,
    minRating: number | null
  ) => {
    onFilterChange({
      search,
      specialties,
      minPrice,
      maxPrice,
      minRating
    });
  };

  return (
    <div className="sticky top-20 z-40 w-full space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Search by name, specialty, or location..."
          value={search}
          onChange={handleSearch}
        />
        {search && (
          <button 
            onClick={() => {
              setSearch('');
              updateFilters('', selectedSpecialties, minPrice, maxPrice, minRating);
            }}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-4 w-4" />
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </button>
        
        {(selectedSpecialties.length > 0 || minPrice !== null || maxPrice !== null || minRating !== null) && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all filters
          </button>
        )}
      </div>

      {isFilterOpen && (
        <div className="animate-fade-in rounded-lg border bg-card p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {specialtiesList.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => toggleSpecialty(specialty)}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      selectedSpecialties.includes(specialty)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {selectedSpecialties.includes(specialty) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Price Range (per hour)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ''}
                  onChange={handleMinPrice}
                  className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ''}
                  onChange={handleMaxPrice}
                  className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Minimum Rating</h3>
              <div className="flex gap-2">
                {[4, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      minRating === rating
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Star className={`mr-1 h-3 w-3 ${minRating === rating ? "" : "text-amber-500"}`} fill={minRating === rating ? "currentColor" : "#f59e0b"} />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistFilters;
