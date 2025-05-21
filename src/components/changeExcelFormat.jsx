// import React from "react";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";

// const GenerateFromData = () => {
//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const readFileAsBuffer = (file) =>
//       new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = (e) => resolve(e.target.result);
//         reader.onerror = reject;
//         reader.readAsArrayBuffer(file);
//       });

//     try {
//       const buffer = await readFileAsBuffer(file);

//       // Load source data workbook
//       const sourceWorkbook = new ExcelJS.Workbook();
//       await sourceWorkbook.xlsx.load(buffer);
//       const sourceSheet = sourceWorkbook.worksheets[0];

//       // Read rows (starting after header, assuming first row is header)
//       const dataRows = [];
//       sourceSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//         if (rowNumber > 1) {
//           dataRows.push(row.values.slice(1)); // remove empty cell at index 0
//         }
//       });

//       // Create new workbook and sheet
//       const newWorkbook = new ExcelJS.Workbook();
//       const newSheet = newWorkbook.addWorksheet("Formatted Sheet");

//       // Add fixed headers and layout
//       const headerRows = [
//         ["Template version (do not change)/შაბლონის ვერსია (არ შეიცვალოს)", "0.0.1"],
//         ["Client's name/კლიენტის სახელი", "შპს ნანოტეკი"],
//         ["Client's ID-Number/კლიენტის საიდენთიფიკაციო", "404504791"],
//         ["sending from the service center/სერვის ცენტრიდან გაგზავნა", "tbilisi warehouse"],
//         ["departure city/გამგზავნის ქალაქი", ""],
//         ["sender address/გამგზავნის მისამართი", ""],
//         [],
//         [
//           `recipient's name/მიმღები\n*პირველი იწერება ყოველთვის მიმღების სახელი და შემდგომ გამოტოვების შემდეგ მიმღების გვარი`,
//           `recipient phone number/მიმღების საკონტაქტო ნომერი\n*ტელეფონი ფორმატი : (ზედმეტი სიმბოლოების და გამოტოვების გარეშე )995111222333`,
//           `recipient's organization ID-number/მიმღების ორგანიზაციის საიდენტიფიკაციო ნომერი\n*ივსება იმ შემთხვევაში თუ მიმღები არის ორგანიზაცია`,
//           `recipient's organization name/მიმღების ორგანიზაციის სახელი\n*ივსება იმ შემთხვევაში თუ მიმღები არის ორგანიზაცია`,
//           `delivery to the service center/სერვის ცენტში მიტანა\n*უნდა აირჩიოთ სიიდან ერთ-ერთი`,
//           `recepient city/მიმღები ქალაქი\n*უნდა აირჩიოთ სიიდან ერთ-ერთი`,
//           `recipient address/მიმღების მისამართი`,
//           `Document/დოკუმენტი\n*დიახ/არა\nუნდა აირჩიოთ სიიდან ერთ-ერთი`,
//           `weight /წონა (კგ)\n*აუცილებელი შესავსებად`,
//           `length/სიგრძე (სმ)`,
//           `width/სიგანე (სმ)`,
//           `height/სიმაღლე (სმ)`,
//           `COD\n*დიახ/არა\nუნდა აირჩიოთ სიიდან ერთ-ერთი`,
//           `estimated cost/შიგთავსის ღირებულება (ლარი)\n*აუცილებელია შესავსებად თუ COD=დიახ`,
//           `payment by recipient/ტრანსპორტირების თანხას იხდის მიმღები\n*დიახ/არა\nუნდა აირჩიოთ სიიდან ერთ-ერთი`,
//           `fragile/მსხვრევადი\n*დიახ/არა\nუნდა აირჩიოთ სიიდან ერთ-ერთი`,
//           `insured/დაზღვეული\n*დიახ/არა\nუნდა აირჩიოთ სიიდან ერთ-ერთი`,
//           `description/აღწერა`,
//           `client's custom attribute/კლიენტის მორგებული ატრიბუტი\n*მაგალითად თქვენ შეგიძლიათ შეიყვანოთ თქვენი შიდა ტრეკინგ კოდი`,
//           `COD საკომისიოს გადახდა მიმღების მიერ`,
//           `International Tracking Number / საერთაშორისო ტრეკინგის ნომერი`,
//           `Places/ ადგილებიანი ამანათი`,
//         ],
//       ];

//       headerRows.forEach((rowData, index) => {
//         const row = newSheet.getRow(index + 1);
//         row.values = rowData;
//         row.commit();
//       });

//       // Add data rows starting from row 8
//       const startRow = 8;
//       dataRows.forEach((rowData, index) => {
//         const row = newSheet.getRow(startRow + index);
//         row.values = rowData;
//         row.commit();
//       });

//       // Save and download
//       const outputBuffer = await newWorkbook.xlsx.writeBuffer();
//       const blob = new Blob([outputBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });
//       saveAs(blob, "formatted_output.xlsx");
//     } catch (error) {
//       console.error("Error processing file:", error);
//       alert("An error occurred. Check the console for details.");
//     }
//   };

//   return (
//     <div>
//       <p><strong>Upload raw data Excel:</strong></p>
//       <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
//     </div>
//   );
// };

// export default GenerateFromData;
