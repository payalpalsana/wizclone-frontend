import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { motion } from "framer-motion";
import SortableSubitemRow from "./SortableSubitemRow";

// Subitem IDs from the DB are UUID strings.
// Locally-added subitems get a numeric temp id (Date.now() + random).
// When building the API payload, only include `id` if it's a UUID string.
const isDbId = (id) => typeof id === "string" && id.length > 20;

const TemplateEditor = ({ template, onSave, onCancel }) => {
  const [name,    setName]    = useState(template.name);
  const [subitems, setSubitems] = useState(template.subitems.map((s) => ({ ...s })));
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const editSub   = (id, val) =>
    setSubitems((prev) => prev.map((s) => (s.id === id ? { ...s, name: val } : s)));
  const deleteSub = (id) =>
    setSubitems((prev) => prev.filter((s) => s.id !== id));
  const addSub    = () =>
    setSubitems((prev) => [...prev, { id: Date.now() + Math.random(), name: "" }]);

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setSubitems((items) => {
        const oi = items.findIndex((i) => i.id === active.id);
        const ni = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oi, ni);
      });
    }
  };

  const hasValidSubitems = subitems.some((s) => s.name.trim() !== "");
  const isValid = name.trim() !== "" && hasValidSubitems;

  const handleSave = async () => {
    if (!isValid) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        subitems: subitems
          .filter((s) => s.name.trim())
          .map((s, idx) => ({
            ...(isDbId(s.id) ? { id: s.id } : {}), // only send DB UUIDs
            name:       s.name.trim(),
            sort_order: idx,
          })),
      };
      await onSave(payload.name, payload.subitems);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ overflow: "hidden" }}
    >
      <div
        className="p-4"
        style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-secondary)" }}
      >
        {/* Template name */}
        <div className="mb-4">
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Template name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. New Client Onboarding"
            style={{
              width: "100%", height: 36, fontSize: 14,
              borderRadius: 8, border: "1px solid var(--border)",
              backgroundColor: "var(--bg-primary)", color: "var(--text-primary)",
              padding: "0 12px", outline: "none", fontFamily: "inherit",
              transition: "border-color 120ms, box-shadow 120ms", fontWeight: 500,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow = "0 0 0 3px rgba(108,71,255,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Subitems */}
        <div className="mb-4">
          <label
            className="block text-xs font-medium mb-2"
            style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Subitems ({subitems.length})
          </label>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={subitems.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {subitems.map((item) => (
                  <SortableSubitemRow key={item.id} item={item} onEdit={editSub} onDelete={deleteSub} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={addSub}
            className="flex items-center gap-1.5 mt-2 text-sm"
            style={{ color: "var(--accent)", border: "none", background: "none", cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}
          >
            <IconPlus size={13} />
            Add subitem
          </button>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 8 }}>{error}</p>
        )}

        {/* Actions */}
        <div
          className="flex items-center gap-2 justify-end"
          style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              height: 34, paddingInline: 14, borderRadius: 8,
              border: "1px solid var(--border)", backgroundColor: "transparent",
              color: "var(--text-primary)", fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isValid}
            style={{
              height: 34, paddingInline: 14, borderRadius: 8, border: "none",
              backgroundColor: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 500,
              cursor: saving || !isValid ? "not-allowed" : "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
              opacity: !isValid ? 0.6 : 1,
            }}
          >
            {saving && <IconLoader2 size={13} className="animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateEditor;
