import ExcelJS from "exceljs";

/**
 * Reads an Excel file and converts it to JSON array
 * @param {File} file - The Excel file to read
 * @returns {Promise<Array<Array>>} - Array of rows, each row is an array of cell values
 */
export const readExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet(1);
        const jsonData = [];

        worksheet.eachRow({ includeEmpty: true }, (row) => {
          const rowData = [];
          row.eachCell({ includeEmpty: true }, (cell) => {
            const value = cell.value;
            rowData.push(typeof value === "string" ? value.trim() : value);
          });
          jsonData.push(rowData);
        });

        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Creates a component array for places
 * @param {number} count - Number of components to generate
 * @returns {Array<Object>} - Array of component objects
 */
export const generateComponents = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    description: String(i + 1),
    length: "1",
    width: "1",
    height: "1",
    weight: "1",
  }));
};

/**
 * Creates a component array with barcodes for special client
 * @param {number} count - Number of components to generate
 * @param {string} prefix - Barcode prefix (e.g., "1234")
 * @returns {Array<Object>} - Array of component objects with barcodes
 */
export const generateComponentsWithBarcode = (count, prefix = "1234") => {
  return Array.from({ length: count }, (_, i) => ({
    description: String(i + 1),
    length: "3",
    width: "3",
    height: "4",
    weight: "1",
    barcode: `${prefix}-${i + 1}`,
  }));
};

/**
 * Formats barcodes as semicolon-separated string
 * @param {Array<Object>} components - Array of component objects with barcodes
 * @returns {string} - Semicolon-separated barcode string (e.g., "1234-1; 1234-2; 1234-3")
 */
export const formatBarcodesAsString = (components) => {
  return components.map((comp) => comp.barcode).join(",");
};

/**
 * Checks if a string is a comma or semicolon-separated barcode string
 * @param {string} str - String to check
 * @returns {boolean}
 */
export const isBarcodeString = (str) => {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  // Check if it matches barcode pattern (e.g., "657841-1" or "657876-2, 657876-1" or "1234-1; 1234-2")
  // Pattern: one or more digits, hyphen, one or more digits, optionally followed by comma/semicolon and more barcodes
  const barcodePattern = /^\d+-\d+(\s*[,;]\s*\d+-\d+)*$/;
  return barcodePattern.test(trimmed);
};

/**
 * Converts comma or semicolon-separated barcode string to JSON array
 * @param {string} barcodeString - Comma or semicolon-separated barcode string (e.g., "657841-1" or "657876-2, 657876-1" or "1234-1; 1234-2")
 * @returns {Array<Object>} - Array of component objects with barcodes
 */
export const convertBarcodeStringToJson = (barcodeString) => {
  if (!barcodeString || typeof barcodeString !== "string") {
    return [];
  }

  // Split by comma or semicolon and trim each barcode
  const barcodes = barcodeString
    .split(/[,;]/)
    .map((barcode) => barcode.trim())
    .filter(Boolean);

  // Create components array with barcodes
  return barcodes.map((barcode, index) => ({
    description: String(index + 1),
    length: "3",
    width: "3",
    height: "4",
    weight: "1",
    barcode: barcode,
  }));
};

/**
 * Auto-sizes columns in an Excel worksheet
 * @param {ExcelJS.Worksheet} worksheet - The worksheet to auto-size
 */
export const autoSizeColumns = (worksheet) => {
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value;
      const cellLength = cellValue ? cellValue.toString().length : 10;
      maxLength = Math.max(maxLength, cellLength);
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });
};

/**
 * Checks if a string is a JSON array
 * @param {string} str - String to check
 * @returns {boolean}
 */
export const isJsonArray = (str) => {
  return typeof str === "string" && str.trim().startsWith("[");
};

/**
 * Formats JSON string with proper indentation
 * @param {string} jsonString - JSON string to format
 * @returns {string} - Formatted JSON string
 */
export const formatJsonString = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return jsonString;
  }
};

