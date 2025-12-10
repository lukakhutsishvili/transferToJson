import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { 
  readExcelFile, 
  generateComponents, 
  generateComponentsWithBarcode,
  formatBarcodesAsString,
  isBarcodeString,
  convertBarcodeStringToJson,
  autoSizeColumns, 
  isJsonArray, 
  formatJsonString 
} from "../utils/excelHelpers";
import { EXCEL_CONSTANTS, ACCEPTED_FILE_TYPES, EXCEL_EXPORT } from "../utils/constants";
import { Upload, Download, FileCheck } from "lucide-react";

function ExcelReader() {
  const [data, setData] = useState(null);
  const [generatedJson, setGeneratedJson] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setData(null);
    setGeneratedJson(null);
    setFileName(file.name);

    try {
      const jsonData = await readExcelFile(file);
      setData(jsonData);
      processData(jsonData);
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Failed to read file. Please ensure it's a valid Excel file.");
      setFileName(null);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const processData = (excelData) => {
    if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
      setGeneratedJson([]);
      return;
    }

    const { 
      HEADER_ROW_COUNT, 
      PLACES_COLUMN_INDEX, 
      MIN_PLACES, 
      MAX_PLACES,
      CLIENT_ID_ROW_INDEX,
      CLIENT_ID_COLUMN_INDEX,
      SPECIAL_CLIENT_ID,
      BARCODE_PREFIX
    } = EXCEL_CONSTANTS;

    // Check if client ID matches special case
    const clientIdRow = excelData[CLIENT_ID_ROW_INDEX];
    const clientId = clientIdRow && clientIdRow[CLIENT_ID_COLUMN_INDEX] 
      ? String(clientIdRow[CLIENT_ID_COLUMN_INDEX]).trim() 
      : null;
    
    const isSpecialClient = clientId === SPECIAL_CLIENT_ID;

    const processedData = excelData.map((row, index) => {
      // Skip empty rows
      if (!row || row.length === 0) {
        return row;
      }

      // Process data rows (skip header rows)
      if (index > HEADER_ROW_COUNT) {
        const placesValue = row[PLACES_COLUMN_INDEX];
        
        // Check if it's already a barcode string format (e.g., "1234-1; 1234-2; 1234-3")
        if (isBarcodeString(placesValue)) {
          // Convert barcode string to JSON array with barcode field
          const components = convertBarcodeStringToJson(placesValue);
          const newRow = [...row];
          newRow[PLACES_COLUMN_INDEX] = JSON.stringify(components);
          return newRow;
        }
        
        // Check if it's a number (regular case)
        const placesCount = Number(placesValue);
        if (placesCount > MIN_PLACES && placesCount <= MAX_PLACES) {
          const newRow = [...row];
          
          if (isSpecialClient) {
            // Generate components with barcodes for special client
            const components = generateComponentsWithBarcode(placesCount, BARCODE_PREFIX);
            // Store as JSON string (not semicolon-separated)
            newRow[PLACES_COLUMN_INDEX] = JSON.stringify(components);
          } else {
            // Regular format: JSON string
            const components = generateComponents(placesCount);
            newRow[PLACES_COLUMN_INDEX] = JSON.stringify(components);
          }
          
          return newRow;
        }
      }

      return row;
    });

    setGeneratedJson(processedData);
  };

  const exportToExcel = async () => {
    if (!generatedJson || generatedJson.length === 0) {
      setError("No data to export. Please upload a file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("ProcessedData");

      // Format JSON strings in the Places column (only if it's JSON, not barcode string)
      const dataToWrite = generatedJson.map((row) => {
        const newRow = [...row];
        const placesCellIndex = EXCEL_CONSTANTS.PLACES_COLUMN_INDEX;
        
        if (placesCellIndex < newRow.length) {
          const placesCell = newRow[placesCellIndex];
          
          // Only format if it's a JSON array (not a semicolon-separated barcode string)
          if (isJsonArray(placesCell)) {
            newRow[placesCellIndex] = formatJsonString(placesCell);
          }
          // If it's a semicolon-separated barcode string, leave it as is
        }

        return newRow;
      });

      // Write data to worksheet
      dataToWrite.forEach((row) => {
        const excelRow = worksheet.addRow(row);
        row.forEach((cell, cellIndex) => {
          excelRow.getCell(cellIndex + 1).numFmt = "@";
        });
      });

      // Auto-size columns
      autoSizeColumns(worksheet);

      // Generate and download file
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: EXCEL_EXPORT.MIME_TYPE,
      });
      saveAs(blob, "processed_data.xlsx");
    } catch (err) {
      console.error("Error exporting file:", err);
      setError("Failed to export file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
          >
            <Upload className="w-5 h-5" />
            {fileName ? "Change File" : "Choose File"}
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={ACCEPTED_FILE_TYPES.EXCEL}
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
          {fileName && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <FileCheck className="w-4 h-4" />
              <span className="truncate">{fileName}</span>
            </div>
          )}
        </div>

        <button
          onClick={exportToExcel}
          disabled={!generatedJson || generatedJson.length === 0 || isProcessing}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors shadow-md hover:shadow-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
        >
          <Download className="w-5 h-5" />
          {isProcessing ? "Processing..." : "Export to Excel"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {generatedJson && generatedJson.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ File processed successfully. {generatedJson.length} rows ready for export.
        </div>
      )}
    </div>
  );
}

export default ExcelReader;
