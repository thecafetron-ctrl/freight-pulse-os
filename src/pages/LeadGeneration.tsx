import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Factory,
  Inbox,
  Loader2,
  MapPin,
  Navigation2,
  Package,
  ScrollText,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Domain Types ──────────────────────────────────────────────────────────────
type FreightType = "Reefer" | "Dry Van" | "Flatbed" | "LTL" | "Drayage" | "Intermodal" | "Hazmat";
type ShipmentCadence =
  | "Daily Contract"
  | "Weekly Contract"
  | "Seasonal Surge"
  | "Project-Based"
  | "Spot + Contract Blend";
type ContractPreference = "Dedicated" | "Guaranteed Contract" | "Flexible Spot" | "Mini-Bid";
type CompanySize = "Emerging (0-50M)" | "Mid-Market (50-250M)" | "Enterprise (250M+)";
type Industry =
  | "Food & Beverage"
  | "CPG / Retail"
  | "Industrial Manufacturing"
  | "Automotive"
  | "Chemicals"
  | "Pharma / MedTech";

type DriverType = "Fleet" | "Owner-Operator" | "Mixed Network";

interface ShipperProfile {
  freightTypes: FreightType[];
  targetLanes: string[];
  targetRegions: string[];
  shipmentCadence: ShipmentCadence;
  contractPreference: ContractPreference;
  companySize: CompanySize;
  industries: Industry[];
}

interface ShipperLead {
  id: string;
  company: string;
  industry: Industry;
  commodityFocus: string;
  location: string;
  contactRole: string;
  companySize: CompanySize;
  primaryFreight: FreightType[];
  shipmentCadence: ShipmentCadence;
  contractMix: ContractPreference;
  lanes: string[];
}

interface CarrierProfile {
  equipmentTypes: FreightType[];
  preferredLanes: string[];
  baseRegions: string[];
  driverType: DriverType;
  notes: string;
}

interface CarrierLead {
  id: string;
  carrierName: string;
  contactName: string;
  equipment: FreightType[];
  baseRegion: string;
  preferredLanes: string[];
  driverModel: DriverType;
  capacityNotes: string;
}

interface LeadScore {
  score: number;
  label: "Hot" | "Warm" | "Cold";
  rationale: string;
}

interface EnrichedShipperLead extends ShipperLead {
  score: LeadScore;
}

interface EnrichedCarrierLead extends CarrierLead {
  score: LeadScore;
}

// ── Static Options & Mock Data ───────────────────────────────────────────────
const FREIGHT_OPTIONS: FreightType[] = ["Reefer", "Dry Van", "Flatbed", "LTL", "Drayage", "Intermodal", "Hazmat"];
const REGION_OPTIONS = [
  "Midwest",
  "Southeast",
  "Southwest",
  "Northeast",
  "West Coast",
  "Rocky Mountains",
  "Cross-Border (US ↔ CA)",
  "Cross-Border (US ↔ MX)",
];
const INDUSTRY_OPTIONS: Industry[] = [
  "Food & Beverage",
  "CPG / Retail",
  "Industrial Manufacturing",
  "Automotive",
  "Chemicals",
  "Pharma / MedTech",
];
const SHIPMENT_OPTIONS: ShipmentCadence[] = [
  "Daily Contract",
  "Weekly Contract",
  "Seasonal Surge",
  "Project-Based",
  "Spot + Contract Blend",
];
const CONTRACT_OPTIONS: ContractPreference[] = ["Dedicated", "Guaranteed Contract", "Flexible Spot", "Mini-Bid"];
const COMPANY_OPTIONS: CompanySize[] = ["Emerging (0-50M)", "Mid-Market (50-250M)", "Enterprise (250M+)"];
const DRIVER_OPTIONS: DriverType[] = ["Fleet", "Owner-Operator", "Mixed Network"];

const SHIPPER_LEADS: ShipperLead[] = [
  {
    id: "shipper-01",
    company: "Harvest Grove Foods",
    industry: "Food & Beverage",
    commodityFocus: "Chilled produce and protein",
    location: "Fresno, CA",
    contactRole: "Director of Logistics",
    companySize: "Enterprise (250M+)",
    primaryFreight: ["Reefer"],
    shipmentCadence: "Daily Contract",
    contractMix: "Guaranteed Contract",
    lanes: ["CA → TX", "CA → GA", "CA → IL"],
  },
  {
    id: "shipper-02",
    company: "MetroBuild Components",
    industry: "Industrial Manufacturing",
    commodityFocus: "Structural steel kits and crated machinery",
    location: "Tulsa, OK",
    contactRole: "Procurement Lead",
    companySize: "Mid-Market (50-250M)",
    primaryFreight: ["Flatbed", "Dry Van"],
    shipmentCadence: "Weekly Contract",
    contractMix: "Dedicated",
    lanes: ["OK → TX", "OK → CO", "OK → MO"],
  },
  {
    id: "shipper-03",
    company: "BlueCurrent Electronics",
    industry: "CPG / Retail",
    commodityFocus: "Consumer electronics replenishment",
    location: "Columbus, OH",
    contactRole: "Transportation Manager",
    companySize: "Enterprise (250M+)",
    primaryFreight: ["Dry Van", "Intermodal"],
    shipmentCadence: "Spot + Contract Blend",
    contractMix: "Mini-Bid",
    lanes: ["OH → FL", "OH → NJ", "OH → TX"],
  },
  {
    id: "shipper-04",
    company: "SierraChem Specialty",
    industry: "Chemicals",
    commodityFocus: "Packaged hazmat and totes",
    location: "Baton Rouge, LA",
    contactRole: "Logistics Manager",
    companySize: "Mid-Market (50-250M)",
    primaryFreight: ["Hazmat", "Dry Van"],
    shipmentCadence: "Project-Based",
    contractMix: "Flexible Spot",
    lanes: ["LA → GA", "LA → NC", "LA → TN"],
  },
  {
    id: "shipper-05",
    company: "EverFresh Meal Solutions",
    industry: "Food & Beverage",
    commodityFocus: "Ready-to-eat packaged meals",
    location: "Allentown, PA",
    contactRole: "VP of Supply Chain",
    companySize: "Emerging (0-50M)",
    primaryFreight: ["Reefer", "LTL"],
    shipmentCadence: "Seasonal Surge",
    contractMix: "Flexible Spot",
    lanes: ["PA → NY", "PA → MA", "PA → VA"],
  },
  {
    id: "shipper-06",
    company: "DriveLine Auto Systems",
    industry: "Automotive",
    commodityFocus: "Tier-1 drivetrain assemblies",
    location: "Detroit, MI",
    contactRole: "Sr. Logistics Strategist",
    companySize: "Enterprise (250M+)",
    primaryFreight: ["Dry Van", "Intermodal"],
    shipmentCadence: "Daily Contract",
    contractMix: "Dedicated",
    lanes: ["MI → TN", "MI → AL", "MI → TX"],
  },
];

const CARRIER_LEADS: CarrierLead[] = [
  {
    id: "carrier-01",
    carrierName: "NorthRiver Transport",
    contactName: "Kelly Ramirez",
    equipment: ["Reefer"],
    baseRegion: "Chicago, IL",
    preferredLanes: ["IL ↔ TX", "WI ↔ GA"],
    driverModel: "Mixed Network",
    capacityNotes: "3 company reefers + vetted owner-operator bench ready for produce surge.",
  },
  {
    id: "carrier-02",
    carrierName: "Summit Flatbed Group",
    contactName: "Victor Lee",
    equipment: ["Flatbed", "Dry Van"],
    baseRegion: "Dallas, TX",
    preferredLanes: ["TX ↔ OK", "TX ↔ CO"],
    driverModel: "Fleet",
    capacityNotes: "6 step-decks with coil racks, 4 dry vans finishing contracts mid-month.",
  },
  {
    id: "carrier-03",
    carrierName: "Atlantic Lanes Express",
    contactName: "Alicia Grant",
    equipment: ["Dry Van", "LTL"],
    baseRegion: "Newark, NJ",
    preferredLanes: ["NJ ↔ PA", "NJ ↔ VA"],
    driverModel: "Owner-Operator",
    capacityNotes: "Network of 12 vetted O/Os with TSA clearance for high-value retail freight.",
  },
  {
    id: "carrier-04",
    carrierName: "Redwood Hazmat Logistics",
    contactName: "Marcus Bell",
    equipment: ["Hazmat", "Dry Van"],
    baseRegion: "Houston, TX",
    preferredLanes: ["TX ↔ LA", "TX ↔ AL"],
    driverModel: "Fleet",
    capacityNotes: "HAZMAT-certified drivers, 8 tractors with retractable containment ready to roll.",
  },
  {
    id: "carrier-05",
    carrierName: "Cascade Coast Intermodal",
    contactName: "Nora Patel",
    equipment: ["Intermodal", "Dry Van"],
    baseRegion: "Seattle, WA",
    preferredLanes: ["WA ↔ CA", "WA ↔ BC"],
    driverModel: "Mixed Network",
    capacityNotes: "Priority lift slots at BNSF and dray partners for near-port loads.",
  },
];

// ── Helper Logic ─────────────────────────────────────────────────────────────
const defaultShipperProfile: ShipperProfile = {
  freightTypes: ["Reefer", "Dry Van"],
  targetLanes: ["CA → TX", "CA → GA"],
  targetRegions: ["West Coast", "Southeast"],
  shipmentCadence: "Daily Contract",
  contractPreference: "Guaranteed Contract",
  companySize: "Enterprise (250M+)",
  industries: ["Food & Beverage", "CPG / Retail"],
};

const defaultCarrierProfile: CarrierProfile = {
  equipmentTypes: ["Reefer", "Dry Van"],
  preferredLanes: ["IL ↔ TX", "WI ↔ GA"],
  baseRegions: ["Midwest", "Southeast"],
  driverType: "Mixed Network",
  notes: "Prioritizing asset-backed fleets with owner-operator benches for Q4 surge.",
};

const evaluateShipperLead = (lead: ShipperLead, profile: ShipperProfile): LeadScore => {
  let score = 0;
  const matchedFreight = lead.primaryFreight.filter((type) => profile.freightTypes.includes(type));
  const lanesMatched = lead.lanes.filter((lane) =>
    profile.targetLanes.some((target) => lane.toLowerCase().includes(target.toLowerCase().trim())),
  );
  const industryMatch = profile.industries.includes(lead.industry);
  const regionMatch = profile.targetRegions.some((region) =>
    lead.location.toLowerCase().includes(region.split(" ")[0].toLowerCase()),
  );
  const cadenceMatch = lead.shipmentCadence === profile.shipmentCadence;
  const contractMatch = lead.contractMix === profile.contractPreference;
  const sizeMatch = lead.companySize === profile.companySize;

  score += matchedFreight.length * 18;
  score += lanesMatched.length * 15;
  if (industryMatch) score += 18;
  if (regionMatch) score += 10;
  if (cadenceMatch) score += 12;
  if (contractMatch) score += 10;
  if (sizeMatch) score += 8;

  const label = score >= 70 ? "Hot" : score >= 45 ? "Warm" : "Cold";
  const reasons: string[] = [];
  if (matchedFreight.length) reasons.push(`Aligned equipment: ${matchedFreight.join(", ")}`);
  if (lanesMatched.length) reasons.push(`Priority lanes matched (${lanesMatched.join(", ")})`);
  if (cadenceMatch) reasons.push(`${lead.shipmentCadence.toLowerCase()} cadence fit`);
  if (contractMatch) reasons.push(`${lead.contractMix.toLowerCase()} contract appetite`);
  if (industryMatch) reasons.push(`${lead.industry} vertical in ICP`);
  if (!reasons.length) reasons.push("Limited overlap with stated ICP attributes");

  return { score: Math.min(100, score), label, rationale: reasons.join(" • ") };
};

const evaluateCarrierLead = (lead: CarrierLead, profile: CarrierProfile): LeadScore => {
  let score = 0;
  const equipmentMatch = lead.equipment.filter((eq) => profile.equipmentTypes.includes(eq));
  const laneMatch = lead.preferredLanes.filter((lane) =>
    profile.preferredLanes.some((target) => lane.toLowerCase().includes(target.toLowerCase().trim())),
  );
  const regionMatch = profile.baseRegions.some((region) =>
    lead.baseRegion.toLowerCase().includes(region.split(" ")[0].toLowerCase()),
  );
  const driverMatch = lead.driverModel === profile.driverType;

  score += equipmentMatch.length * 20;
  score += laneMatch.length * 18;
  if (regionMatch) score += 12;
  if (driverMatch) score += 10;
  if (lead.capacityNotes.toLowerCase().includes("available")) score += 8;

  const label = score >= 70 ? "Hot" : score >= 45 ? "Warm" : "Cold";
  const reasons: string[] = [];
  if (equipmentMatch.length) reasons.push(`Equipment ready: ${equipmentMatch.join(", ")}`);
  if (laneMatch.length) reasons.push(`Running declared corridors (${laneMatch.join(", ")})`);
  if (driverMatch) reasons.push(`Driver model matches (${lead.driverModel})`);
  if (!reasons.length) reasons.push("Limited overlap with recruiting criteria");

  return { score: Math.min(100, score), label, rationale: reasons.join(" • ") };
};

const summarizeShipperProfile = (profile: ShipperProfile): string[] => [
  profile.freightTypes.length
    ? `Focusing on ${profile.freightTypes.join(", ")} freight that struggles to stay covered.`
    : "Freight type not declared — AI will infer from industry and cadence.",
  profile.targetLanes.length
    ? `Priority corridors: ${profile.targetLanes.join(", ")}.`
    : "Add lanes so Structure AI can anchor search to your core network.",
  profile.industries.length
    ? `Verticals: ${profile.industries.join(", ")} within ${profile.companySize.toLowerCase()} buying cycles.`
    : `Company size: ${profile.companySize}. Add industries to sharpen targeting.`,
  `Contract appetite skewed toward ${profile.contractPreference.toLowerCase()} with ${profile.shipmentCadence.toLowerCase()} shipments.`,
  profile.targetRegions.length
    ? `Regional bias: ${profile.targetRegions.join(", ")}.`
    : "No region filter applied — national search prioritised.",
];

const summarizeCarrierProfile = (profile: CarrierProfile): string[] => [
  profile.equipmentTypes.length
    ? `Recruiting capacity for ${profile.equipmentTypes.join(", ")}.`
    : "Specify equipment types to filter carrier bench.",
  profile.preferredLanes.length
    ? `Lane targets: ${profile.preferredLanes.join(", ")}.`
    : "Add lane preferences to guide recruiting intelligence.",
  profile.baseRegions.length
    ? `Preferred carrier bases: ${profile.baseRegions.join(", ")}.`
    : "No base regions selected — AI will surface national carriers first.",
  `Driver strategy: ${profile.driverType}.`,
  profile.notes || "Add recruiting notes to inform AI outreach tone and expectations.",
];

const buildShipperOutreach = (lead: EnrichedShipperLead, profile: ShipperProfile): string => {
  const lane =
    lead.lanes.find((l) =>
      profile.targetLanes.some((target) => l.toLowerCase().includes(target.toLowerCase().trim())),
    ) ?? lead.lanes[0];
  const equipment = lead.primaryFreight.find((eq) => profile.freightTypes.includes(eq)) ?? lead.primaryFreight[0];

  return [
    `Hi ${lead.contactRole.split(" ")[0]},`,
    "",
    `Structure AI is tracking ${lead.company}'s ${lead.industry.toLowerCase()} freight program and sees recurring ${equipment.toLowerCase()} demand from ${lane}.`,
    `We help ${profile.companySize.toLowerCase()} shippers benchmark providers in real time so ${lead.contractMix.toLowerCase()} awards hit SLA without firefighting.`,
    `Within 24 hours we can surface vetted carriers already running these corridors, including rate guidance and dwell benchmarks tuned for ${lead.shipmentCadence.toLowerCase()} cadence.`,
    "Would you be open to a quick walk-through next week?",
    "",
    "— Structure Revenue Team",
  ].join("\n");
};

const buildCarrierOutreach = (lead: EnrichedCarrierLead, profile: CarrierProfile): string => {
  const lane =
    lead.preferredLanes.find((l) =>
      profile.preferredLanes.some((target) => l.toLowerCase().includes(target.toLowerCase().trim())),
    ) ?? lead.preferredLanes[0];
  const equipment = lead.equipment.find((eq) => profile.equipmentTypes.includes(eq)) ?? lead.equipment[0];

  return [
    `Hi ${lead.contactName},`,
    "",
    `We are expanding Structure's ${equipment.toLowerCase()} network for shippers moving freight along ${lane}.`,
    `Our platform pushes pre-vetted loads to partners that match your ${lead.driverModel.toLowerCase()} model and ${lead.capacityNotes.toLowerCase()}.`,
    "You keep control of pricing; we automate onboarding, paperwork, and settle within 48 hours.",
    "Can we share the volume and margin profile your fleet would see this quarter?",
    "",
    "— Structure Capacity Partnerships",
  ].join("\n");
};

// ── Component ────────────────────────────────────────────────────────────────
const LeadGeneration = () => {
  const [activeTab, setActiveTab] = useState<"shippers" | "vehicles">("shippers");

  const [shipperForm, setShipperForm] = useState<ShipperProfile>(defaultShipperProfile);
  const [shipperProfile, setShipperProfile] = useState<ShipperProfile>(defaultShipperProfile);
  const [shipperRefreshing, setShipperRefreshing] = useState(false);
  const [shipperRefreshedAt, setShipperRefreshedAt] = useState<string | null>(null);
  const [selectedShipper, setSelectedShipper] = useState<EnrichedShipperLead | null>(null);
  const [shipperOutreach, setShipperOutreach] = useState<string | null>(null);

  const [carrierForm, setCarrierForm] = useState<CarrierProfile>(defaultCarrierProfile);
  const [carrierProfile, setCarrierProfile] = useState<CarrierProfile>(defaultCarrierProfile);
  const [carrierRefreshing, setCarrierRefreshing] = useState(false);
  const [carrierRefreshedAt, setCarrierRefreshedAt] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<EnrichedCarrierLead | null>(null);
  const [carrierOutreach, setCarrierOutreach] = useState<string | null>(null);

  const shipperLeads = useMemo<EnrichedShipperLead[]>(
    () =>
      SHIPPER_LEADS.map((lead) => ({
        ...lead,
        score: evaluateShipperLead(lead, shipperProfile),
      })).sort((a, b) => b.score.score - a.score.score),
    [shipperProfile],
  );

  const carrierLeads = useMemo<EnrichedCarrierLead[]>(
    () =>
      CARRIER_LEADS.map((lead) => ({
        ...lead,
        score: evaluateCarrierLead(lead, carrierProfile),
      })).sort((a, b) => b.score.score - a.score.score),
    [carrierProfile],
  );

  const shipperSummary = useMemo(() => summarizeShipperProfile(shipperProfile), [shipperProfile]);
  const carrierSummary = useMemo(() => summarizeCarrierProfile(carrierProfile), [carrierProfile]);

  const toggleValue = <T,>(value: T, list: T[], setter: (values: T[]) => void) => {
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    setter(next);
  };

  const handleLaneInput = (value: string, setter: (lanes: string[]) => void) => {
    const parsed = value
      .split(",")
      .map((lane) => lane.trim())
      .filter(Boolean);
    setter(parsed);
  };

  const applyShipperProfile = () => {
    setShipperRefreshing(true);
    setTimeout(() => {
      setShipperProfile(shipperForm);
      setShipperRefreshedAt(new Date().toLocaleTimeString());
      setShipperRefreshing(false);
    }, 450);
  };

  const applyCarrierProfile = () => {
    setCarrierRefreshing(true);
    setTimeout(() => {
      setCarrierProfile(carrierForm);
      setCarrierRefreshedAt(new Date().toLocaleTimeString());
      setCarrierRefreshing(false);
    }, 450);
  };

  const openShipperOutreach = (lead: EnrichedShipperLead) => {
    setSelectedShipper(lead);
    setShipperOutreach(buildShipperOutreach(lead, shipperProfile));
  };

  const openCarrierOutreach = (lead: EnrichedCarrierLead) => {
    setSelectedCarrier(lead);
    setCarrierOutreach(buildCarrierOutreach(lead, carrierProfile));
  };

  return (
    <div className="min-h-screen">
      <div className="app-shell-wide space-y-6 pb-12 pt-6 sm:space-y-8">
        <div className="rounded-xl border border-[hsl(var(--cyan-glow))]/40 bg-[hsl(var(--cyan-glow))]/10 px-4 py-3 text-xs text-[hsl(var(--text-secondary))] sm:text-sm">
          Demo data shown. Real deployments use your operational and public freight data to surface live shipper opportunities.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-white/70 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--orange-glow))]" />
              Structure AI Revenue Engine
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">AI Lead Generation Suite</h1>
            <p className="max-w-3xl text-sm text-[hsl(var(--text-secondary))] sm:text-base">
              Find high-fit shippers ready for coverage and recruit capacity partners to execute. One platform, tuned to
              the realities of logistics sales and operations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {shipperRefreshedAt && (
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[hsl(var(--text-secondary))] sm:text-sm">
                <Activity className="h-3.5 w-3.5 text-[hsl(var(--cyan-glow))]" />
                <span>Shipper profile {shipperRefreshedAt}</span>
              </div>
            )}
            {carrierRefreshedAt && (
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[hsl(var(--text-secondary))] sm:text-sm">
                <Activity className="h-3.5 w-3.5 text-[hsl(var(--orange-glow))]" />
                <span>Vehicle profile {carrierRefreshedAt}</span>
              </div>
            )}
          </div>
        </div>

        <GlassCard glow="cyan" className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "shippers" | "vehicles")}>
            <TabsList className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-1 text-white/70">
              <TabsTrigger
                value="shippers"
                className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm transition data-[state=active]:bg-[hsl(var(--orange-glow))]/15 data-[state=active]:text-white data-[state=active]:shadow-[0_0_18px_rgba(255,122,0,0.35)]"
              >
                <Factory className="h-4 w-4" />
                Find Shippers
              </TabsTrigger>
              <TabsTrigger
                value="vehicles"
                className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm transition data-[state=active]:bg-[hsl(var(--cyan-glow))]/15 data-[state=active]:text-white data-[state=active]:shadow-[0_0_18px_rgba(34,211,238,0.35)]"
              >
                <Truck className="h-4 w-4" />
                Recruit Vehicles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shippers" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <GlassCard glow="cyan" className="space-y-4 xl:col-span-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[hsl(var(--cyan-glow))]" />
                    <h2 className="text-lg font-semibold text-white">Ideal Shipper Profile</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Freight / Equipment</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {FREIGHT_OPTIONS.map((option) => (
                          <label
                            key={`shipper-freight-${option}`}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                              shipperForm.freightTypes.includes(option)
                                ? "border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/15 text-white"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--cyan-glow))]/30 hover:text-white"
                            }`}
                          >
                            <Checkbox
                              checked={shipperForm.freightTypes.includes(option)}
                              onCheckedChange={() =>
                                toggleValue(option, shipperForm.freightTypes, (values) =>
                                  setShipperForm((prev) => ({ ...prev, freightTypes: values })),
                                )
                              }
                              className="border-white/30 text-[hsl(var(--cyan-glow))]"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Target Regions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {REGION_OPTIONS.map((region) => (
                          <label
                            key={`shipper-region-${region}`}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                              shipperForm.targetRegions.includes(region)
                                ? "border-[hsl(var(--orange-glow))] bg-[hsl(var(--orange-glow))]/15 text-white"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--orange-glow))]/30 hover:text-white"
                            }`}
                          >
                            <Checkbox
                              checked={shipperForm.targetRegions.includes(region)}
                              onCheckedChange={() =>
                                toggleValue(region, shipperForm.targetRegions, (values) =>
                                  setShipperForm((prev) => ({ ...prev, targetRegions: values })),
                                )
                              }
                              className="border-white/30 text-[hsl(var(--orange-glow))]"
                            />
                            {region}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Shipment Cadence</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {SHIPMENT_OPTIONS.map((cadence) => (
                          <button
                            key={`shipper-cadence-${cadence}`}
                            type="button"
                            onClick={() => setShipperForm((prev) => ({ ...prev, shipmentCadence: cadence }))}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                              shipperForm.shipmentCadence === cadence
                                ? "border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/15 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--cyan-glow))]/30 hover:text-white"
                            }`}
                          >
                            {cadence}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Contract Preference</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {CONTRACT_OPTIONS.map((option) => (
                          <button
                            key={`shipper-contract-${option}`}
                            type="button"
                            onClick={() => setShipperForm((prev) => ({ ...prev, contractPreference: option }))}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                              shipperForm.contractPreference === option
                                ? "border-[hsl(var(--orange-glow))] bg-[hsl(var(--orange-glow))]/15 text-white shadow-[0_0_15px_rgba(255,122,0,0.25)]"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--orange-glow))]/30 hover:text-white"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Company Size</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {COMPANY_OPTIONS.map((size) => (
                          <button
                            key={`shipper-size-${size}`}
                            type="button"
                            onClick={() => setShipperForm((prev) => ({ ...prev, companySize: size }))}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                              shipperForm.companySize === size
                                ? "border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/15 text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--cyan-glow))]/30 hover:text-white"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Industry Focus</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {INDUSTRY_OPTIONS.map((industry) => (
                          <label
                            key={`shipper-industry-${industry}`}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                              shipperForm.industries.includes(industry)
                                ? "border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/15 text-white"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--cyan-glow))]/30 hover:text-white"
                            }`}
                          >
                            <Checkbox
                              checked={shipperForm.industries.includes(industry)}
                              onCheckedChange={() =>
                                toggleValue(industry, shipperForm.industries, (values) =>
                                  setShipperForm((prev) => ({ ...prev, industries: values })),
                                )
                              }
                              className="border-white/30 text-[hsl(var(--cyan-glow))]"
                            />
                            {industry}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--text-secondary))]">Target Lanes / Corridors</Label>
                    <Textarea
                      value={shipperForm.targetLanes.join(", ")}
                      onChange={(event) => handleLaneInput(event.target.value, (lanes) =>
                        setShipperForm((prev) => ({ ...prev, targetLanes: lanes })),
                      )}
                      placeholder="CA → TX, CA → GA, IL → FL"
                      className="min-h-[90px] border-white/10 bg-white/5 text-sm text-white placeholder:text-[hsl(var(--text-secondary))]"
                    />
                    <p className="text-[10px] uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                      Separate lanes with commas — the AI uses them to anchor match scoring and outreach hooks.
                    </p>
                  </div>

                  <GlowButton className="w-full sm:w-auto" onClick={applyShipperProfile} disabled={shipperRefreshing}>
                    {shipperRefreshing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Calibrating Shipper ICP
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Apply Profile
                      </span>
                    )}
                  </GlowButton>
                </GlassCard>

                <GlassCard glow="orange" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-5 w-5 text-[hsl(var(--orange-glow))]" />
                    <h3 className="text-lg font-semibold text-white">Ideal Shipper Blueprint</h3>
                  </div>
                  <div className="space-y-3 text-sm text-white/85">
                    {shipperSummary.map((line, index) => (
                      <div key={`shipper-summary-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-[hsl(var(--text-secondary))]">
                    <strong className="font-semibold text-white">Integration ready:</strong> swap{" "}
                    <code className="rounded bg-black/30 px-1 py-0.5 text-[10px] text-[hsl(var(--cyan-glow))]">
                      SHIPPER_LEADS
                    </code>{" "}
                    for Apollo, Clay, HubSpot, or load-board connectors to hydrate with live opportunities.
                  </div>
                </GlassCard>
              </div>

              <GlassCard glow="orange" className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI-Shaped Shipper Pipeline</h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">
                      Accounts scored on freight fit, lanes, cadence, and industry — ready for immediate outreach.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-[hsl(var(--orange-glow))]/40 bg-[hsl(var(--orange-glow))]/15 px-3 py-1 text-[hsl(var(--orange-glow))]">
                      {shipperLeads.filter((lead) => lead.score.label === "Hot").length} Hot
                    </span>
                    <span className="rounded-full border border-[hsl(var(--cyan-glow))]/40 bg-[hsl(var(--cyan-glow))]/15 px-3 py-1 text-[hsl(var(--cyan-glow))]">
                      {shipperLeads.filter((lead) => lead.score.label === "Warm").length} Warm
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                      {shipperLeads.filter((lead) => lead.score.label === "Cold").length} Cold
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {shipperLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[hsl(var(--orange-glow))]/40 hover:bg-white/10"
                    >
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                        <div className="lg:col-span-1 space-y-1">
                          <p className="text-sm font-semibold text-white">{lead.company}</p>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">{lead.companySize}</p>
                        </div>
                        <div className="lg:col-span-1 space-y-1 text-xs text-white/85">
                          <p className="font-medium text-white">{lead.industry}</p>
                          <p className="text-[hsl(var(--text-secondary))]">{lead.commodityFocus}</p>
                        </div>
                        <div className="lg:col-span-1 space-y-1 text-xs text-[hsl(var(--text-secondary))]">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[hsl(var(--cyan-glow))]" />
                            {lead.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-[hsl(var(--cyan-glow))]" />
                            {lead.contactRole}
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-2 text-xs text-white/80">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                              Shipment Type & Frequency
                            </p>
                            <p className="mt-1 text-sm text-white">
                              {lead.primaryFreight.join(", ")} • {lead.shipmentCadence}
                            </p>
                            <p className="text-[hsl(var(--text-secondary))]">Prefers {lead.contractMix.toLowerCase()}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {lead.lanes.map((lane) => (
                              <span
                                key={`${lead.id}-${lane}`}
                                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wide text-white/70"
                              >
                                {lane}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="lg:col-span-1 flex flex-col justify-between gap-3">
                          <div
                            className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold ${
                              lead.score.label === "Hot"
                                ? "border-[hsl(var(--orange-glow))]/60 bg-[hsl(var(--orange-glow))]/18 text-[hsl(var(--orange-glow))]"
                                : lead.score.label === "Warm"
                                  ? "border-[hsl(var(--cyan-glow))]/50 bg-[hsl(var(--cyan-glow))]/18 text-[hsl(var(--cyan-glow))]"
                                  : "border-white/10 bg-white/5 text-white/70"
                            }`}
                          >
                            {lead.score.label} • {lead.score.score}%
                          </div>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">{lead.score.rationale}</p>
                          <GlowButton variant="outline" onClick={() => openShipperOutreach(lead)}>
                            Generate Outreach
                          </GlowButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="vehicles" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <GlassCard glow="cyan" className="space-y-4 xl:col-span-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[hsl(var(--cyan-glow))]" />
                    <h2 className="text-lg font-semibold text-white">Capacity Recruiting Profile</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Equipment Needed</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {FREIGHT_OPTIONS.map((option) => (
                          <label
                            key={`carrier-eq-${option}`}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                              carrierForm.equipmentTypes.includes(option)
                                ? "border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/15 text-white"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--cyan-glow))]/30 hover:text-white"
                            }`}
                          >
                            <Checkbox
                              checked={carrierForm.equipmentTypes.includes(option)}
                              onCheckedChange={() =>
                                toggleValue(option, carrierForm.equipmentTypes, (values) =>
                                  setCarrierForm((prev) => ({ ...prev, equipmentTypes: values })),
                                )
                              }
                              className="border-white/30 text-[hsl(var(--cyan-glow))]"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--text-secondary))]">Driver Type</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {DRIVER_OPTIONS.map((type) => (
                          <button
                            key={`carrier-driver-${type}`}
                            type="button"
                            onClick={() => setCarrierForm((prev) => ({ ...prev, driverType: type }))}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                              carrierForm.driverType === type
                                ? "border-[hsl(var(--orange-glow))] bg-[hsl(var(--orange-glow))]/15 text-white shadow-[0_0_15px_rgba(255,122,0,0.25)]"
                                : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--orange-glow))]/30 hover:text-white"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--text-secondary))]">Preferred Lanes</Label>
                    <Textarea
                      value={carrierForm.preferredLanes.join(", ")}
                      onChange={(event) => handleLaneInput(event.target.value, (lanes) =>
                        setCarrierForm((prev) => ({ ...prev, preferredLanes: lanes })),
                      )}
                      placeholder="IL ↔ TX, WI ↔ GA, WA ↔ CA"
                      className="min-h-[80px] border-white/10 bg-white/5 text-sm text-white placeholder:text-[hsl(var(--text-secondary))]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--text-secondary))]">Base Regions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {REGION_OPTIONS.map((region) => (
                        <label
                          key={`carrier-region-${region}`}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                            carrierForm.baseRegions.includes(region)
                              ? "border-[hsl(var(--cyan-glow))] bg-[hsl(var(--cyan-glow))]/15 text-white"
                              : "border-white/10 bg-white/5 text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--cyan-glow))]/30 hover:text-white"
                          }`}
                        >
                          <Checkbox
                            checked={carrierForm.baseRegions.includes(region)}
                            onCheckedChange={() =>
                              toggleValue(region, carrierForm.baseRegions, (values) =>
                                setCarrierForm((prev) => ({ ...prev, baseRegions: values })),
                              )
                            }
                            className="border-white/30 text-[hsl(var(--cyan-glow))]"
                          />
                          {region}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--text-secondary))]">Recruiting Notes</Label>
                    <Textarea
                      value={carrierForm.notes}
                      onChange={(event) => setCarrierForm((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="e.g. Need reefers with cross-border clearance ready for Q4 produce."
                      className="min-h-[90px] border-white/10 bg-white/5 text-sm text-white placeholder:text-[hsl(var(--text-secondary))]"
                    />
                  </div>

                  <GlowButton className="w-full sm:w-auto" onClick={applyCarrierProfile} disabled={carrierRefreshing}>
                    {carrierRefreshing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Calibrating Vehicle Profile
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Apply Profile
                      </span>
                    )}
                  </GlowButton>
                </GlassCard>

                <GlassCard glow="orange" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-[hsl(var(--orange-glow))]" />
                    <h3 className="text-lg font-semibold text-white">Capacity Blueprint</h3>
                  </div>
                  <div className="space-y-3 text-sm text-white/85">
                    {carrierSummary.map((line, index) => (
                      <div key={`carrier-summary-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-[hsl(var(--text-secondary))]">
                    <strong className="font-semibold text-white">API ready:</strong> swap{" "}
                    <code className="rounded bg-black/30 px-1 py-0.5 text-[10px] text-[hsl(var(--cyan-glow))]">
                      CARRIER_LEADS
                    </code>{" "}
                    for your onboarding CRM or market intel feeds to drive live recruiting.
                  </div>
                </GlassCard>
              </div>

              <GlassCard glow="orange" className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI-Screened Carrier Bench</h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">
                      Ranked by lane fit, equipment availability, and driver alignment — ready for capacity outreach now.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-[hsl(var(--orange-glow))]/40 bg-[hsl(var(--orange-glow))]/15 px-3 py-1 text-[hsl(var(--orange-glow))]">
                      {carrierLeads.filter((lead) => lead.score.label === "Hot").length} Hot
                    </span>
                    <span className="rounded-full border border-[hsl(var(--cyan-glow))]/40 bg-[hsl(var(--cyan-glow))]/15 px-3 py-1 text-[hsl(var(--cyan-glow))]">
                      {carrierLeads.filter((lead) => lead.score.label === "Warm").length} Warm
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                      {carrierLeads.filter((lead) => lead.score.label === "Cold").length} Cold
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {carrierLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[hsl(var(--cyan-glow))]/40 hover:bg-white/10"
                    >
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                        <div className="lg:col-span-1 space-y-1">
                          <p className="text-sm font-semibold text-white">{lead.carrierName}</p>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">Contact: {lead.contactName}</p>
                        </div>
                        <div className="lg:col-span-1 space-y-1 text-xs text-white/85">
                          <p className="font-medium text-white">Equipment</p>
                          <p className="text-[hsl(var(--text-secondary))]">{lead.equipment.join(", ")}</p>
                        </div>
                        <div className="lg:col-span-1 space-y-1 text-xs text-[hsl(var(--text-secondary))]">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[hsl(var(--cyan-glow))]" />
                            Base: {lead.baseRegion}
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation2 className="h-3.5 w-3.5 text-[hsl(var(--cyan-glow))]" />
                            {lead.preferredLanes.join(", ")}
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-2 text-xs text-white/80">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-[10px] uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                              Capacity Notes
                            </p>
                            <p className="mt-1 text-sm text-white">{lead.capacityNotes}</p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wide text-white/70">
                            Driver Model: {lead.driverModel}
                          </span>
                        </div>
                        <div className="lg:col-span-1 flex flex-col justify-between gap-3">
                          <div
                            className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold ${
                              lead.score.label === "Hot"
                                ? "border-[hsl(var(--orange-glow))]/60 bg-[hsl(var(--orange-glow))]/18 text-[hsl(var(--orange-glow))]"
                                : lead.score.label === "Warm"
                                  ? "border-[hsl(var(--cyan-glow))]/50 bg-[hsl(var(--cyan-glow))]/18 text-[hsl(var(--cyan-glow))]"
                                  : "border-white/10 bg-white/5 text-white/70"
                            }`}
                          >
                            {lead.score.label} • {lead.score.score}%
                          </div>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">{lead.score.rationale}</p>
                          <GlowButton variant="outline" onClick={() => openCarrierOutreach(lead)}>
                            Generate Outreach
                          </GlowButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </div>

      <Dialog
        open={Boolean(selectedShipper)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedShipper(null);
            setShipperOutreach(null);
          }
        }}
      >
        <DialogContent className="border border-white/10 bg-[hsl(var(--navy-medium))] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>AI Outreach Draft — Shipper</DialogTitle>
            <DialogDescription className="text-[hsl(var(--text-secondary))]">
              Tailored note referencing their freight program, lane, and contract posture.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80">
            <pre className="whitespace-pre-wrap text-sm">{shipperOutreach}</pre>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedCarrier)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCarrier(null);
            setCarrierOutreach(null);
          }
        }}
      >
        <DialogContent className="border border-white/10 bg-[hsl(var(--navy-medium))] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>AI Outreach Draft — Carrier</DialogTitle>
            <DialogDescription className="text-[hsl(var(--text-secondary))]">
              Sample recruiting message aligned to their equipment, lanes, and driver model.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80">
            <pre className="whitespace-pre-wrap text-sm">{carrierOutreach}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadGeneration;

