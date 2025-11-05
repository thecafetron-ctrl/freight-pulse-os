import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Load, EquipmentType } from "@/types/loadMatching";

interface AddLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (load: Load) => void;
  nextId: string;
}

export function AddLoadDialog({ open, onOpenChange, onAdd, nextId }: AddLoadDialogProps) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    equipment: 'Dry Van' as EquipmentType,
    weight: '',
    pickupDate: '',
    priority: 'Standard' as 'Standard' | 'Express' | 'Urgent',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLoad: Load = {
      id: nextId,
      origin: formData.origin,
      destination: formData.destination,
      equipment: formData.equipment,
      weight: parseInt(formData.weight),
      pickupDate: formData.pickupDate,
      priority: formData.priority,
    };

    onAdd(newLoad);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      origin: '',
      destination: '',
      equipment: 'Dry Van',
      weight: '',
      pickupDate: '',
      priority: 'Standard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(var(--navy-panel))] border-[hsl(var(--orange-glow))]/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Add New Load</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Origin *</Label>
              <Input
                required
                placeholder="e.g., Dallas, TX"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Destination *</Label>
              <Input
                required
                placeholder="e.g., Atlanta, GA"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Equipment *</Label>
              <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value as EquipmentType })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dry Van">Dry Van</SelectItem>
                  <SelectItem value="Reefer">Reefer</SelectItem>
                  <SelectItem value="Flatbed">Flatbed</SelectItem>
                  <SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Bulk">Bulk</SelectItem>
                  <SelectItem value="Palletized">Palletized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Weight (lbs) *</Label>
              <Input
                type="number"
                required
                placeholder="e.g., 42000"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Pickup Date *</Label>
              <Input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            
            <div>
              <Label className="text-[hsl(var(--text-secondary))]">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Express">Express</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <GlowButton type="submit" variant="primary" className="flex-1">
              Add Load
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

