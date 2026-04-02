import { create } from "zustand";

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "warning";
  source: string;
  message: string;
}

interface LogStore {
  logs: LogEntry[];
  addLog: (type: LogEntry["type"], source: string, message: string) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (type, source, message) =>
    set((state) => ({
      logs: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          type,
          source,
          message,
        },
        ...state.logs,
      ].slice(0, 200),
    })),
  clearLogs: () => set({ logs: [] }),
}));
