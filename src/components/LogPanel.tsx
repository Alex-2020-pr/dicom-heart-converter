import { useLogStore, LogEntry } from "@/lib/logStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Trash2, Info, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
// motion/AnimatePresence removed to avoid React DOM bug

const typeIcon: Record<LogEntry["type"], React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5 text-accent" />,
  success: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  error: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,
};

const typeBg: Record<LogEntry["type"], string> = {
  info: "",
  success: "bg-success/5",
  error: "bg-destructive/5",
  warning: "bg-warning/5",
};

function formatTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function LogPanel() {
  const logs = useLogStore((s) => s.logs);
  const clearLogs = useLogStore((s) => s.clearLogs);

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md gradient-primary text-primary-foreground">
            <Terminal className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">Log de Atividades</h3>
          <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={clearLogs} className="gap-1.5 text-xs text-muted-foreground">
          <Trash2 className="h-3.5 w-3.5" />
          Limpar
        </Button>
      </div>

      <ScrollArea className="h-64">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground py-12">
            Nenhuma atividade registrada
          </div>
        ) : (
          <div className="divide-y divide-border/50">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2.5 px-5 py-2 text-xs ${typeBg[log.type]}`}
                >
                  <span className="mt-0.5 shrink-0">{typeIcon[log.type]}</span>
                  <span className="text-muted-foreground font-mono shrink-0">{formatTime(log.timestamp)}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-mono">{log.source}</Badge>
                  <span className="text-foreground/80 break-all">{log.message}</span>
                </div>
              ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
