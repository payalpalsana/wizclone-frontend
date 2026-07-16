import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import { IconLoader2, IconPlus, IconX } from "@tabler/icons-react";

import Button from "./Button";
import SortableSubitemRow from "./SortableSubitemRow";
import Input from "./Input";
import { sanitizeInput } from "../lib/sanitize";
import { trackValueCreated } from "../lib/monday";

let _id = 0;

export default function CreateTemplateModal({ open, onClose, onSubmit, isSubmitting }) {
  const [templateName, setTemplateName] = useState("");
  const [subitems, setSubitems] = useState([{ id: ++_id, name: "" }]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTemplateName("");
      setSubitems([{ id: ++_id, name: "" }]);
    }
  }, [open]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addSubitem = () => {
    setSubitems((prev) => [
      ...prev,
      {
        id: ++_id,
        name: "",
      },
    ]);
  };

  const editSubitem = (id, value) => {
    setSubitems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: value } : item)),
    );
  };

  const deleteSubitem = (id) => {
    setSubitems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setSubitems((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);

      const newIndex = items.findIndex((i) => i.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleCreate = () => {
    const payload = {
      name: sanitizeInput(templateName),
      subitems: subitems
        .map((s) => ({ ...s, name: sanitizeInput(s.name) }))
        .filter((s) => s.name.trim()),
    };
    trackValueCreated(); // Fire monday value-created event
    onSubmit?.(payload);
  };

  const hasValidSubitems = subitems.some((s) => s.name.trim() !== "");
  const isValid = templateName.trim() !== "" && hasValidSubitems;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-1/2 z-[60] w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Create Template
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Create a reusable subitems template.
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5 px-5 py-5">
              {/* Template Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Template Name
                </label>

                <Input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Social Media Campaign"
                />
              </div>

              {/* Subitems */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--text-primary)]">
                    Subitems
                  </label>

                  <Button variant="ghost" onClick={addSubitem}>
                    <IconPlus size={14} />
                    Add subitem
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={subitems.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {subitems.map((item) => (
                        <SortableSubitemRow
                          key={item.id}
                          item={item}
                          onEdit={editSubitem}
                          onDelete={deleteSubitem}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting && <IconLoader2 size={13} className="animate-spin" />}
                {isSubmitting ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
