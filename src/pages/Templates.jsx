import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowWidth } from "../hooks/useWindowWidth";
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconGripVertical,
  IconX,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconTrash,
  IconCheck,
  IconLoader2,
  IconSearch,
} from "@tabler/icons-react";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import { useToast } from "../context/ToastContext";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { NoTemplatesIcon } from "../utils/icon";
import Search from "../components/Search";

// --- Mock data ---
let _itemId = 100;
const INITIAL_TEMPLATES = [
  {
    id: 1,
    name: "New Client Onboarding",
    subitems: [
      { id: 10, name: "Send welcome email" },
      { id: 11, name: "Schedule kickoff call" },
      { id: 12, name: "Review proposal" },
      { id: 13, name: "Set up access & tools" },
      { id: 14, name: "Assign account owner" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
    copies: 14,
  },
  {
    id: 2,
    name: "Social Media Campaign",
    subitems: [
      { id: 20, name: "Define target audience" },
      { id: 21, name: "Create content calendar" },
      { id: 22, name: "Design visual assets" },
      { id: 23, name: "Write copy for all platforms" },
      { id: 24, name: "Schedule and publish posts" },
      { id: 25, name: "Monitor engagement and analytics" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2),
    copies: 7,
  },
  {
    id: 3,
    name: "Product Launch Checklist",
    subitems: [
      { id: 30, name: "Finalize feature list" },
      { id: 31, name: "QA sign-off" },
      { id: 32, name: "Prepare launch announcement" },
      { id: 33, name: "Coordinate with sales team" },
      { id: 34, name: "Post-launch monitoring" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 10),
    copies: 3,
  },
];

function relDate(date) {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// --- Sortable subitem row inside editor ---
function SortableSubitemRow({ item, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      className="flex items-center gap-2 group"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        style={{
          cursor: "grab",
          color: "var(--text-muted)",
          border: "none",
          background: "none",
          padding: "0 2px",
          display: "flex",
          flexShrink: 0,
        }}
      >
        <IconGripVertical size={14} />
      </button>
      <input
        type="text"
        value={item.name}
        onChange={(e) => onEdit(item.id, e.target.value)}
        style={{
          flex: 1,
          height: 34,
          fontSize: 14,
          borderRadius: 7,
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
          padding: "0 10px",
          outline: "none",
          fontFamily: "inherit",
          transition: "border-color 120ms, box-shadow 120ms",
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
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100"
        style={{
          color: "var(--text-muted)",
          border: "none",
          background: "none",
          cursor: "pointer",
          padding: "0 2px",
          display: "flex",
          flexShrink: 0,
          transition: "opacity 120ms",
        }}
      >
        <IconX size={14} />
      </button>
    </div>
  );
}

function TemplateEditor({ template, onSave, onCancel }) {
  const [name, setName] = useState(template.name);
  const [subitems, setSubitems] = useState(
    template.subitems.map((s) => ({ ...s })),
  );
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const editSub = (id, val) =>
    setSubitems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: val } : s)),
    );
  const deleteSub = (id) =>
    setSubitems((prev) => prev.filter((s) => s.id !== id));
  const addSub = () =>
    setSubitems((prev) => [...prev, { id: ++_itemId, name: "" }]);

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setSubitems((items) => {
        const oi = items.findIndex((i) => i.id === active.id);
        const ni = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oi, ni);
      });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave({
      ...template,
      name: name.trim(),
      subitems: subitems.filter((s) => s.name.trim()),
    });
    setSaving(false);
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
        style={{
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        {/* Template name */}
        <div className="mb-4">
          <label
            className="block text-xs font-medium mb-1.5"
            style={{
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Template name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. New Client Onboarding"
            style={{
              width: "100%",
              height: 36,
              fontSize: 14,
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              padding: "0 12px",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 120ms, box-shadow 120ms",
              fontWeight: 500,
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
            style={{
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Subitems ({subitems.length})
          </label>
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
                    onEdit={editSub}
                    onDelete={deleteSub}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={addSub}
            className="flex items-center gap-1.5 mt-2 text-sm"
            style={{
              color: "var(--accent)",
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: "4px 0",
              fontFamily: "inherit",
            }}
          >
            <IconPlus size={13} />
            Add subitem
          </button>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-2 justify-end"
          style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: 34,
              paddingInline: 14,
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-primary)",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              height: 34,
              paddingInline: 14,
              borderRadius: 8,
              border: "none",
              backgroundColor: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: saving || !name.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: !name.trim() ? 0.6 : 1,
            }}
          >
            {saving && <IconLoader2 size={13} className="animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Individual template card ---
function TemplateCard({ template, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();

  const handleSave = (updated) => {
    onUpdate(updated);
    setEditing(false);
    setExpanded(false);
    toast.success("Template updated successfully");
  };

  const handleDelete = () => {
    onDelete(template.id);
    toast.success("Template deleted");
  };

  const expandToggle = (e) => {
    e.stopPropagation();
    setExpanded((v) => !v);
    setEditing(false);
  };

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={(e) => expandToggle(e)}
      >
        {/* Expand toggle */}
        <button
          type="button"
          style={{
            color: "var(--text-muted)",
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            flexShrink: 0,
          }}
        >
          {expanded && !editing ? (
            <IconChevronUp size={15} />
          ) : (
            <IconChevronDown size={15} />
          )}
        </button>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <span
            className="block text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {template.name}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {template.subitems.length} subitem
            {template.subitems.length !== 1 ? "s" : ""} · Created{" "}
            {relDate(template.createdAt)}
          </span>
        </div>

        {/* Copies badge */}
        <Badge variant="default">{template.copies} copies</Badge>

        {/* Edit / delete */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Edit template"
            onClick={() => {
              setEditing(true);
              setExpanded(true);
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 120ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <IconEdit size={13} />
          </button>
          {!confirmDelete ? (
            <button
              type="button"
              title="Delete template"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 120ms, color 120ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--danger-light)";
                e.currentTarget.style.color = "var(--danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <IconTrash size={13} />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <span
                className="text-xs"
                style={{ color: "var(--danger)", whiteSpace: "nowrap" }}
              >
                Delete?
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 5,
                  border: "none",
                  backgroundColor: "var(--danger)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCheck size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(false);
                }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 5,
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconX size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && !editing && (
          <motion.div
            key="list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: "hidden" }}
          >
            <ul
              style={{
                margin: 0,
                padding: "12px 16px 14px 44px",
                listStyle: "none",
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              {template.subitems.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-center gap-2 text-sm"
                  style={{
                    color: "var(--text-secondary)",
                    padding: "3px 0",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: 12,
                      width: 18,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}.
                  </span>
                  {s.name}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Editor */}
        {editing && (
          <TemplateEditor
            key="editor"
            template={template}
            onSave={handleSave}
            onCancel={() => {
              setEditing(false);
              setExpanded(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Templates Screen ---
export default function Templates() {
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 600;

  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [search, setSearch] = useState("");

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpdate = (updated) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  const handleDelete = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ padding: isMobile ? "16px" : "20px 24px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 4px",
            }}
          >
            Templates
          </h1>
          <p
            style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}
          >
            All subitem templates that WizClone uses for matching.
          </p>
        </div>
        <Link to="/builder" style={{ textDecoration: "none" }}>
          <Button size="md" variant="primary" type="button">
            <IconPlus size={14} />
            New template
          </Button>
        </Link>
      </div>

      {/* Search + count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Search
          search={search}
          setSearch={setSearch}
          isMobile={isMobile}
          placeholder={"Search templates..."}
        />
        <span
          className="text-sm shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          illustration={<NoTemplatesIcon />}
          heading={
            search ? "No templates match your search" : "No templates yet"
          }
          subtext={
            search
              ? "Try a different search term."
              : "Create your first template using the Template Builder to get started."
          }
          action={
            !search && (
              <a
                href="/builder"
                style={{
                  height: 34,
                  paddingInline: 14,
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <IconPlus size={14} />
                Create first template
              </a>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
