import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  show: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => {
          const Icon =
            t.kind === "success" ? CheckCircle2 : t.kind === "error" ? XCircle : Info;
          const tone =
            t.kind === "success"
              ? "text-emerald-700"
              : t.kind === "error"
                ? "text-red-600"
                : "text-brown";
          return (
            <div
              key={t.id}
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_12px_40px_rgba(107,79,58,0.16)]"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} strokeWidth={2} />
              <p className="flex-1 text-sm leading-snug text-ink">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Tutup notifikasi"
                className="text-muted transition hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx;
}
