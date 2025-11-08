export interface LogisticsData {
  shipper?: string | null;
  consignee?: string | null;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  pickupDate?: string | null;
  deliveryDate?: string | null;
  weight?: string | null;
  rate?: string | null;
  referenceNumber?: string | null;
  commodity?: string | null;
}

export interface DocumentResult {
  filename: string;
  success: boolean;
  data?: LogisticsData;
  error?: string;
  merged_from?: string[];
  document_count?: number;
  is_merged?: boolean;
}

export interface BulkExtractionResponse {
  totalFiles: number;
  successful: number;
  failed: number;
  results: DocumentResult[];
}

export interface TMSSendResult {
  success: boolean;
  loadId: string;
  message: string;
  timestamp: string;
  source?: string;
}

export interface TMSSendResponse {
  totalLoads: number;
  successful: number;
  failed: number;
  results: TMSSendResult[];
}
