import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++_id;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2"
        style={{ width: 320 }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 rounded-[10px] p-4 shadow-lg"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderLeftWidth: 3,
                borderLeftColor:
                  t.type === "success"
                    ? "var(--success)"
                    : t.type === "error"
                      ? "var(--danger)"
                      : "var(--accent)",
              }}
            >
              <p
                className="flex-1 text-sm"
                style={{ color: "var(--text-primary)", margin: 0 }}
              >
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 mt-0.5"
                style={{
                  color: "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <IconX size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
