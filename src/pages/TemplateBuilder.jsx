import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
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
import {
  IconPlus,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "../components/Input";
import { SectionLabel } from "../components/Card";
import { BuilderIllustration } from "../components/EmptyState";
import { useWindowWidth } from "../hooks/useWindowWidth";
import Button from "../components/Button";
import SortableSubitemRow from "../components/SortableSubitemRow";
import { useWorkspace } from "../context/WorkspaceContext";
import { useToast } from "../context/ToastContext";
import { templateApi } from "../api/client";
import { sanitizeInput } from "../lib/sanitize";
import { trackValueCreated } from "../lib/monday";

let _subId = 0;

export default function TemplateBuilder() {
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 640;
  const toast = useToast();
  const queryClient = useQueryClient();
  const { workspaceId, accountId } = useWorkspace();
  const queryId = workspaceId || accountId;

  const [prompt, setPrompt] = useState("");
  const [generationState, setGenerationState] = useState("idle"); // idle | loading | done
  const [subitems, setSubitems] = useState([]);
  const [templateName, setTemplateName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const generateMutation = useMutation({
    mutationFn: (p) => templateApi.generate(queryId, p),
    onMutate: () => setGenerationState("loading"),
    onSuccess: (data) => {
      const result = data?.ai_result ?? {};
      setTemplateName(result.template_name ?? "");
      setSubitems(
        (result.subitems ?? []).map((name) => ({ id: ++_subId, name })),
      );
      setGenerationState("done");
    },
    onError: (err) => {
      setGenerationState("idle");
      toast.error(err.message || "Failed to generate subitems");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      templateApi.create(queryId, {
        name: sanitizeInput(templateName),
        subitems: subitems
          .filter((s) => s.name.trim())
          .map((s, idx) => ({ name: sanitizeInput(s.name.trim()), sort_order: idx })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", queryId] });
      toast.success("Template created");
      setGenerationState("saved");
      trackValueCreated(); 
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create template");
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim() || !queryId) return;
    generateMutation.mutate(sanitizeInput(prompt.trim()));
  };

  const handleRegenerate = () => {
    if (!prompt.trim() || !queryId) return;
    generateMutation.mutate(sanitizeInput(prompt.trim()));
  };

  const hasValidSubitems = subitems.some((s) => s.name.trim() !== "");
  const isValid = templateName.trim() !== "" && hasValidSubitems;

  const handleConfirm = () => {
    if (!isValid) return;
    confirmMutation.mutate();
  };

  const handleReset = () => {
    setPrompt("");
    setSubitems([]);
    setTemplateName("");
    setGenerationState("idle");
  };

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setSubitems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const editSubitem = (id, name) => {
    setSubitems((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const deleteSubitem = (id) => {
    setSubitems((prev) => prev.filter((s) => s.id !== id));
  };

  const addSubitem = () => {
    setSubitems((prev) => [...prev, { id: ++_subId, name: "" }]);
  };

  const isGenerating = generationState === "loading";
  const hasResult = generationState === "done" || generationState === "saved";
  const isSaved = generationState === "saved";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ padding: isMobile ? "16px" : "20px 24px" }}
    >
      <div className="mb-5">
        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "var(--text-primary)",
            margin: "0 0 4px",
          }}
        >
          Template Builder
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Describe a task type and AI will generate a subitem checklist for it.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div className="flex flex-col gap-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create a social media campaign for a product launch"
            minHeight={120}
            disabled={isGenerating}
          />
          <Button
            onClick={handleGenerate}
            variant="primary"
            disabled={isGenerating || !prompt.trim() || !queryId}
            fullWidth
          >
            {isGenerating && <IconLoader2 size={14} className="animate-spin" />}
            {isGenerating ? "Generating..." : "Generate subitems"}
          </Button>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              textAlign: "center",
              margin: 0,
            }}
          >
            Powered by Groq AI. Uses your workspace AI credits.
          </p>
        </div>

        {/* Right column */}
        <div style={{ position: "relative" }}>
          <AnimatePresence mode="wait">
            {generationState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-16 rounded-[10px]"
                style={{ border: "1px dashed var(--border)" }}
              >
                <BuilderIllustration />
                <p
                  className="mt-3 text-sm"
                  style={{ color: "var(--text-muted)", textAlign: "center" }}
                >
                  Your generated subitems will appear here
                </p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2 p-4 rounded-[10px]"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-shimmer rounded"
                    style={{ height: 36, borderRadius: 8 }}
                  />
                ))}
              </motion.div>
            )}

            {isSaved && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center text-center p-6 rounded-[10px]"
                style={{
                  backgroundColor: "var(--success-light)",
                  border: "1px solid rgba(15,155,110,0.2)",
                }}
              >
                <div
                  className="flex items-center justify-center mb-3"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "var(--success)",
                  }}
                >
                  <IconCheck size={20} color="#fff" />
                </div>
                <h3
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Template created successfully
                </h3>
                <p
                  className="text-xs mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  "{templateName}" - {subitems.filter((s) => s.name.trim()).length} subitems saved
                </p>
                <Button variant="secondary" onClick={handleReset}>
                  Build another template
                </Button>
              </motion.div>
            )}

            {hasResult && !isSaved && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-[10px] p-4"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
              {/* Template name */}
              {templateName && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
                    Template name
                  </p>
                  <input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <SectionLabel>Generated Subitems</SectionLabel>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={subitems.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2 mb-3">
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

              <button
                type="button"
                onClick={addSubitem}
                className="flex items-center gap-1.5 text-sm"
                style={{
                  color: "var(--accent)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                  fontFamily: "inherit",
                }}
              >
                <IconPlus size={14} />
                Add subitem
              </button>

              <div
                className="flex gap-2 mt-4"
                style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}
              >
                <Button
                  onClick={handleConfirm}
                  variant="primary"
                  fullWidth
                  disabled={
                    confirmMutation.isPending || !isValid
                  }
                >
                  {confirmMutation.isPending && (
                    <IconLoader2 size={14} className="animate-spin" />
                  )}
                  {confirmMutation.isPending ? "Creating..." : "Confirm & create template"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRegenerate}
                  disabled={isGenerating || confirmMutation.isPending}
                >
                  Regenerate
                </Button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
