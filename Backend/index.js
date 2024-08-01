const express = require("express");
const app = express();
const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
app.use(express.json());
app.use(cors({ origin: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/certficates")
  .then(() => console.log("Database connection successful"))
  .catch((err) => console.error("Database connection error:", err));

// Define Mongoose schema
const schema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  fileName: { type: String },
});

const pdfSchema = mongoose.model("certificatelists", schema);
const port = 6257;
const certificatesDir = path.join(__dirname, "uploads");

// Create PDF function
async function createPdf(name) {
  const pdfPath = path.join(__dirname, "cert.pdf");
  const existingPdfBytes = await fs.readFile(pdfPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  firstPage.drawText(`${name}`, {
    x: 315,
    y: height / 2,
    size: 45,
    font: helveticaFont,
    color: rgb(0, 0, 0),
    rotate: degrees(0),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Save PDF to disk function
async function savePdf(name, pdfBytes) {
  const fileName = `${name}.pdf`;
  const savePath = path.join(certificatesDir, fileName);
  await fs.writeFile(savePath, pdfBytes);
  return fileName; // Return only the filename
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Destination directory:", certificatesDir); // Log destination directory
    cb(null, certificatesDir); // Correct path for saving uploads
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log("Uploaded file info:", file); // Log file info
    cb(null, uniqueName); // Use unique name
  },
});

const upload = multer({ storage });

// Route to create and store PDF document
app.post("/create-document", upload.single("pdfTemplate"), async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are required" });
  }

  try {
    const pdfBytes = await createPdf(name);
    const fileName = await savePdf(name, pdfBytes);

    // Save only the filename, not the full path
    const certificate = new pdfSchema({ name, email, fileName });
    const savedCertificate = await certificate.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error creating document:", error); // Better error handling
    res.status(500).json({ error: "Failed to create document" });
  }
});

// Route to fetch PDF by ID
app.get("/show_pdf/:id", async (req, res) => {
  const id = req.params.id; // Extract the ID
  console.log("Requested ID:", id); // Log the ID

  try {
    const certificate = await pdfSchema.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const fileName = certificate.fileName;
    const filePath = path.join("uploads", fileName); // Simplified path

    res.sendFile(filePath, { root: __dirname }); // Use root option to resolve path
  } catch (error) {
    console.error("Error fetching the PDF:", error); // Log the error
    res.status(500).json({ error: "An error occurred while fetching the PDF" });
  }
});

// Start the server
app.listen(port, () => console.log(`Listening on port ${port}!`));
