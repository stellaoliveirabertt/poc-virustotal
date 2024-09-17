const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const apiKey = "YOUR_API_KEY";
const filePath =
  "/Users/stellaoliveira/Downloads/Blue Geometric Technology Software Company (1).png";
const virusTotalScanUrl = "https://www.virustotal.com/vtapi/v2/file/scan";
const virusTotalReportUrl = "https://www.virustotal.com/vtapi/v2/file/report";

async function uploadFileToVirusTotal() {
  const form = new FormData();
  form.append("apikey", apiKey);
  form.append("file", fs.createReadStream(filePath));

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
      //   console.log("Detalhes dos scans:", scans);
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
    const startTime = Date.now();

    const scan_id = await uploadFileToVirusTotal();

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
