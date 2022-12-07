let express = require("express");
let Excel = require("exceljs");
const fs = require("fs");

let app = express();
// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// request to check if application is working or not
app.get("/", async function (req, res) {
  return res.status(200).send({ message: "Api Working....." });
});
let row_number = 50;

// read data.csv file with this route
app.get("/check", async function (req, res) {
  const data = await getRowsFromSheet();
  res.status(200).send({
    message: `Data in csv for first ${row_number} records.`,
    data: data,
  });
});

async function getRowsFromSheet() {
  // use Excel to get the workbook of all sheets
  let workbook = new Excel.Workbook();
  let file = "data.csv";
  let startRow = 2;

  // read csv file 
  const worksheet = await workbook.csv.readFile(file);
  // row_number = worksheet.actualRowCount;
  let rowData = {
    Make: [],
    Model: [],
    Vehicle_Class: [],
  };

  // loop through all rows of sheet
  for (let i = startRow; i <= row_number; i++) {

    // get 1st column data
    let Make = worksheet.getRow(i).getCell(1).toString();
    // get 2nd column data
    let Model = worksheet.getRow(i).getCell(2).toString();
    // get 3rd column data
    let Vehicle_Class = worksheet.getRow(i).getCell(3).toString();

    rowData.Make.push(Make);
    rowData.Model.push(Model);
    rowData.Vehicle_Class.push(Vehicle_Class);
  }

  // Make Column data processed
  let uniqueMakeArray = rowData.Make.reduce(function (prev, cur) {
    prev[cur] = (prev[cur] || 0) + 1;
    return prev;
  }, {});

  let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

  let make_UNIFORMITY = "Yes";
  let make_DUPLICATES = "No";
  let make_MISSING_VALUES = "No";
  let make_OUTLIERS = "No";

  for (let key in uniqueMakeArray) {
    if (key == "") {
      make_MISSING_VALUES = "Yes";
    }

    if (uniqueMakeArray[key] > 1) {
      make_DUPLICATES = "Yes";
    }

    if (format.test(key)) {
      make_OUTLIERS = "Yes";
    }

    if (typeof key != "string") {
      make_UNIFORMITY = "No";
    }
  }

  // Model Column data processed

  let model_UNIFORMITY = "Yes";
  let model_DUPLICATES = "No";
  let model_MISSING_VALUES = "No";
  let model_OUTLIERS = "No";

  let uniqueModelArray = rowData.Model.reduce(function (prev, cur) {
    prev[cur] = (prev[cur] || 0) + 1;
    return prev;
  }, {});

  for (let key in uniqueModelArray) {
    if (key == "") {
      model_MISSING_VALUES = "Yes";
    }

    if (uniqueModelArray[key] > 1) {
      model_DUPLICATES = "Yes";
    }

    if (format.test(uniqueModelArray[key])) {
      model_OUTLIERS = "Yes";
    }

    if (typeof key != "string") {
      model_UNIFORMITY = "No";
    }
  }
  // Vehicle Class Column data processed

  let vehicle_UNIFORMITY = "Yes";
  let vehicle_DUPLICATES = "No";
  let vehicle_MISSING_VALUES = "No";
  let vehicle_OUTLIERS = "No";

  let uniqueVehicle_ClassArray = rowData.Vehicle_Class.reduce(function (
    prev,
    cur
  ) {
    prev[cur] = (prev[cur] || 0) + 1;
    return prev;
  },
  {});

  for (let key in uniqueVehicle_ClassArray) {
    if (key == "") {
      vehicle_MISSING_VALUES = "Yes";
    }

    if (uniqueVehicle_ClassArray[key] > 1) {
      vehicle_DUPLICATES = "Yes";
    }

    if (format.test(uniqueVehicle_ClassArray[key])) {
      vehicle_OUTLIERS = "Yes";
    }

    if (typeof key != "string") {
      vehicle_UNIFORMITY = "No";
    }
  }

  return {
    Make: {
      UNIFORMITY: make_UNIFORMITY,
      DUPLICATES: make_DUPLICATES,
      MISSING_VALUES: make_MISSING_VALUES,
      OUTLIERS: make_OUTLIERS,
      data: uniqueMakeArray,
    },
    Model: {
      UNIFORMITY: model_UNIFORMITY,
      DUPLICATES: model_DUPLICATES,
      MISSING_VALUES: model_MISSING_VALUES,
      OUTLIERS: model_OUTLIERS,
      data: uniqueModelArray,
    },
    Vehicle_Class: {
      UNIFORMITY: vehicle_UNIFORMITY,
      DUPLICATES: vehicle_DUPLICATES,
      MISSING_VALUES: vehicle_MISSING_VALUES,
      OUTLIERS: vehicle_OUTLIERS,
      data: uniqueVehicle_ClassArray,
    },
  };
}

app.listen(3005, () => {
  console.log(`app is running on http://localhost:3005`);
});

module.exports = app;
