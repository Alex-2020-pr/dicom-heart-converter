import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileImage, Download, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { PacsConfig, WorklistPatient, convertAndSend, getDownloadUrl } from "@/lib/api";
import { mockConvertAndSend } from "@/lib/mockApi";
import { useLogStore } from "@/lib/logStore";
import { motion } from "framer-motion";

interface ConvertPanelProps {
  patient: WorklistPatient | null;
  sendConfig: PacsConfig;
  demoMode: boolean;
}

export default function ConvertPanel({ patient, sendConfig, demoMode }: ConvertPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "converting" | "success" | "error">("idle");
  const [resultMsg, setResultMsg] = useState("");
  const [dicomFilename, setDicomFilename] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const addLog = useLogStore((s) => s.addLog);

  const handleFile = (f: File) => {
    setFile(f);
    setStatus("idle");
    setDicomFilename(null);
    addLog("info", "UPLOAD", `Arquivo selecionado: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleConvert = async (shouldSend: boolean) => {
    if (!file || !patient) return;
    setStatus("converting");
    setResultMsg(shouldSend ? "Convertendo e enviando para PACS..." : "Convertendo para DICOM...");
    try {
      const result = demoMode
        ? await mockConvertAndSend(file, patient, sendConfig, shouldSend)
        : await convertAndSend(file, patient, sendConfig, shouldSend);
      setStatus(result.success ? "success" : "error");
      setResultMsg(result.message);
      if (result.filename) setDicomFilename(result.filename);
    } catch {
      setStatus("error");
      const msg = "Erro ao converter. Verifique o backend.";
      setResultMsg(msg);
      addLog("error", "CONVERT", msg);
    }
  };

  const isReady = file && patient;
  const acceptTypes = ".jpg,.jpeg,.png,.pdf";

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg gradient-primary text-primary-foreground"><FileImage className="h-5 w-5" /></div>
        <div>
          <h3 className="font-semibold text-lg text-foreground">Converter & Enviar</h3>
          {patient ? (
            <p className="text-xs text-muted-foreground">Paciente: <span className="font-medium text-foreground">{patient.patientName}</span></p>
          ) : (
            <p className="text-xs text-muted-foreground">Selecione um paciente no worklist</p>
          )}
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-4 ${
          dragOver ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-card" />
            <p className="text-sm font-medium text-foreground">{file?.name}</p>
          </div>
        ) : file ? (
          <div className="space-y-2">
            <FileImage className="h-12 w-12 mx-auto text-primary" />
            <p className="text-sm font-medium text-foreground">{file.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Arraste uma imagem ou PDF aqui</p>
            <p className="text-xs text-muted-foreground">JPG, PNG ou PDF</p>
          </div>
        )}
        <input
          type="file"
          accept={acceptTypes}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex gap-3 mb-4">
        <Button onClick={() => handleConvert(false)} disabled={!isReady || status === "converting"} variant="outline" className="flex-1 gap-2">
          {status === "converting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Converter (Download)
        </Button>
        <Button onClick={() => handleConvert(true)} disabled={!isReady || status === "converting"} className="flex-1 gap-2 gradient-primary text-primary-foreground border-0">
          {status === "converting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Converter & Enviar
        </Button>
      </div>

      {status !== "idle" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {status === "converting" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {status === "success" && <CheckCircle2 className="h-4 w-4 text-success" />}
          {status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
          <span className="text-sm">{resultMsg}</span>
        </motion.div>
      )}

      {dicomFilename && status === "success" && !demoMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
          <a href={getDownloadUrl(dicomFilename)} download className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <Download className="h-4 w-4" />
            Baixar arquivo DICOM ({dicomFilename})
          </a>
        </motion.div>
      )}
    </Card>
  );
}
