import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function ExcelReader() {
  const [data, setData] = useState(null);
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
          rowData.push(cell.value);
        });
        jsonData.push(rowData);
      });

      setData(jsonData);
      processData(jsonData);

      // Reset the file input using the ref so the onChange event will fire for new files.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const processData = (excelData) => {
    if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
      setGeneratedJson([]);
      return;
    }

    const processedData = excelData.map((row, index) => {
      if (row.length !== 0) {
        if (index > 7) {
          if (row[21] > 1 && row[21] < 11) {
            const number = row[21];
            const components = [];
            for (let i = 1; i <= number; i++) {
              components.push({
                description: String(i),
                length: "1",
                width: "1",
                height: "1",
                weight: "1",
              });
            }
            const newRow = [...row];
            newRow[21] = JSON.stringify(components);
            return newRow;
          } else {
            return row;
          }
        } else {
          return row;
        }
      } else {
        return row;
      }
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
    <div className="pt-2 flex font-sans">
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer border-none"
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
      </div>

      <button
        onClick={exportToExcel}
        className="px-3 ml-3 mb-6 bg-green-500 text-white rounded cursor-pointer border-none text-lg"
      >
        Export to Excel
      </button>
    </div>
  );
}

export default ExcelReader;
