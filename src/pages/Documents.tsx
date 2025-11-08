import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GlowButton } from "@/components/GlowButton";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Trash2,
  Loader2,
  Send,
  Table,
  LayoutList,
  Download,
  GitMerge,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import {
  BulkExtractionResponse,
  LogisticsData,
  TMSSendResponse,
} from "@/types/documents";

const SAMPLE_DOCUMENTS: { name: string; content: string; type: string }[] = [
  {
    name: "sample_bol.txt",
    type: "text/plain",
    content: `BILL OF LADING\n\nBOL Number: BOL-2025-001234\nDate: November 3, 2025\n\nSHIPPER INFORMATION\nABC Manufacturing Company\n1500 Industrial Parkway\nChicago, IL 60607\nPhone: (312) 555-0100\n\nCONSIGNEE INFORMATION\nXYZ Distribution Center\n2800 Warehouse Boulevard\nDallas, TX 75201\nPhone: (214) 555-0200\n\nSHIPMENT DETAILS\nPickup Address: 1500 Industrial Parkway, Chicago, IL 60607\nPickup Date: November 10, 2025\nDelivery Address: 2800 Warehouse Boulevard, Dallas, TX 75201\nDelivery Date: November 12, 2025\n\nFREIGHT DESCRIPTION\nCommodity: Electronics - Computer Components\nWeight: 15,000 lbs\nRate: $1,562.50\nReference: PRO-9876543`,
  },
  {
    name: "sample_rate_confirmation.txt",
    type: "text/plain",
    content: `RATE CONFIRMATION\n\nConfirmation Number: RC-2025-5678\nDate Issued: November 3, 2025\n\nSHIPPER: Global Auto Parts Manufacturing Inc.\nRECEIVER: Premium Auto Distributors LLC\nPickup: Detroit, MI (Nov 8, 2025)\nDelivery: Atlanta, GA (Nov 10, 2025)\nCommodity: Automotive Parts\nWeight: 22,500 lbs\nRate: $2,578.00\nReference: PO-AUTO-2025-3344`,
  },
  {
    name: "sample_invoice.csv",
    type: "text/csv",
    content: `field,value\nshipper,Acme Logistics\nconsignee,Metro Stores\npickupAddress,445 Industrial Rd, Memphis TN\ndeliveryAddress,999 Commerce Blvd, Orlando FL\npickupDate,2025-11-14\ndeliveryDate,2025-11-16\nweight,32000 lbs\nrate,$1,950.00\nreferenceNumber,INV-556677\ncommodity,General Merchandise`,
  },
];

const statusConfig = {
  success: {
    label: "Complete",
    icon: CheckCircle,
    chipClass: "bg-green-400/10 text-green-400",
  },
  merged: {
    label: "Merged",
    icon: GitMerge,
    chipClass: "bg-cyan-400/10 text-cyan-300",
  },
  processing: {
    label: "Processing",
    icon: Clock,
    chipClass: "bg-[hsl(var(--orange-glow))]/10 text-[hsl(var(--orange-glow))]",
  },
  error: {
    label: "Failed",
    icon: AlertCircle,
    chipClass: "bg-red-400/10 text-red-400",
  },
};

type ViewMode = "cards" | "table";

const formatValue = (value?: string | null) => (value && value.trim().length > 0 ? value : "—");

const documentsEndpoint = `${API_BASE_URL}/api/documents`;

const Documents = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<BulkExtractionResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [tmsResponse, setTmsResponse] = useState<TMSSendResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processedResults = response?.results ?? [];

  useEffect(() => {
    if (processedResults.length === 0) {
      setSelectedIndex(0);
      return;
    }

    if (selectedIndex >= processedResults.length) {
      setSelectedIndex(0);
    }
  }, [processedResults.length, selectedIndex]);

  const metrics = useMemo(() => {
    if (!response) {
      return {
        totalFiles: selectedFiles.length,
        uniqueLoads: 0,
        mergedLoads: 0,
        failed: 0,
      };
    }

    const mergedLoads = response.results.filter((result) => result.is_merged).length;
    const uniqueLoads = response.results.filter((result) => result.success).length;

    return {
      totalFiles: response.totalFiles,
      uniqueLoads,
      mergedLoads,
      failed: response.failed,
    };
  }, [response, selectedFiles.length]);

  const selectedResult = processedResults[selectedIndex];

  const successfulLoads = useMemo(
    () => processedResults.filter((result) => result.success && result.data),
    [processedResults]
  );

  const handleFileInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  }, []);

  const handleAddSampleDocuments = useCallback(() => {
    const samples = SAMPLE_DOCUMENTS.map((sample) => {
      try {
        return new File([sample.content], sample.name, { type: sample.type });
      } catch {
        const blob = new Blob([sample.content], { type: sample.type });
        return Object.assign(blob, { name: sample.name, lastModified: Date.now() }) as File;
      }
    });

    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((file) => file.name));
      const filtered = samples.filter((sample) => !existingNames.has(sample.name));
      if (filtered.length === 0) {
        setErrorMessage("Sample documents already added to the queue.");
        return prev;
      }
      setErrorMessage(null);
      return [...prev, ...filtered];
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const resetWorkflow = useCallback(() => {
    setSelectedFiles([]);
    setResponse(null);
    setSelectedIndex(0);
    setTmsResponse(null);
    setErrorMessage(null);
  }, []);

  const handleProcessDocuments = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("Please upload at least one PDF, DOCX, TXT, or CSV document.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setTmsResponse(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file, file.name));

      const response = await fetch(`${documentsEndpoint}/extract?deduplicate=true`, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as BulkExtractionResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to process documents");
      }

      setResponse(data);
      setSelectedIndex(0);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred while processing documents."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles]);

  const handleSendToTms = useCallback(async () => {
    if (!successfulLoads.length) {
      setErrorMessage("No successful loads to send to TMS.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${documentsEndpoint}/tms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loads: successfulLoads.map((result) => result.data),
          source: "AI_Logistics_Document_Extraction",
        }),
      });

      const data = (await response.json()) as TMSSendResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to send loads to TMS");
      }

      setTmsResponse(data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred while sending to TMS."
      );
    } finally {
      setIsSending(false);
    }
  }, [successfulLoads]);

  const downloadCsv = useCallback(() => {
    if (!processedResults.length) return;

    const headers = [
      "Filename",
      "Status",
      "Merged From",
      "Shipper",
      "Consignee",
      "Pickup Address",
      "Delivery Address",
      "Pickup Date",
      "Delivery Date",
      "Weight",
      "Rate",
      "Reference Number",
      "Commodity",
    ];

    const rows = processedResults.map((result) => [
      result.filename,
      result.success ? (result.is_merged ? "Merged" : "Success") : "Failed",
      result.merged_from?.join("; ") ?? result.filename,
      formatValue(result.data?.shipper),
      formatValue(result.data?.consignee),
      formatValue(result.data?.pickupAddress),
      formatValue(result.data?.deliveryAddress),
      formatValue(result.data?.pickupDate),
      formatValue(result.data?.deliveryDate),
      formatValue(result.data?.weight),
      formatValue(result.data?.rate),
      formatValue(result.data?.referenceNumber),
      formatValue(result.data?.commodity),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logistics-extraction-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [processedResults]);

  const renderLoadDetails = (data: LogisticsData | undefined, isMerged: boolean) => {
    if (!data) {
      return (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/40 text-red-200">
          Unable to display data for this document.
        </div>
      );
    }

    const attributes: { label: string; value?: string | null }[] = [
      { label: "Shipper", value: data.shipper },
      { label: "Consignee", value: data.consignee },
      { label: "Pickup Address", value: data.pickupAddress },
      { label: "Delivery Address", value: data.deliveryAddress },
      { label: "Pickup Date", value: data.pickupDate },
      { label: "Delivery Date", value: data.deliveryDate },
      { label: "Weight", value: data.weight },
      { label: "Rate", value: data.rate },
      { label: "Reference Number", value: data.referenceNumber },
      { label: "Commodity", value: data.commodity },
    ];

    return (
      <div className="space-y-4">
        {isMerged && (
          <div className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-400/40 text-cyan-200 text-sm">
            Combined data from multiple documents. Conflicting values were resolved using the most detailed entries.
          </div>
        )}
        {attributes.map((item) => (
          <div key={item.label} className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
              {item.label}
            </span>
            <div className="flex items-center justify-between">
              <p className="text-white text-base font-medium">{formatValue(item.value)}</p>
              {item.value && <CheckCircle className="w-4 h-4 text-green-400" />}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-deep))] pb-12">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">AI Document Automation</h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Upload logistics documents, extract structured data, merge duplicates, and send consolidated loads to TMS.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <GlassCard className="space-y-4 xl:col-span-1" glow="cyan">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-white">Upload Documents</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <GlowButton variant="outline" className="px-4 py-2 text-xs" onClick={resetWorkflow}>
                  Reset
                </GlowButton>
                <GlowButton
                  variant="secondary"
                  className="px-4 py-2 text-xs"
                  onClick={handleAddSampleDocuments}
                >
                  Add Sample Documents
                </GlowButton>
              </div>
            </div>

            <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center cursor-pointer hover:bg-white/10 transition-all">
              <Upload className="w-8 h-8 text-white/80" />
              <div className="space-y-1">
                <p className="text-white font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Supports PDF, DOCX, TXT, CSV (20MB max each)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>

            {selectedFiles.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium truncate max-w-[160px]">{file.name}</p>
                        <span className="text-xs text-[hsl(var(--text-secondary))]">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      className="p-2 rounded-lg bg-red-400/10 text-red-300 hover:bg-red-400/20"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <GlowButton
              variant="primary"
              className="w-full justify-center flex items-center gap-2"
              onClick={handleProcessDocuments}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Process Documents</>
              )}
            </GlowButton>
          </GlassCard>

          <GlassCard className="space-y-4 xl:col-span-3" glow="orange">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Processing Summary</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <GlowButton
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2"
                  onClick={handleSendToTms}
                  disabled={isSending || !successfulLoads.length}
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send All to TMS
                </GlowButton>
                <button
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "cards"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-[hsl(var(--text-secondary))]"
                  }`}
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutList className="w-4 h-4 inline mr-2" /> Cards
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "table"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-[hsl(var(--text-secondary))]"
                  }`}
                  onClick={() => setViewMode("table")}
                >
                  <Table className="w-4 h-4 inline mr-2" /> Table
                </button>
                <button
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-white/5 text-white flex items-center gap-2 hover:bg-white/10"
                  onClick={downloadCsv}
                  disabled={!processedResults.length}
                >
                  <Download className="w-4 h-4" /> CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs uppercase text-[hsl(var(--text-secondary))]">Documents</span>
                <p className="text-3xl font-bold text-white">{metrics.totalFiles}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs uppercase text-[hsl(var(--text-secondary))]">Unique Loads</span>
                <p className="text-3xl font-bold text-white">{metrics.uniqueLoads}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs uppercase text-[hsl(var(--text-secondary))]">Merged Loads</span>
                <p className="text-3xl font-bold text-white">{metrics.mergedLoads}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs uppercase text-[hsl(var(--text-secondary))]">Failed</span>
                <p className="text-3xl font-bold text-white">{metrics.failed}</p>
              </div>
            </div>

            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {processedResults.map((result, index) => {
                  const isSelected = index === selectedIndex;
                  const status = !result.success
                    ? statusConfig.error
                    : result.is_merged
                    ? statusConfig.merged
                    : statusConfig.success;

                  const StatusIcon = status.icon;

                  return (
                    <button
                      key={`${result.filename}-${index}`}
                      onClick={() => setSelectedIndex(index)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected ? "border-[hsl(var(--orange-glow))] bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/5">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-white font-semibold">{result.filename}</p>
                            {result.merged_from && result.merged_from.length > 1 && (
                              <p className="text-xs text-[hsl(var(--text-secondary))]">
                                Sources: {result.merged_from.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${status.chipClass}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      {result.error && (
                        <p className="mt-3 text-sm text-red-300">{result.error}</p>
                      )}
                      {result.document_count && result.document_count > 1 && (
                        <p className="mt-2 text-xs text-cyan-200">
                          Combined from {result.document_count} documents
                        </p>
                      )}
                    </button>
                  );
                })}
                {processedResults.length === 0 && (
                  <div className="col-span-full p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-[hsl(var(--text-secondary))]">
                    Upload documents to see AI extraction results.
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="min-w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-xs uppercase tracking-wide text-[hsl(var(--text-secondary))]">
                      <th className="px-4 py-3">Filename</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Shipper</th>
                      <th className="px-4 py-3">Consignee</th>
                      <th className="px-4 py-3">Pickup</th>
                      <th className="px-4 py-3">Delivery</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Commodity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedResults.map((result, index) => {
                      const status = !result.success
                        ? statusConfig.error
                        : result.is_merged
                        ? statusConfig.merged
                        : statusConfig.success;

                      return (
                        <tr
                          key={`${result.filename}-${index}`}
                          className={`text-sm transition-all ${
                            index === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                          onClick={() => setSelectedIndex(index)}
                        >
                          <td className="px-4 py-3 text-white font-medium truncate max-w-[200px]">
                            {result.filename}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs ${status.chipClass}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {formatValue(result.data?.shipper)}
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {formatValue(result.data?.consignee)}
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {formatValue(result.data?.pickupAddress)}
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {formatValue(result.data?.deliveryAddress)}
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {formatValue(result.data?.referenceNumber)}
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {formatValue(result.data?.commodity)}
                          </td>
                        </tr>
                      );
                    })}
                    {processedResults.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-[hsl(var(--text-secondary))]">
                          Upload documents to see AI extraction results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <GlassCard className="space-y-4 xl:col-span-2" glow="cyan">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Extracted Load Details</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--text-secondary))]">
                  {successfulLoads.length} load(s) ready to send
                </span>
              </div>
            </div>

            {selectedResult ? (
              selectedResult.success ? (
                renderLoadDetails(selectedResult.data, !!selectedResult.is_merged)
              ) : (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-200">
                  <p className="font-semibold">Failed to process {selectedResult.filename}</p>
                  <p className="text-sm mt-2">{selectedResult.error}</p>
                </div>
              )
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center text-[hsl(var(--text-secondary))]">
                Select a load to view the extracted data.
              </div>
            )}
          </GlassCard>

          <GlassCard className="space-y-4" glow="orange">
            <h3 className="text-xl font-bold text-white">Workflow Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-white/10">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">{successfulLoads.length} loads ready</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    AI extracted structured logistics data for your documents.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-white/10">
                  <GitMerge className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-white font-semibold">{metrics.mergedLoads} merged shipments</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Duplicate documents were merged into single loads automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-white/10">
                  <Clock className="w-5 h-5 text-[hsl(var(--orange-glow))]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Minutes saved</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    Automate manual data entry for BOLs, rate confirmations, invoices, and CSV manifests.
                  </p>
                </div>
              </div>

              {tmsResponse && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-400/40 text-green-200 space-y-2">
                  <p className="font-semibold">
                    Sent {tmsResponse.successful}/{tmsResponse.totalLoads} loads to TMS successfully.
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {tmsResponse.results.map((result) => (
                      <div key={result.loadId} className="text-xs">
                        <span className="font-semibold">{result.loadId}</span>: {result.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Documents;
