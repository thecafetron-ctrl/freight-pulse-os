import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle, EquipmentType, VehicleType } from "@/types/loadMatching";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (vehicle: Vehicle) => void;
  nextId: string;
}

export function AddVehicleDialog({ open, onOpenChange, onAdd, nextId }: AddVehicleDialogProps) {
  const [formData, setFormData] = useState({
    location: '',
    equipment: 'Dry Van' as EquipmentType,
    availableDate: '',
    vehicleType: 'Truck' as VehicleType,
    capacity: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVehicle: Vehicle = {
      id: nextId,
      location: formData.location,
      equipment: formData.equipment,
      availableDate: formData.availableDate,
      vehicleType: formData.vehicleType,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    };

    onAdd(newVehicle);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      location: '',
      equipment: 'Dry Van',
      availableDate: '',
      vehicleType: 'Truck',
      capacity: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(var(--navy-panel))] border-[hsl(var(--orange-glow))]/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Add New Vehicle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-[hsl(var(--text-secondary))]">Vehicle Type *</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {(['Truck', 'Plane', 'Ship'] as VehicleType[]).map(type => (
                <button key={type} type="button"
                  onClick={() => setFormData({ ...formData, vehicleType: type })}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition ${
                    formData.vehicleType === type
                      ? 'border-[hsl(var(--orange-glow))] bg-[hsl(var(--orange-glow))]/20 text-[hsl(var(--orange-glow))]'
                      : 'border-white/10 hover:border-[hsl(var(--orange-glow))]/50 text-[hsl(var(--text-secondary))]'
                  }`}>
                  {type === 'Truck' ? '🚛' : type === 'Plane' ? '✈️' : '🚢'} {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[hsl(var(--text-secondary))]">Location *</Label>
            <Input required placeholder="e.g., Dallas, TX or Dubai, UAE"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Equipment *</Label>
              <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value as EquipmentType })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.vehicleType === 'Truck' && (
                    <>
                      <SelectItem value="Dry Van">Dry Van</SelectItem>
                      <SelectItem value="Reefer">Reefer</SelectItem>
                      <SelectItem value="Flatbed">Flatbed</SelectItem>
                      <SelectItem value="Tanker">Tanker</SelectItem>
                    </>
                  )}
                  {formData.vehicleType === 'Plane' && (
                    <>
                      <SelectItem value="Palletized">Palletized</SelectItem>
                      <SelectItem value="Container">Container</SelectItem>
                    </>
                  )}
                  {formData.vehicleType === 'Ship' && (
                    <>
                      <SelectItem value="Container">Container</SelectItem>
                      <SelectItem value="Bulk">Bulk</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Capacity (lbs)</Label>
              <Input type="number" placeholder="e.g., 45000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>
          </div>

          <div>
            <Label className="text-[hsl(var(--text-secondary))]">Available Date *</Label>
            <Input type="date" required
              value={formData.availableDate}
              onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <GlowButton type="submit" variant="primary" className="flex-1">
              Add Vehicle
            </GlowButton>
            <GlowButton type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </GlowButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

