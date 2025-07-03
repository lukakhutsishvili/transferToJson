import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const GenerateFromData = () => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const readFileAsBuffer = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

    // Helper to trim only string values
    const getTrimmedValue = (value) => {
      if (typeof value === "string") return value.trim();
      return value;
    };

    try {
      const buffer = await readFileAsBuffer(file);

      const sourceWorkbook = new ExcelJS.Workbook();
      await sourceWorkbook.xlsx.load(buffer);
      const sourceSheet = sourceWorkbook.worksheets[0];

      const rowData = [];
      sourceSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
          rowData.push({
            recipientName: getTrimmedValue(row.getCell(1).value), // A
            address: getTrimmedValue(row.getCell(2).value), // B
            city: getTrimmedValue(row.getCell(3).value), // C
            phone: getTrimmedValue(row.getCell(5).value), // E
            weight: getTrimmedValue(row.getCell(6).value), // F
            packageCount: getTrimmedValue(row.getCell(7).value), // G
            orderNumber: getTrimmedValue(row.getCell(8).value), // H
            comment: getTrimmedValue(row.getCell(9).value), // I
            itemValue: getTrimmedValue(row.getCell(11).value), // K
          });
        }
      });

      const newWorkbook = new ExcelJS.Workbook();
      const newSheet = newWorkbook.addWorksheet("Formatted Sheet");

      const headerRows = [
        [
          "Template version (do not change)/შაბლონის ვერსია (არ შეიცვალოს)",
          "0.0.1",
        ],
        ["Client's name/კლიენტის სახელი", "შპს ნანოტეკი"],
        ["Client's ID-Number/კლიენტის საიდენთიფიკაციო", "404504791"],
        [
          "sending from the service center/სერვის ცენტრიდან გაგზავნა",
          "tbilisi warehouse",
        ],
        ["departure city/გამგზავნის ქალაქი", "თბილისი"],
        ["sender address/გამგზავნის მისამართი", ""],
        [],
        [
          `recipient's name/მიმღები`,
          `recipient phone number/მიმღების საკონტაქტო ნომერი`,
          `recipient's organization ID-number/მიმღების ორგანიზაციის საიდენტიფიკაციო ნომერი`,
          `recipient's organization name/მიმღების ორგანიზაციის სახელი`,
          `delivery to the service center/სერვის ცენტში მიტანა`,
          `recepient city/მიმღები ქალაქი`,
          `recipient address/მიმღების მისამართი`,
          `Document/დოკუმენტი`,
          `weight /წონა (კგ)`,
          `length/სიგრძე (სმ)`,
          `width/სიგანე (სმ)`,
          `height/სიმაღლე (სმ)`,
          `COD`,
          `estimated cost/შიგთავსის ღირებულება (ლარი)`,
          `payment by recipient`,
          `fragile`,
          `insured`,
          `description`,
          `client's custom attribute`,
          `COD საკომისიოს გადახდა მიმღების მიერ`,
          `International Tracking Number`,
          `Places/ ადგილებიანი ამანათი`,
          `With COD includes operational costs`,
          `Parcel with return`,
          `Payment by recipient for returning parcel`,
        ],
      ];

      headerRows.forEach((rowData, index) => {
        const row = newSheet.getRow(index + 1);
        row.values = rowData;
        row.commit();
      });

      const startRow = 9;
      rowData.forEach((data, index) => {
        const row = newSheet.getRow(startRow + index);

        row.getCell("A").value = getTrimmedValue(data.recipientName);
        row.getCell("B").value = getTrimmedValue(data.phone);
        row.getCell("F").value = getTrimmedValue(data.city);
        row.getCell("G").value = getTrimmedValue(data.address);
        row.getCell("I").value = getTrimmedValue(data.weight);

        const numericItemValue = Number(data.itemValue);
        row.getCell("M").value =
          !isNaN(numericItemValue) && numericItemValue > 0 ? "დიახ" : "არა";
        row.getCell("N").value = getTrimmedValue(data.itemValue);

        row.getCell("O").value = "არა";
        row.getCell("R").value = getTrimmedValue(data.comment);
        row.getCell("T").value = "არა";
        row.getCell("U").value = getTrimmedValue(data.orderNumber);
        row.getCell("X").value = "არა";

        // სვეტში "G" (ამანათის რაოდენობა) მოცემული მონაცემების გადამოწმება
        const packageCount = parseInt(data.packageCount);

        // მხოლოდ მაშინ შევქმნათ JSON, თუ "G" სვეტში (ამანათის რაოდენობა) არის 1-ზე მეტი
        if (packageCount > 1) {
          row.getCell("V").value = JSON.stringify(
            Array.from({ length: packageCount }, (_, i) => ({
              description: (i + 1).toString(),
              length: "1",
              width: "1",
              height: "1",
              weight: "1",
            }))
          );
        } else {
          // თუ 1-ზე ნაკლებია, არ დავამატოთ JSON
          row.getCell("V").value = "";
        }

        row.getCell("W").value = "არა";

        for (let col = 1; col <= 23; col++) {
          row.getCell(col).alignment = { wrapText: true };
        }

        row.commit();
      });

      newSheet.columns.forEach((column) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value;
          const length = val ? val.toString().length : 10;
          maxLength = Math.max(maxLength, length);
        });
        column.width = maxLength + 2;
      });

      const outputBuffer = await newWorkbook.xlsx.writeBuffer();
      const blob = new Blob([outputBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "formatted_output.xlsx");
    } catch (error) {
      console.error("Error:", error);
      alert("დაფიქსირდა შეცდომა. იხილეთ კონსოლი დეტალებისთვის.");
    }

    event.target.value = "";
  };

  return (
    <div className=" bg-gray-100 ">
      <div className="bg-white rounded-2xl shadow-lg p-4 max-w-md w-full text-center">
        <h2 className=" font-semibold text-gray-800 ">
          Excel ფაილის ფორმატირება
        </h2>
        <p className="text-gray-600 mb-6">
          აირჩიე .xlsx ან .xls ფაილი ფორმატირებისთვის
        </p>
        <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition duration-200">
          ფაილის არჩევა
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default GenerateFromData;
