import { useState } from "react";
import { motion } from "framer-motion";
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
  IconExternalLink,
} from "@tabler/icons-react";
import { Textarea } from "../components/Input";
import { SectionLabel } from "../components/Card";
import { BuilderIllustration } from "../components/EmptyState";
import { useWindowWidth } from "../hooks/useWindowWidth";
import Button from "../components/Button";
import SortableSubitemRow from "../components/SortableSubitemRow";

let _subId = 0;

const MOCK_SUBITEMS = [
  "Define target audience and goals",
  "Create content calendar",
  "Design visual assets",
  "Write copy for all platforms",
  "Schedule and publish posts",
  "Monitor engagement and analytics",
  "Compile performance report",
];

export default function TemplateBuilder() {
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 640;

  const [prompt, setPrompt] = useState("");
  const [generationState, setGenerationState] = useState("idle");
  const [subitems, setSubitems] = useState([]);
  const [confirmState, setConfirmState] = useState("idle");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerationState("loading");
    await new Promise((r) => setTimeout(r, 1800));
    setSubitems(MOCK_SUBITEMS.map((name) => ({ id: ++_subId, name })));
    setGenerationState("done");
  };

  const handleRegenerate = async () => {
    setGenerationState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setSubitems(
      MOCK_SUBITEMS.slice(0, 5)
        .reverse()
        .map((name) => ({ id: ++_subId, name })),
    );
    setGenerationState("done");
  };

  const handleConfirm = async () => {
    setConfirmState("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setConfirmState("done");
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
            disabled={generationState === "loading"}
          />
          <Button
            onClick={handleGenerate}
            variant="primary"
            disabled={generationState === "loading" || !prompt.trim()}
            fullWidth
          >
            {generationState === "loading" && (
              <IconLoader2 size={14} className="animate-spin" />
            )}
            {generationState === "loading"
              ? "Generating..."
              : "Generate subitems"}
          </Button>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              textAlign: "center",
              margin: 0,
            }}
          >
            Powered by monday.com AI Blocks. Uses AI credits from your
            workspace.
          </p>
        </div>

        {/* Right column */}
        <div>
          {generationState === "idle" ? (
            <div
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
            </div>
          ) : generationState === "loading" ? (
            <div
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
            </div>
          ) : confirmState === "done" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
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
                Template created on your template board
              </h3>
              <p
                className="text-xs mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {subitems.length} subitems added to "Generated Template"
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                Open in monday.com <IconExternalLink size={11} />
              </a>
            </motion.div>
          ) : (
            <div
              className="rounded-[10px] p-4"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
              }}
            >
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
                  disabled={confirmState === "loading"}
                >
                  {confirmState === "loading" && (
                    <IconLoader2 size={14} className="animate-spin" />
                  )}
                  {confirmState === "loading"
                    ? "Creating..."
                    : "Confirm & create template"}
                </Button>
                <Button variant="secondary" onClick={handleRegenerate}>
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
