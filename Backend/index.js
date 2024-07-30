const express = require("express");
const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
const port = 6257;

app.use(express.json());
app.use(cors());

const certificatesDir = path.join(__dirname, "saved_pdfs");

async function createOrModifyPdf(name) {
  const pdfPath = path.join(__dirname, "cert.pdf");
  const existingPdfBytes = await fs.readFile(pdfPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  firstPage.drawText(`${name}`, {
    x: 310,
    y: height / 2,
    size: 45,
    font: helveticaFont,
    color: rgb(0, 0, 0),
    rotate: degrees(0),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

async function savePdf(name, pdfBytes, type) {
  const savePath = path.join(certificatesDir, `${name}_certificate.pdf`);
  await fs.writeFile(savePath, pdfBytes);
}

app.post("/create-document", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const pdfBytes = await createOrModifyPdf(name);
    await savePdf(name, pdfBytes, "created");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${name}_certificate.pdf`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: "An error occurred while creating the PDF" });
  }
});

app.get("/show_pdf", (req, res) => {
  res.sendFile(path.join(certificatesDir, "John sechsd_certificate.pdf"));
});

// app.post("/modify-document", async (req, res) => {
//   const { name } = req.body;

//   if (!name) {
//     return res.status(400).json({ error: "Name is required" });
//   }

//   try {
//     const pdfBytes = await createOrModifyPdf(name);
//     await fs.mkdir(certificatesDir, { recursive: true });
//     await savePdf(name, pdfBytes, "modified");
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${name}-modified-certificate.pdf`
//     );
//     res.send(Buffer.from(pdfBytes));
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "An error occurred while modifying the PDF" });
//   }
// });

app.listen(port, () => console.log(`Listening on port ${port}!`));
