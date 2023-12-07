const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

// Set up file store using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Store uploaded file details
let uploadedFiles = [];

// Load previously uploaded files from file (if any)
try {
  const fileContents = fs.readFileSync("uploadedFiles.json", "utf-8");
  uploadedFiles = JSON.parse(fileContents);
} catch (error) {
  console.error("Error reading file:", error);
}

app.use(express.static("public"));

// File upload endpoint
app.post("/upload", upload.single("csvFile"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  // Check if a file with the same name or size already exists
  const existingFileIndex = uploadedFiles.findIndex(
    (existingFile) =>
      existingFile.name === file.originalname || existingFile.size === file.size
  );

  if (existingFileIndex !== -1) {
    // Replace the existing file or ignore (modify this based on your requirement)
    uploadedFiles[existingFileIndex] = {
      name: file.originalname,
      path: file.path,
    };
  } else {
    // Save file details
    uploadedFiles.push({ name: file.originalname, path: file.path });
  }
  // Save the updated file list to file
  fs.writeFileSync("uploadedFiles.json", JSON.stringify(uploadedFiles));

  res.status(200).send("File uploaded successfully.");
});

// List uploaded files endpoint
app.get("/files", (req, res) => {
  res.json(uploadedFiles);
});

// Read CSV data endpoint
app.get("/data/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = `uploads/${filename}`;

  // Read CSV file and send data
  const rows = [];
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => rows.push(row))
    .on("end", () => {
      console.log("CSV data read successfully."); // Log this line
      res.json(rows);
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
