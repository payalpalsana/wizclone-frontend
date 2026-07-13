import { motion, AnimatePresence } from "framer-motion";
import { IconTrash, IconX } from "@tabler/icons-react";
import Button from "./Button";

export default function DeleteConfirmModal({ open, templateName, isDeleting, onConfirm, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
            onClick={isDeleting ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-1/2 z-[60] w-[95%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    backgroundColor: "var(--danger-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <IconTrash size={16} style={{ color: "var(--danger)" }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Delete template
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <p className="text-sm text-[var(--text-secondary)]">
                Are you sure you want to delete{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  "{templateName}"
                </span>
                ? All associated subitems will be permanently removed.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
              <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm} loading={isDeleting} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete template"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
