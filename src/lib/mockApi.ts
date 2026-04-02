import { PacsConfig, WorklistPatient, DicomSendResult } from "./api";
import { useLogStore } from "./logStore";

const log = useLogStore.getState().addLog;

const MOCK_PATIENTS: WorklistPatient[] = [
  {
    patientName: "SILVA^MARIA",
    patientId: "PAT001",
    accessionNumber: "ACC2024001",
    studyDescription: "RAIO-X TORAX PA",
    modality: "CR",
    scheduledDate: "20260402",
    referringPhysician: "DR. CARLOS SOUZA",
  },
  {
    patientName: "OLIVEIRA^JOAO",
    patientId: "PAT002",
    accessionNumber: "ACC2024002",
    studyDescription: "ULTRASSONOGRAFIA ABDOMINAL",
    modality: "US",
    scheduledDate: "20260402",
    referringPhysician: "DRA. ANA LIMA",
  },
  {
    patientName: "SANTOS^PEDRO",
    patientId: "PAT003",
    accessionNumber: "ACC2024003",
    studyDescription: "TOMOGRAFIA CRANIO",
    modality: "CT",
    scheduledDate: "20260402",
    referringPhysician: "DR. MARCOS REIS",
  },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mockTestConnection(config: PacsConfig): Promise<{ success: boolean; message: string }> {
  log("info", "C-ECHO", `Enviando C-ECHO para ${config.aeTitle}@${config.ip}:${config.port}...`);
  await delay(1200);
  log("info", "C-ECHO", `Associação estabelecida com ${config.ip}:${config.port}`);
  await delay(500);
  log("success", "C-ECHO", `C-ECHO OK — Status: 0x0000 (Success)`);
  return { success: true, message: `C-ECHO OK com ${config.aeTitle}@${config.ip}:${config.port} (DEMO)` };
}

export async function mockQueryWorklist(config: PacsConfig): Promise<WorklistPatient[]> {
  log("info", "C-FIND", `Enviando C-FIND Worklist para ${config.aeTitle}@${config.ip}:${config.port}...`);
  await delay(800);
  log("info", "C-FIND", `Associação estabelecida. Consultando MWL SCP...`);
  await delay(600);
  for (const p of MOCK_PATIENTS) {
    log("info", "C-FIND", `Paciente encontrado: ${p.patientName} | ID: ${p.patientId} | ${p.studyDescription}`);
    await delay(200);
  }
  log("success", "C-FIND", `Worklist retornou ${MOCK_PATIENTS.length} paciente(s). Status: 0x0000`);
  return MOCK_PATIENTS;
}

export async function mockConvertAndSend(
  file: File,
  patient: WorklistPatient,
  sendConfig: PacsConfig,
  shouldSend: boolean
): Promise<DicomSendResult> {
  log("info", "CONVERT", `Iniciando conversão: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  await delay(500);
  log("info", "CONVERT", `Preenchendo tags DICOM — Patient: ${patient.patientName}, ID: ${patient.patientId}`);
  await delay(300);
  log("info", "CONVERT", `StudyInstanceUID: 1.2.826.0.1.${Date.now()}`);
  log("info", "CONVERT", `SeriesInstanceUID: 1.2.826.0.1.${Date.now() + 1}`);
  log("info", "CONVERT", `SOPInstanceUID: 1.2.826.0.1.${Date.now() + 2}`);
  await delay(400);
  log("info", "CONVERT", `Modality: ${patient.modality} | AccessionNumber: ${patient.accessionNumber}`);
  log("success", "CONVERT", `Arquivo DICOM gerado: ${file.name.replace(/\.\w+$/, ".dcm")}`);

  if (shouldSend) {
    await delay(300);
    log("info", "C-STORE", `Enviando DICOM para ${sendConfig.aeTitle}@${sendConfig.ip}:${sendConfig.port}...`);
    await delay(800);
    log("info", "C-STORE", `Associação estabelecida. Enviando C-STORE...`);
    await delay(600);
    log("success", "C-STORE", `C-STORE concluído — Status: 0x0000 (Success)`);
    return {
      success: true,
      message: `DICOM convertido e enviado para ${sendConfig.aeTitle}@${sendConfig.ip}:${sendConfig.port} (DEMO)`,
      filename: "demo_" + file.name.replace(/\.\w+$/, ".dcm"),
    };
  }

  return {
    success: true,
    message: "DICOM convertido com sucesso! (DEMO)",
    filename: "demo_" + file.name.replace(/\.\w+$/, ".dcm"),
  };
}
