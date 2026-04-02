import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2, Server } from "lucide-react";
import { PacsConfig, testConnection } from "@/lib/api";
import { mockTestConnection } from "@/lib/mockApi";
import { useLogStore } from "@/lib/logStore";
// motion removed to avoid React DOM insertion bug

interface ConfigPanelProps {
  title: string;
  icon: React.ReactNode;
  config: PacsConfig;
  onChange: (config: PacsConfig) => void;
  demoMode: boolean;
}

export default function ConfigPanel({ title, icon, config, onChange, demoMode }: ConfigPanelProps) {
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const addLog = useLogStore((s) => s.addLog);

  const handleTest = async () => {
    setStatus("testing");
    setStatusMsg("Testando conexão...");
    addLog("info", title, `Iniciando teste de comunicação com ${config.aeTitle}@${config.ip}:${config.port}`);
    try {
      const result = demoMode
        ? await mockTestConnection(config)
        : await testConnection(config);
      setStatus(result.success ? "success" : "error");
      setStatusMsg(result.message);
    } catch {
      setStatus("error");
      const msg = "Erro de conexão com o backend. Verifique se o servidor está rodando.";
      setStatusMsg(msg);
      addLog("error", title, msg);
    }
  };

  const statusBadge = {
    idle: null,
    testing: <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Testando</Badge>,
    success: <Badge className="gap-1 bg-success text-success-foreground"><Wifi className="h-3 w-3" />Conectado</Badge>,
    error: <Badge variant="destructive" className="gap-1"><WifiOff className="h-3 w-3" />Falha</Badge>,
  };

  return (
    <div>
      <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary text-primary-foreground">{icon}</div>
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          </div>
          {statusBadge[status]}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">AE Title</Label>
            <Input value={config.aeTitle} onChange={(e) => onChange({ ...config, aeTitle: e.target.value })} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">IP</Label>
            <Input value={config.ip} onChange={(e) => onChange({ ...config, ip: e.target.value })} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Porta</Label>
            <Input type="number" value={config.port} onChange={(e) => onChange({ ...config, port: Number(e.target.value) })} className="font-mono text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button onClick={handleTest} disabled={status === "testing"} variant="outline" className="gap-2">
            {status === "testing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
            Testar Comunicação
          </Button>
          {statusMsg && <span className="text-xs text-muted-foreground max-w-[50%] truncate">{statusMsg}</span>}
        </div>
      </Card>
    </div>
  );
}
