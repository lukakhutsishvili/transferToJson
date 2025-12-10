import ExcelJS from "exceljs";

/**
 * Trims string values, leaves other types unchanged
 */
export const getTrimmedValue = (value) => {
  if (typeof value === "string") return value.trim();
  return value;
};

/**
 * Reads Excel file and extracts row data
 */
export const extractRowData = async (buffer) => {
  const sourceWorkbook = new ExcelJS.Workbook();
  await sourceWorkbook.xlsx.load(buffer);
  const sourceSheet = sourceWorkbook.worksheets[0];

  const rowData = [];
  sourceSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      // Skip header row
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

  return rowData;
};

/**
 * Creates header rows for the formatted Excel sheet
 */
export const createHeaderRows = () => {
  return [
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
};

/**
 * Writes data rows to the worksheet
 */
export const writeDataRows = (worksheet, rowData, startRow = 9) => {
  rowData.forEach((data, index) => {
    const row = worksheet.getRow(startRow + index);

    // Map data to columns
    row.getCell("A").value = getTrimmedValue(data.recipientName);
    row.getCell("B").value = getTrimmedValue(data.phone);
    row.getCell("F").value = getTrimmedValue(data.city);
    row.getCell("G").value = getTrimmedValue(data.address);
    row.getCell("I").value = getTrimmedValue(data.weight);

    // Handle item value (COD logic)
    const numericItemValue = Number(data.itemValue);
    row.getCell("M").value =
      !isNaN(numericItemValue) && numericItemValue > 0 ? "დიახ" : "არა";
    row.getCell("N").value = getTrimmedValue(data.itemValue);

    // Default values
    row.getCell("O").value = "არა";
    row.getCell("R").value = getTrimmedValue(data.comment);
    row.getCell("T").value = "არა";
    row.getCell("U").value = getTrimmedValue(data.orderNumber);
    row.getCell("X").value = "არა";
    row.getCell("W").value = "არა";

    // Handle package count (Places column)
    const packageCount = parseInt(data.packageCount);
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
      row.getCell("V").value = "";
    }

    // Apply text wrapping to all cells
    for (let col = 1; col <= 23; col++) {
      row.getCell(col).alignment = { wrapText: true };
    }

    row.commit();
  });
};

/**
 * Auto-sizes columns in worksheet
 */
export const autoSizeWorksheetColumns = (worksheet) => {
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value;
      const length = val ? val.toString().length : 10;
      maxLength = Math.max(maxLength, length);
    });
    column.width = maxLength + 2;
  });
};

