
/** App-wide constants and enums */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const PDF_WORKER_SRC = "/pdf.worker.mjs";
export const TOAST_AUTO_CLOSE_MS = 8000;

export const ERROR_MESSAGES = {
  FILE_TYPE: "File must be a CSV or PDF.",
  FILE_SIZE: "File size must be less than 10MB",
  CSV_MIN_ROWS: "CSV file must contain at least one data row.",
  PDF_NO_TEXT: "No readable text found in your PDF. Check if it's scanned or export a fresh copy.",
  PDF_ONLY_WHITESPACE: "PDF extracted but contains only blank lines. Try a new export.",
  UPLOAD_FAIL: "Failed to upload and process file",
  NO_VALID_TRADES: "No valid trades found in file. Please check the format.",
  NO_EXPORT_DATA: "No data to export",
  // Add other reusable error messages as your app grows...
};

export enum UploadStatus {
  Idle = "idle",
  Uploading = "uploading",
  Success = "success",
  Error = "error",
}
