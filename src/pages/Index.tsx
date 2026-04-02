import { useState } from "react";
import { PacsConfig, WorklistPatient } from "@/lib/api";
import ConfigPanel from "@/components/ConfigPanel";
import WorklistPanel from "@/components/WorklistPanel";
import ConvertPanel from "@/components/ConvertPanel";
import LogPanel from "@/components/LogPanel";
import { Server, Send, Zap, Monitor, Cpu } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Index = () => {
  const [worklistConfig, setWorklistConfig] = useState<PacsConfig>({
    aeTitle: "WLTESTE",
    ip: "189.26.121.15",
    port: 11112,
  });

  const [sendConfig, setSendConfig] = useState<PacsConfig>({
    aeTitle: "TESTE",
    ip: "189.26.121.15",
    port: 11112,
  });

  const [selectedPatient, setSelectedPatient] = useState<WorklistPatient | null>(null);
  const [demoMode, setDemoMode] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero border-b">
        <div className="container max-w-6xl py-5">
          <div className="flex items-center justify-between">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20 backdrop-blur">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground tracking-tight">DICOM Converter</h1>
                <p className="text-sm text-primary-foreground/60">Converta imagens para DICOM e envie para PACS</p>
              </div>
            </motion.div>

            {/* Demo mode toggle */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                {demoMode ? <Monitor className="h-4 w-4 text-primary-foreground/80" /> : <Cpu className="h-4 w-4 text-primary-foreground/80" />}
                <Label className="text-primary-foreground/90 text-sm cursor-pointer">
                  {demoMode ? "Modo Demo" : "Modo Produção"}
                </Label>
              </div>
              <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              {demoMode && <Badge className="bg-warning text-warning-foreground text-[10px]">DEMO</Badge>}
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-8 space-y-6">
        {/* Demo notice */}
        {demoMode && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
            <Monitor className="h-4 w-4 text-warning shrink-0" />
            <span className="text-foreground/80">
              <strong>Modo Demo ativo</strong> — dados simulados, sem conexão real com PACS. Desative para usar com o backend Python.
            </span>
          </motion.div>
        )}

        {/* Config Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <ConfigPanel title="Worklist" icon={<Server className="h-5 w-5" />} config={worklistConfig} onChange={setWorklistConfig} demoMode={demoMode} />
          <ConfigPanel title="Envio de Exames" icon={<Send className="h-5 w-5" />} config={sendConfig} onChange={setSendConfig} demoMode={demoMode} />
        </div>

        {/* Worklist */}
        <WorklistPanel config={worklistConfig} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} demoMode={demoMode} />

        {/* Convert & Send */}
        <ConvertPanel patient={selectedPatient} sendConfig={sendConfig} demoMode={demoMode} />

        {/* Log Panel */}
        <LogPanel />
      </main>
    </div>
  );
};

export default Index;
