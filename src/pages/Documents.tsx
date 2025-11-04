import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import { FileText, CheckCircle, AlertCircle, Clock, MapPin } from "lucide-react";

const Documents = () => {
  const documents = [
    { name: "BOL_Chicago_Dallas", status: "processing", label: "Processing..." },
    { name: "RateConf_0425.pdf", status: "complete", label: "Complete" },
    { name: "Invoice_12345.pdf", status: "complete", label: "Complete" },
    { name: "BOL_67890.pdf", status: "review", label: "Needs Review" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))]">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">AI Document Automation</h1>
          <p className="text-[hsl(var(--text-secondary))]">Intelligent document processing and data extraction</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <GlassCard className="space-y-4" glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">Input Documents</h3>
            
            <div className="space-y-3">
              {documents.map((doc, index) => {
                const StatusIcon = doc.status === "complete" ? CheckCircle : 
                                 doc.status === "processing" ? Clock : AlertCircle;
                const statusColor = doc.status === "complete" ? "text-green-400" : 
                                  doc.status === "processing" ? "text-[hsl(var(--orange-glow))]" : "text-yellow-400";
                const bgColor = doc.status === "complete" ? "bg-green-400/10" : 
                               doc.status === "processing" ? "bg-[hsl(var(--orange-glow))]/10" : "bg-yellow-400/10";
                
                return (
                  <div 
                    key={index}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{doc.name}</p>
                        <div className={`flex items-center gap-1 mt-1 px-2 py-1 rounded ${bgColor} w-fit`}>
                          <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                          <span className={`text-xs ${statusColor}`}>{doc.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <GlowButton variant="primary" className="w-full">
              Upload Document
            </GlowButton>
          </GlassCard>

          {/* Map Visualization */}
          <GlassCard className="space-y-4" glow="orange">
            <h3 className="text-xl font-bold text-white mb-4">AI Extraction Results</h3>
            
            {/* Route Map */}
            <div className="relative aspect-video rounded-xl bg-gradient-to-br from-[hsl(var(--navy-panel))] to-[hsl(var(--navy-medium))] overflow-hidden">
              <svg viewBox="0 0 600 400" className="w-full h-full">
                {/* US Map simplified outline */}
                <path
                  d="M 100 150 L 500 150 L 500 300 L 100 300 Z"
                  fill="rgba(255,255,255,0.05)"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
                
                {/* Route line with glow */}
                <path
                  d="M 200 180 Q 350 150 450 240"
                  fill="none"
                  stroke="hsl(var(--orange-glow))"
                  strokeWidth="3"
                  className="animate-pulse"
                  filter="url(#glow)"
                />
                
                {/* Document icon */}
                <g transform="translate(180, 160)">
                  <circle cx="20" cy="20" r="25" fill="white" opacity="0.9" />
                  <rect x="10" y="12" width="20" height="16" fill="hsl(var(--navy-deep))" rx="2" />
                  <line x1="13" y1="16" x2="27" y2="16" stroke="white" strokeWidth="1" />
                  <line x1="13" y1="19" x2="27" y2="19" stroke="white" strokeWidth="1" />
                  <line x1="13" y1="22" x2="22" y2="22" stroke="white" strokeWidth="1" />
                </g>
                
                {/* Origin marker */}
                <circle cx="200" cy="180" r="6" fill="hsl(var(--cyan-glow))" className="animate-pulse-glow" />
                <text x="200" y="170" textAnchor="middle" fill="white" fontSize="12">Chicago</text>
                
                {/* Destination marker */}
                <circle cx="450" cy="240" r="6" fill="hsl(var(--orange-glow))" className="animate-pulse-glow" />
                <text x="450" y="260" textAnchor="middle" fill="white" fontSize="12">Dallas</text>
                
                {/* Glow filter */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </svg>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Conside
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Needs Review
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                <span className="text-sm text-white">3 Documents Processed Automatically</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                <span className="text-sm text-white">12 Minutes Saved</span>
              </div>
            </div>
          </GlassCard>

          {/* Extracted Data */}
          <GlassCard className="space-y-4" glow="cyan">
            <h3 className="text-xl font-bold text-white mb-4">Extracted Data</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Shipper</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Acme Freight Co.</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <span className="text-xs text-green-400">Verified</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Consignee</span>
                  <span className="text-white font-medium">Dallas Distribution LLC</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Origin</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Chicago, IL</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400">Complete</span>
                  <span className="text-xs text-green-400">Verified</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Destination</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">Dallas, TX</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yellow-400">Vailas 24</span>
                  <span className="text-xs text-green-400">Verified</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Weight</span>
                  <span className="text-white font-medium">42,000 lbs</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">Rate</span>
                  <span className="text-white font-medium">$1,240</span>
                </div>
              </div>

              <GlowButton variant="primary" className="w-full mt-6">
                Send to TMS
              </GlowButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Documents;
