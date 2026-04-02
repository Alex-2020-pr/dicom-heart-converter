import { useState } from "react";
import { PacsConfig, WorklistPatient } from "@/lib/api";
import ConfigPanel from "@/components/ConfigPanel";
import WorklistPanel from "@/components/WorklistPanel";
import ConvertPanel from "@/components/ConvertPanel";
import { Server, Send, Zap } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero border-b">
        <div className="container max-w-6xl py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 backdrop-blur">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground tracking-tight">DICOM Converter</h1>
              <p className="text-sm text-primary-foreground/60">Converta imagens para DICOM e envie para PACS</p>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container max-w-6xl py-8 space-y-6">
        {/* Config Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <ConfigPanel
            title="Worklist"
            icon={<Server className="h-5 w-5" />}
            config={worklistConfig}
            onChange={setWorklistConfig}
          />
          <ConfigPanel
            title="Envio de Exames"
            icon={<Send className="h-5 w-5" />}
            config={sendConfig}
            onChange={setSendConfig}
          />
        </div>

        {/* Worklist */}
        <WorklistPanel
          config={worklistConfig}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
        />

        {/* Convert & Send */}
        <ConvertPanel patient={selectedPatient} sendConfig={sendConfig} />
      </main>
    </div>
  );
};

export default Index;
