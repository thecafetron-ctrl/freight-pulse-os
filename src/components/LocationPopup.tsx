import { X, Truck, Plane, Ship, Package } from 'lucide-react';
import type { Vehicle, Load } from '@/types/loadMatching';

interface LocationPopupProps {
  vehicles: Vehicle[];
  loads: Load[];
  position: { x: number; y: number };
  onClose: () => void;
}

export function LocationPopup({ vehicles, loads, position, onClose }: LocationPopupProps) {
  const getVehicleIcon = (type: string) => {
    if (type === 'Plane') return <Plane className="w-3 h-3" />;
    if (type === 'Ship') return <Ship className="w-3 h-3" />;
    return <Truck className="w-3 h-3" />;
  };

  const locationName = vehicles[0]?.location || loads[0]?.origin || 'Location';
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const safeLeft = Math.min(Math.max(position.x, 140), viewportWidth - 140);
  const safeTop = Math.min(Math.max(position.y, 160), viewportHeight - 120);

  return (
    <div
      className="absolute bg-[hsl(var(--navy-panel))]/95 backdrop-blur-md border border-[hsl(var(--orange-glow))]/50 rounded-xl p-4 shadow-2xl z-50 min-w-[280px] max-w-[320px]"
      style={{
        left: `${safeLeft}px`,
        top: `${safeTop}px`,
        transform: 'translate(-50%, -110%)',
        boxShadow: '0 0 40px rgba(255, 122, 0, 0.3), 0 0 80px rgba(0, 230, 255, 0.2)',
        pointerEvents: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <h4 className="text-white font-bold text-sm">{locationName.split(',')[0]}</h4>
        <button onClick={onClose} className="text-[hsl(var(--text-secondary))] hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Vehicles */}
      {vehicles.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-[hsl(var(--orange-glow))]" />
            <span className="text-xs text-[hsl(var(--text-secondary))]">Vehicles ({vehicles.length})</span>
          </div>
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
            {vehicles.map(v => (
              <div key={v.id} className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10">
                <div className="text-[hsl(var(--orange-glow))]">{getVehicleIcon(v.vehicleType)}</div>
                <div className="flex-1">
                  <div className="text-white text-xs font-semibold">{v.id}</div>
                  <div className="text-[hsl(var(--text-secondary))] text-xs">{v.equipment}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loads */}
      {loads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
            <span className="text-xs text-[hsl(var(--text-secondary))]">Loads ({loads.length})</span>
          </div>
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
            {loads.map(l => (
              <div key={l.id} className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10">
                <Package className="w-3 h-3 text-[hsl(var(--cyan-glow))]" />
                <div className="flex-1">
                  <div className="text-white text-xs font-semibold">{l.id}</div>
                  <div className="text-[hsl(var(--text-secondary))] text-xs">{l.destination}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

