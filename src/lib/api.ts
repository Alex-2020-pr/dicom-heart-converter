const API_BASE = "http://localhost:8000";

export interface PacsConfig {
  aeTitle: string;
  ip: string;
  port: number;
}

export interface WorklistPatient {
  patientName: string;
  patientId: string;
  accessionNumber: string;
  studyDescription: string;
  modality: string;
  scheduledDate: string;
  referringPhysician: string;
}

export interface DicomSendResult {
  success: boolean;
  message: string;
  filename?: string;
}

export async function testConnection(config: PacsConfig): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/test-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ae_title: config.aeTitle,
      ip: config.ip,
      port: config.port,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ${res.status}: ${text}`);
  }
  return res.json();
}

export async function queryWorklist(config: PacsConfig): Promise<WorklistPatient[]> {
  const res = await fetch(`${API_BASE}/query-worklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ae_title: config.aeTitle,
      ip: config.ip,
      port: config.port,
    }),
  });
  const data = await res.json();
  return data.patients || [];
}

export async function convertAndSend(
  file: File,
  patient: WorklistPatient,
  sendConfig: PacsConfig,
  shouldSend: boolean
): Promise<DicomSendResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("patient_name", patient.patientName);
  formData.append("patient_id", patient.patientId);
  formData.append("accession_number", patient.accessionNumber);
  formData.append("study_description", patient.studyDescription);
  formData.append("modality", patient.modality);
  formData.append("referring_physician", patient.referringPhysician);
  formData.append("send_to_pacs", String(shouldSend));
  formData.append("ae_title", sendConfig.aeTitle);
  formData.append("ip", sendConfig.ip);
  formData.append("port", String(sendConfig.port));

  const res = await fetch(`${API_BASE}/convert`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export function getDownloadUrl(filename: string): string {
  return `${API_BASE}/download/${filename}`;
}
