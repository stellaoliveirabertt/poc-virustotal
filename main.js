const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");

const apiKey = "YOUR_API_KEY";
const filePath = "FILE_PATH";
const compressedFilePath = "FILE_PATH_COMPRESSED";
const virusTotalScanUrl = "https://www.virustotal.com/vtapi/v2/file/scan";
const virusTotalReportUrl = "https://www.virustotal.com/vtapi/v2/file/report";

async function compressImage(inputPath, outputPath, maxSizeKB) {
  let quality = 80;
  let fileSizeInKB = Infinity;

  while (fileSizeInKB > maxSizeKB) {
    await sharp(inputPath).jpeg({ quality }).toFile(outputPath);

    const stats = fs.statSync(outputPath);
    fileSizeInKB = stats.size / 1024;

    quality -= 5;
    if (quality < 10) break;
  }

  console.log(
    `Imagem comprimida para ${fileSizeInKB.toFixed(2)} KB com qualidade ${
      quality + 5
    }`
  );
}

async function compressPDF(inputPath, outputPath, maxSizeKB) {
  const existingPdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

  fs.writeFileSync(outputPath, pdfBytes);

  const stats = fs.statSync(outputPath);
  const fileSizeInKB = stats.size / 1024;

  console.log(`PDF comprimido para ${fileSizeInKB.toFixed(2)} KB`);
}

async function compressFileIfNeeded(inputPath, outputPath, maxSizeKB) {
  const stats = fs.statSync(inputPath);
  const fileSizeInKB = stats.size / 1024;

  if (fileSizeInKB <= maxSizeKB) {
    console.log(
      `O arquivo já está abaixo de ${maxSizeKB} KB (${fileSizeInKB.toFixed(
        2
      )} KB). Não é necessário comprimir.`
    );
    return inputPath;
  }

  const extension = path.extname(inputPath).toLowerCase();
  const outputFilePath = `${outputPath}${extension}`;

  if ([".jpg", ".jpeg", ".png"].includes(extension)) {
    await compressImage(inputPath, outputFilePath, maxSizeKB);
  } else if (extension === ".pdf") {
    await compressPDF(inputPath, outputFilePath, maxSizeKB);
  } else {
    console.log("Tipo de arquivo não suportado para compressão.");
    return inputPath;
  }

  return outputFilePath;
}

async function uploadFileToVirusTotal(filePathToUpload) {
  const form = new FormData();
  form.append("apikey", apiKey);
  form.append("file", fs.createReadStream(filePathToUpload));

  try {
    const response = await axios.post(virusTotalScanUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const { scan_id } = response.data;
    console.log(`Arquivo enviado. scan_id: ${scan_id}`);
    return scan_id;
  } catch (error) {
    console.error("Erro ao enviar o arquivo:", error);
    throw error;
  }
}

async function checkFileScanStatus(scan_id) {
  try {
    const response = await axios.get(virusTotalReportUrl, {
      params: {
        apikey: apiKey,
        resource: scan_id,
      },
    });

    const { response_code, scans, positives } = response.data;

    if (response_code === 1) {
      console.log("Análise concluída! Detecções:", positives);
      return true;
    } else {
      console.log(
        "Análise ainda não concluída. Tentando novamente em 30 segundos..."
      );
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar o status do arquivo:", error);
    throw error;
  }
}

function formatElapsedTime(startTime, endTime) {
  const elapsedMilliseconds = endTime - startTime;
  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${minutes} minutos e ${seconds} segundos`;
}

async function runVirusTotalPOC() {
  try {
    const filePathToUpload = await compressFileIfNeeded(
      filePath,
      compressedFilePath,
      400
    );

    const startTime = Date.now();
    const scan_id = await uploadFileToVirusTotal(filePathToUpload);
    let scanCompleted = false;
    while (!scanCompleted) {
      scanCompleted = await checkFileScanStatus(scan_id);
      if (!scanCompleted) {
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }
    const endTime = Date.now();
    const elapsedTime = formatElapsedTime(startTime, endTime);
    console.log(
      `Processo de verificação concluído! Tempo total: ${elapsedTime}`
    );
  } catch (error) {
    console.error("Erro no processo de verificação:", error);
  }
}

runVirusTotalPOC();
