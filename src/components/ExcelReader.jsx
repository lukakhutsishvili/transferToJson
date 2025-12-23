import { useRef, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const PLACES_COL_INDEX = 21;
// In the template header:
// I = weight, J = length, K = width, L = height, V = Places
const WEIGHT_COL_INDEX = 8;
const LENGTH_COL_INDEX = 9;
const WIDTH_COL_INDEX = 10;
const HEIGHT_COL_INDEX = 11;
const HEADER_ROW_COUNT = 8;
const MAX_AUTO_PLACES = 10;


const SPECIAL_CLIENT_ID = "205050905";
const CLIENT_ID_CELL = { rowIndex: 2, colIndex: 1 }; // row 3, column B (0-based indices)

function normalizeCellValue(value) {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value.trim() : String(value).trim();
}

function normalizeDimension(value, fallback = "1") {
  const str = normalizeCellValue(value);
  return str ? str : fallback;
}

function parseBarcodeList(value) {
  if (typeof value !== "string") return [];
  // Example input: "657841-2-1, 657841-2-2"
  const trimmed = value.trim();
  if (!trimmed) return [];
  // If it's already JSON, don't treat it as barcode list
  if (trimmed.startsWith("[")) return [];
  return trimmed
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function createPlacesJsonFromCount(count) {
  const places = [];
  for (let i = 1; i <= count; i++) {
    places.push({
      description: String(i),
      length: "1",
      width: "1",
      height: "1",
      weight: "1",
    });
  }
  return JSON.stringify(places);
}

function createPlacesJsonFromBarcodes(barcodes, dims) {
  const places = barcodes.map((barcode, idx) => ({
    description: String(idx + 1),
    length: 1,
    width: 1,
    height: 1,
    weight: 1,
    tracking_code: barcode,
  }));
  return JSON.stringify(places);
}

function ExcelReader() {
  const [_data, setData] = useState(null);
  const [generatedJson, setGeneratedJson] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear any previous state if necessary.
    setData(null);
    setGeneratedJson(null);

    const reader = new FileReader();

    reader.onload = async (event) => {
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

      setData(jsonData);

      const clientId = normalizeCellValue(
        jsonData?.[CLIENT_ID_CELL.rowIndex]?.[CLIENT_ID_CELL.colIndex]
      );
      processData(jsonData, clientId);

      // Reset the file input using the ref so the onChange event will fire for new files.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const processData = (excelData, clientId) => {
    if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
      setGeneratedJson([]);
      return;
    }

    const processedData = excelData.map((row, index) => {
      // Keep original behavior: only transform rows after the header, and only if places count is (1, 11).
      if (!row || row.length === 0) return row;
      if (index <= HEADER_ROW_COUNT - 1) return row;

      const placesValue = row[PLACES_COL_INDEX];
      const isSpecialClient = normalizeCellValue(clientId) === SPECIAL_CLIENT_ID;

      // Special client behavior: if V contains comma-separated barcodes like "657841-2-1, 657841-2-2",
      // convert it into Places JSON with `barcode` and row dimensions.
      if (isSpecialClient) {
        const barcodes = parseBarcodeList(placesValue);
        // If there's only one element (e.g. "123" or "657841-2-1"), do NOT touch it.
        // Only transform when there are 2+ comma-separated barcodes.
        if (barcodes.length > 1) {
          const dims = {
            weight: normalizeDimension(row?.[WEIGHT_COL_INDEX]),
            length: normalizeDimension(row?.[LENGTH_COL_INDEX]),
            width: normalizeDimension(row?.[WIDTH_COL_INDEX]),
            height: normalizeDimension(row?.[HEIGHT_COL_INDEX]),
          };

          const newRow = [...row];
          newRow[PLACES_COL_INDEX] = createPlacesJsonFromBarcodes(barcodes, dims);
          return newRow;
        }

        // For this client, we ONLY transform when V contains 2+ comma-separated barcodes.
        // If V is a single value (including a number like 3), leave it untouched.
        return row;
      }

      // Default behavior (existing): if V is a number (places count) between 2..10, generate default places JSON.
      const placesCount = placesValue;
      if (!(placesCount > 1 && placesCount < MAX_AUTO_PLACES + 1)) return row;

      const newRow = [...row];
      newRow[PLACES_COL_INDEX] = createPlacesJsonFromCount(placesCount);
      return newRow;
    });
    setGeneratedJson(processedData);
  };

  const exportToExcel = async () => {
    if (!generatedJson || generatedJson.length === 0) {
      alert("No data to export.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ProcessedData");

    const dataToWrite = generatedJson.map((row) => {
      const newRow = [...row];
      if (
        typeof newRow[newRow.length - 1] === "string" &&
        newRow[newRow.length - 1] &&
        newRow[newRow.length - 1].startsWith("[")
      ) {
        try {
          const parsedJson = JSON.parse(newRow[newRow.length - 1]);
          newRow[newRow.length - 1] = JSON.stringify(parsedJson, null, 2);
        } catch (e) {
          console.error("Error parsing JSON string:", e);
        }
      }
      return newRow;
    });

    dataToWrite.forEach((row) => {
      const excelRow = worksheet.addRow(row);
      row.forEach((cell, cellIndex) => {
        excelRow.getCell(cellIndex + 1).numFmt = "@";
      });
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value;
        const cellLength = cellValue ? cellValue.toString().length : 10;
        maxLength = Math.max(maxLength, cellLength);
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "processed_data.xlsx");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Convert Excel → Places JSON
          </h3>
          <p className="text-sm text-gray-600">
            Upload a file, then export the processed sheet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl cursor-pointer select-none shadow-sm hover:bg-blue-700 transition"
          >
            Choose File (XLSX, XLS, CSV)
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={exportToExcel}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl cursor-pointer select-none shadow-sm hover:bg-emerald-700 transition"
          >
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExcelReader;
