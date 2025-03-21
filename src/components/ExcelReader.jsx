import React, { useState } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

function ExcelReader() {
  const [data, setData] = useState(null);
  const [generatedJson, setGeneratedJson] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setData(jsonData);
      processData(jsonData); // Process the data immediately after reading
    };

    reader.readAsBinaryString(file);
  };

  const processData = (excelData) => {
    if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
      setGeneratedJson([]); // Set empty array if data is invalid
      return;
    }

    const processedData = excelData.map((row, index) => {
      if (row.length !== 0) {
        if (index > 7) {
          if (row[row.length - 1] > 1 && row[row.length - 1] < 11) {
            const number = row[row.length - 1];
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
            // Create a copy of row and replace last element
            const newRow = [...row];
            newRow[row.length - 1] = JSON.stringify(components);
            return newRow;
          } else {
            return row; //Return the row if the last element is not in the range
          }
        } else {
          return row; //Return the row if index is less then or equal to 7
        }
      } else {
        return row; //Return the row if the row is empty
      }
    });
    setGeneratedJson(processedData);
  };

  const exportToExcel = () => {
    if (!generatedJson || generatedJson.length === 0) {
      alert("No data to export.");
      return;
    }

    // Convert JSON strings back to objects before writing to Excel
    const dataToWrite = generatedJson.map((row) => {
      const newRow = [...row];
      if (
        typeof newRow[newRow.length - 1] === "string" &&
        newRow[newRow.length - 1].startsWith("[")
      ) {
        try {
          // Parse the JSON string
          const parsedJson = JSON.parse(newRow[newRow.length - 1]);

          // Convert the array of objects to a string representation
          newRow[newRow.length - 1] = JSON.stringify(parsedJson, null, 2); // Format the JSON string with indentation
        } catch (e) {
          console.error("Error parsing JSON string:", e);
          // If parsing fails, keep the original string
        }
      }
      return newRow;
    });

    const ws = XLSX.utils.aoa_to_sheet(dataToWrite);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProcessedData");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(blob, "processed_data.xlsx");
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
      />

      <div>
        <h3>Generated JSON:</h3>
      </div>

      <button onClick={exportToExcel}>Export to Excel</button>
    </div>
  );
}

export default ExcelReader;
