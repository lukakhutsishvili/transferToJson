import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import {
  extractRowData,
  createHeaderRows,
  writeDataRows,
  autoSizeWorksheetColumns,
} from "../utils/excelFormatHelpers";
import { ACCEPTED_FILE_TYPES } from "../utils/constants";

const ChangeExcelFormat = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [success, setSuccess] = useState(false);

  const readFileAsBuffer = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setFileName(file.name);

    try {
      const buffer = await readFileAsBuffer(file);
      const rowData = await extractRowData(buffer);

      if (rowData.length === 0) {
        setError("No data found in the file. Please check the file format.");
        return;
      }

      const newWorkbook = new ExcelJS.Workbook();
      const newSheet = newWorkbook.addWorksheet("Formatted Sheet");

      // Create header rows
      const headerRows = createHeaderRows();
      headerRows.forEach((rowData, index) => {
        const row = newSheet.getRow(index + 1);
        row.values = rowData;
        row.commit();
      });

      // Write data rows
      writeDataRows(newSheet, rowData, 9);

      // Auto-size columns
      autoSizeWorksheetColumns(newSheet);

      // Generate and download file
      const outputBuffer = await newWorkbook.xlsx.writeBuffer();
      const blob = new Blob([outputBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "formatted_output.xlsx");
      setSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      setError("დაფიქსირდა შეცდომა. იხილეთ კონსოლი დეტალებისთვის.");
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Excel ფაილის ფორმატირება
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          აირჩიე .xlsx ან .xls ფაილი ფორმატირებისთვის
        </p>

        <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg font-medium">
          <Upload className="w-5 h-5" />
          {fileName ? "Change File" : "ფაილის არჩევა"}
          <input
            type="file"
            accept={ACCEPTED_FILE_TYPES.EXCEL_ONLY}
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
        </label>

        {fileName && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
            <FileCheck className="w-4 h-4" />
            <span className="truncate">{fileName}</span>
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 text-blue-600 text-sm">Processing file...</div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && !error && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ File formatted successfully and downloaded!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeExcelFormat;
