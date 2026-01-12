import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { MapPin, Truck, Package, Plane, Ship, Loader2, Plus } from "lucide-react";
import { AddLoadDialog } from "@/components/AddLoadDialog";
import { FuturisticEarthMap } from "@/components/FuturisticEarthMap";
import { VehiclesPanel } from "@/components/VehiclesPanel";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { extendedMockLoads, extendedMockVehicles } from "@/data/extendedMockData";
import type { Load, Vehicle, Match, MatchApiResponse } from "@/types/loadMatching";
import { API_BASE_URL } from "@/lib/api";

const API_ROOT = `${API_BASE_URL.replace(/\/+$/, "")}/api`;

const apiPath = (path: string) => `${API_ROOT}${path}`;

const LoadMatching = () => {
  const [loads, setLoads] = useState<Load[]>(extendedMockLoads);
  const [vehicles, setVehicles] = useState<Vehicle[]>(extendedMockVehicles);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [showAddLoad, setShowAddLoad] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Get vehicle icon
  const getVehicleIcon = (type: string) => {
    if (type === 'Plane') return <Plane className="w-4 h-4" />;
    if (type === 'Ship') return <Ship className="w-4 h-4" />;
    return <Truck className="w-4 h-4" />;
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[hsl(var(--cyan-glow))]';
    if (score >= 70) return 'text-[hsl(var(--orange-glow))]';
    return 'text-yellow-400';
  };

  // Generate all matches
  const BATCH_SIZE = 12;

  const generateMatches = async () => {
    if (!loads.length || !vehicles.length) {
      setError("Add at least one load and vehicle before generating matches.");
      return;
    }

    setMatches([]);
    setLoading(true);
    setError(null);
    setSelectedLoad(null);
    setSelectedVehicle(null);

    const batches: Load[][] = [];
    for (let i = 0; i < loads.length; i += BATCH_SIZE) {
      batches.push(loads.slice(i, i + BATCH_SIZE));
    }

    try {
      const allMatches: Match[] = [];

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
        const batch = batches[batchIndex];

        const response = await fetch(apiPath("/match"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loads: batch, trucks: vehicles }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate matches");
        }

        const data: MatchApiResponse = await response.json();
        allMatches.push(...data.matches);

        setMatches((prev) => [...prev, ...data.matches]);
      }

      setLastGenerated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || "Backend connection failed. Ensure the API service is available.");
    } finally {
      setLoading(false);
    }
  };

  // Find matches for specific load
  const findMatchesForLoad = async (load: Load) => {
    setMatches([]); // Clear old matches first
    setLoading(true);
    setError(null);
    setSelectedLoad(load);

    try {
      const response = await fetch(apiPath("/match"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loads: [load], trucks: vehicles }),
      });

      if (!response.ok) throw new Error('Failed to generate matches');

      const data: MatchApiResponse = await response.json();
      setMatches(data.matches);
      setLastGenerated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  const getNextLoadId = () => {
    const maxNum = Math.max(...loads.map(l => parseInt(l.id.substring(1)) || 0));
    return `L${maxNum + 1}`;
  };

  const handleAddLoad = (newLoad: Load) => {
    setLoads([...loads, newLoad]);
  };

  const getNextVehicleId = () => {
    const trucks = vehicles.filter(v => v.vehicleType === 'Truck');
    const planes = vehicles.filter(v => v.vehicleType === 'Plane');
    const ships = vehicles.filter(v => v.vehicleType === 'Ship');
    
    const maxT = Math.max(...trucks.map(v => parseInt(v.id.substring(1)) || 0), 0);
    const maxP = Math.max(...planes.map(v => parseInt(v.id.substring(1)) || 0), 0);
    const maxS = Math.max(...ships.map(v => parseInt(v.id.substring(1)) || 0), 0);
    
    return `T${maxT + 1}`; // Default to truck, will be updated based on selection
  };

  const handleAddVehicle = (newVehicle: Vehicle) => {
    // Update ID based on vehicle type
    const prefix = newVehicle.vehicleType === 'Plane' ? 'P' : newVehicle.vehicleType === 'Ship' ? 'S' : 'T';
    const filtered = vehicles.filter(v => v.id.startsWith(prefix));
    const maxNum = Math.max(...filtered.map(v => parseInt(v.id.substring(1)) || 0), 0);
    newVehicle.id = `${prefix}${maxNum + 1}`;
    
    setVehicles([...vehicles, newVehicle]);
  };

  // Find loads for specific vehicle (REVERSE matching)
  const findLoadsForVehicle = async (vehicle: Vehicle) => {
    setMatches([]); // Clear old matches first
    setLoading(true);
    setError(null);
    setSelectedLoad(null);
    setSelectedVehicle(vehicle);

    try {
      const response = await fetch(apiPath("/find-loads"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle, loads }),
      });

      if (!response.ok) throw new Error('Failed to find loads');

      const data: MatchApiResponse = await response.json();
      setMatches(data.matches);
      setLastGenerated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="app-shell-wide space-y-6 pb-12 pt-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="leading-tight">AI Load Matching</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] sm:text-base">
            Intelligent load-to-vehicle matching with AI scoring • {loads.length} loads • {vehicles.length} vehicles
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50">
            <div className="flex items-center justify-between">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>
        )}

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Column 1: Loads Panel */}
          <GlassCard className="space-y-4 lg:col-span-1" glow="cyan">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-white">
                <Package className="w-5 h-5 text-[hsl(var(--cyan-glow))]" />
                Available Loads ({loads.length})
              </h3>
              <button onClick={() => setShowAddLoad(true)}
                className="p-2 rounded-lg bg-[hsl(var(--cyan-glow))]/20 hover:bg-[hsl(var(--cyan-glow))]/30 border border-[hsl(var(--cyan-glow))]/50 transition" title="Add Load">
                <Plus className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 sm:max-h-[700px]">
              {loads.map((load) => (
                <div key={load.id}
                  className={`p-4 rounded-xl transition-all ${
                    selectedLoad?.id === load.id
                      ? 'bg-[hsl(var(--cyan-glow))]/20 border-2 border-[hsl(var(--cyan-glow))]'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[hsl(var(--cyan-glow))]/30'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">{load.id}</span>
                    {load.priority && load.priority !== 'Standard' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        load.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>{load.priority}</span>
                    )}
              </div>
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex items-center gap-2 text-[hsl(var(--cyan-glow))]">
                      <MapPin className="w-3 h-3" />
                      <span>{load.origin}</span>
              </div>
                    <div className="flex items-center gap-2 text-[hsl(var(--orange-glow))]">
                      <MapPin className="w-3 h-3" />
                      <span>{load.destination}</span>
              </div>
              </div>
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--text-secondary))] mb-3">
                    <span>{load.equipment}</span>
                    <span>{load.weight.toLocaleString()} lbs</span>
              </div>
                  <GlowButton variant={selectedLoad?.id === load.id ? "primary" : "outline"}
                    className="w-full text-sm py-2" onClick={() => findMatchesForLoad(load)}>
                    {selectedLoad?.id === load.id ? '✓ Viewing Matches' : '🔍 Find Best Matches'}
              </GlowButton>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Columns 2-3: Interactive Map */}
          <GlassCard className="lg:col-span-2" glow="orange">
              <div className="mb-4 flex items-center justify-between">
              <h3>Global Fleet Map</h3>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[hsl(var(--cyan-glow))]" />
                  <span className="text-[hsl(var(--text-secondary))]">Loads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[hsl(var(--orange-glow))]" />
                  <span className="text-[hsl(var(--text-secondary))]">Vehicles</span>
                </div>
              </div>
                </div>

            <div className="relative h-[260px] rounded-xl overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1a2742] to-[#0f1929] sm:h-[320px] lg:h-[500px]">
              <FuturisticEarthMap vehicles={vehicles} loads={loads} matches={matches} />
              </div>
            </GlassCard>

          {/* Column 4: Match Results */}
          <GlassCard className="space-y-4 lg:col-span-1" glow="orange">
            <div className="mb-2 flex items-center justify-between">
              <h3>AI Matches ({matches.length})</h3>
              {lastGenerated && <span className="text-xs text-[hsl(var(--text-secondary))] sm:text-sm">{lastGenerated}</span>}
                </div>

            {selectedLoad && (
              <div className="text-xs px-2 py-1 rounded bg-[hsl(var(--cyan-glow))]/20 text-[hsl(var(--cyan-glow))] inline-block mb-2">
                Load: {selectedLoad.id}
                </div>
            )}

            {selectedVehicle && (
              <div className="text-xs px-2 py-1 rounded bg-[hsl(var(--orange-glow))]/20 text-[hsl(var(--orange-glow))] inline-block mb-2">
                Vehicle: {selectedVehicle.id}
              </div>
            )}

            <GlowButton variant="primary" onClick={generateMatches} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : <>🤖 Generate All</>}
            </GlowButton>

            {(selectedLoad || selectedVehicle) && !loading && (
              <GlowButton variant="outline" onClick={() => { setSelectedLoad(null); setSelectedVehicle(null); setMatches([]); }} className="w-full text-sm">
                Clear Selection
              </GlowButton>
            )}

            {/* Match Results */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-2">
              {loading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-[hsl(var(--orange-glow))] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-white">Analyzing...</p>
                </div>
              )}

              {!loading && matches.length > 0 && matches.map((match, idx) => {
                const vehicle = vehicles.find(v => v.id === match.truckId);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[hsl(var(--orange-glow))]/30 transition">
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {vehicle && <div className="text-[hsl(var(--cyan-glow))]">{getVehicleIcon(vehicle.vehicleType)}</div>}
                        <div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-[hsl(var(--cyan-glow))] font-bold">{match.loadId}</span>
                      <span className="text-[hsl(var(--text-secondary))]">→</span>
                            <span className="text-[hsl(var(--orange-glow))] font-bold">{match.truckId}</span>
                    </div>
                          {vehicle && (
                            <div className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{vehicle.location.split(',')[0]}</div>
                          )}
                    </div>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(match.matchScore)}`}>{match.matchScore.toFixed(1)}%</div>
                    </div>
                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{match.reason}</p>
                  </div>
                );
              })}

              {!loading && matches.length === 0 && !selectedLoad && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🤖</div>
                  <h4 className="text-white font-bold mb-1">Ready to Match</h4>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">Click button above or find matches on a load</p>
                </div>
              )}

              {!loading && matches.length === 0 && selectedLoad && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">❌</div>
                  <h4 className="text-white font-bold mb-1">No Available Matches</h4>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">No suitable vehicles found for this load</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-2">Try adjusting load parameters or adding more vehicles</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Vehicles Panel (Below) */}
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <VehiclesPanel vehicles={vehicles} onFindLoads={findLoadsForVehicle} />
          </div>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="w-full rounded-xl border border-[hsl(var(--orange-glow))]/50 bg-[hsl(var(--orange-glow))]/20 px-6 py-3 text-sm font-semibold text-[hsl(var(--orange-glow))] transition-all shadow-[0_0_20px_rgba(255,122,0,0.2)] hover:bg-[hsl(var(--orange-glow))]/30 hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] sm:text-base lg:w-auto"
            title="Add Vehicle"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 text-[hsl(var(--orange-glow))]" />
              <span>Add Vehicle</span>
            </div>
          </button>
        </div>
      </div>

      {/* Add Load Dialog */}
      <AddLoadDialog open={showAddLoad} onOpenChange={setShowAddLoad} onAdd={handleAddLoad} nextId={getNextLoadId()} />
      
      {/* Add Vehicle Dialog */}
      <AddVehicleDialog open={showAddVehicle} onOpenChange={setShowAddVehicle} onAdd={handleAddVehicle} nextId={getNextVehicleId()} />
    </div>
  );
};

export default LoadMatching;
