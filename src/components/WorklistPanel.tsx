import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, UserCheck, RefreshCw } from "lucide-react";
import { PacsConfig, WorklistPatient, queryWorklist } from "@/lib/api";
import { mockQueryWorklist } from "@/lib/mockApi";
import { useLogStore } from "@/lib/logStore";
// motion/AnimatePresence removed to avoid React DOM bug

interface WorklistPanelProps {
  config: PacsConfig;
  selectedPatient: WorklistPatient | null;
  onSelectPatient: (p: WorklistPatient) => void;
  demoMode: boolean;
}

export default function WorklistPanel({ config, selectedPatient, onSelectPatient, demoMode }: WorklistPanelProps) {
  const [patients, setPatients] = useState<WorklistPatient[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const addLog = useLogStore((s) => s.addLog);

  const handleQuery = async () => {
    setStatus("loading");
    setStatusMsg(`Consultando ${config.aeTitle}@${config.ip}:${config.port}...`);
    try {
      const result = demoMode
        ? await mockQueryWorklist(config)
        : await queryWorklist(config);
      setPatients(result);
      setStatus("success");
      setStatusMsg(`${result.length} paciente(s) encontrado(s)`);
    } catch {
      setStatus("error");
      const msg = "Erro ao consultar worklist. Verifique o backend.";
      setStatusMsg(msg);
      addLog("error", "C-FIND", msg);
    }
  };

  const statusBadge = {
    idle: <Badge variant="secondary">Aguardando</Badge>,
    loading: <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Consultando</Badge>,
    success: <Badge className="bg-success text-success-foreground gap-1"><UserCheck className="h-3 w-3" />{statusMsg}</Badge>,
    error: <Badge variant="destructive">{statusMsg}</Badge>,
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-primary text-primary-foreground"><Search className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Worklist - Pacientes</h3>
            <p className="text-xs text-muted-foreground font-mono">{config.aeTitle}@{config.ip}:{config.port}</p>
          </div>
        </div>
        {statusBadge[status]}
      </div>

      <Button onClick={handleQuery} disabled={status === "loading"} className="mb-4 gap-2 gradient-primary text-primary-foreground border-0">
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Consultar Worklist
      </Button>

      <AnimatePresence>
        {patients.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Paciente</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Exame</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p, i) => (
                  <TableRow
                    key={i}
                    className={`cursor-pointer transition-colors ${
                      selectedPatient?.patientId === p.patientId ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                    onClick={() => {
                      onSelectPatient(p);
                      addLog("info", "WORKLIST", `Paciente selecionado: ${p.patientName} (${p.patientId})`);
                    }}
                  >
                    <TableCell className="font-medium">{p.patientName}</TableCell>
                    <TableCell className="font-mono text-xs">{p.patientId}</TableCell>
                    <TableCell>{p.studyDescription}</TableCell>
                    <TableCell><Badge variant="outline">{p.modality}</Badge></TableCell>
                    <TableCell className="text-sm">{p.scheduledDate}</TableCell>
                    <TableCell>
                      {selectedPatient?.patientId === p.patientId && (
                        <Badge className="bg-primary text-primary-foreground">Selecionado</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
