// Excel processing constants
export const EXCEL_CONSTANTS = {
  HEADER_ROW_COUNT: 8, // Rows to skip (0-indexed, so index > 7 means row 9+)
  PLACES_COLUMN_INDEX: 21, // Column V (0-indexed)
  MIN_PLACES: 2,
  MAX_PLACES: 10,
  DEFAULT_DIMENSIONS: {
    length: "1",
    width: "1",
    height: "1",
    weight: "1",
  },
  CLIENT_ID_ROW_INDEX: 2, // Row 3 (0-indexed) - Client's ID-Number row
  CLIENT_ID_COLUMN_INDEX: 1, // Column B (0-indexed) - where the ID value is
  SPECIAL_CLIENT_ID: "205050905", // Client ID that requires barcode format
  BARCODE_PREFIX: "1234", // Prefix for barcode generation
};

// File types
export const ACCEPTED_FILE_TYPES = {
  EXCEL: ".xlsx, .xls, .csv",
  EXCEL_ONLY: ".xlsx,.xls",
};

// Excel export settings
export const EXCEL_EXPORT = {
  DEFAULT_COLUMN_WIDTH: 10,
  COLUMN_PADDING: 2,
  MIN_COLUMN_WIDTH: 10,
  MIME_TYPE: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
};

// Component limits
export const LIMITS = {
  MAX_ITEMS: 10,
  MAX_PARCELS: 10,
};

