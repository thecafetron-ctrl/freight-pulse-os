import { useState } from 'react';
import { Truck, Plane, Ship, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Input } from './ui/input';
import type { Vehicle } from '@/types/loadMatching';

interface VehiclesPanelProps {
  vehicles: Vehicle[];
  onFindLoads?: (vehicle: Vehicle) => void;
}

export function VehiclesPanel({ vehicles, onFindLoads }: VehiclesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Truck' | 'Plane' | 'Ship'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const getVehicleIcon = (type: string) => {
    if (type === 'Plane') return <Plane className="w-4 h-4" />;
    if (type === 'Ship') return <Ship className="w-4 h-4" />;
    return <Truck className="w-4 h-4" />;
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesType = filter === 'All' || v.vehicleType === filter;
    const matchesSearch = !searchQuery || v.location.toLowerCase().includes(searchQuery.toLowerCase()) || v.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <GlassCard glow="cyan" className="space-y-4">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-transparent bg-white/5 px-4 py-3 text-left transition hover:border-white/10"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="text-base font-semibold text-white sm:text-lg">
          Available Vehicles ({vehicles.length})
        </span>
        <span className="rounded-lg bg-white/5 p-2 text-[hsl(var(--cyan-glow))]">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Truck', 'Plane', 'Ship'] as const).map(type => (
              <button key={type} onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  filter === type
                    ? 'bg-[hsl(var(--cyan-glow))]/20 border border-[hsl(var(--cyan-glow))] text-[hsl(var(--cyan-glow))]'
                    : 'bg-white/5 border border-white/10 text-[hsl(var(--text-secondary))] hover:bg-white/10'
                }`}>
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-secondary))]" />
            <Input placeholder="Search by location or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-4 lg:pr-2">
            {filteredVehicles.map(vehicle => (
              <div key={vehicle.id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[hsl(var(--orange-glow))]/30 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-sm">{vehicle.id}</span>
                  <div className="text-[hsl(var(--orange-glow))]">
                    {getVehicleIcon(vehicle.vehicleType)}
                  </div>
                </div>
                <div className="text-xs text-[hsl(var(--text-secondary))] mb-1">{vehicle.location}</div>
                <div className="text-xs text-white/70 mb-1">{vehicle.equipment}</div>
                {vehicle.capacity && (
                  <div className="text-xs text-[hsl(var(--text-secondary))] mb-2">{vehicle.capacity.toLocaleString()} lbs</div>
                )}
                {onFindLoads && (
                  <button
                    onClick={() => onFindLoads(vehicle)}
                    className="w-full rounded-lg border border-[hsl(var(--orange-glow))]/30 bg-[hsl(var(--orange-glow))]/10 px-3 py-2 text-xs font-semibold text-[hsl(var(--orange-glow))] transition hover:bg-[hsl(var(--orange-glow))]/20 hover:text-white"
                  >
                    🔍 Find Loads
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-[hsl(var(--text-secondary))] text-center">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        </div>
      )}
    </GlassCard>
  );
}

