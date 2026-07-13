import { AnimatePresence } from "framer-motion";
import TemplateEditor from "./TemplateEditor";
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import Badge from "./Badge";
import { motion } from "framer-motion";
import DeleteConfirmModal from "./DeleteConfirmModal";

function relDate(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

const TemplateCard = ({ template, onUpdate, onDelete, isDeleting }) => {
  const [expanded,      setExpanded]      = useState(false);
  const [editing,       setEditing]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async (name, subitems) => {
    await onUpdate(template.id, { name, subitems });
    setEditing(false);
    setExpanded(false);
  };

  const handleDelete = () => {
    onDelete(template.id);
    // Modal stays open — isDeleting shows the loader; card unmounts on success
  };

  const expandToggle = (e) => {
    e.stopPropagation();
    if (editing) return;
    setExpanded((v) => !v);
  };

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--bg-primary)",
        opacity: isDeleting ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={expandToggle}
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
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
              setExpanded(true);
            }}
            style={{
              width: 30, height: 30,
              borderRadius: 6,
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background-color 120ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <IconEdit size={13} />
          </button>

          <button
            type="button"
            title="Delete template"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            style={{
              width: 30, height: 30,
              borderRadius: 6,
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background-color 120ms, color 120ms",
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = "var(--danger-light)";
                e.currentTarget.style.color = "var(--danger)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        open={confirmDelete}
        templateName={template.name}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />

      <AnimatePresence>
        {/* Subitem list (read-only expand) */}
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
                  style={{ color: "var(--text-secondary)", padding: "3px 0", lineHeight: 1.5 }}
                >
                  <span
                    style={{
                      color: "var(--text-muted)", fontSize: 12,
                      width: 18, textAlign: "right", flexShrink: 0,
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
            onCancel={() => { setEditing(false); setExpanded(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateCard;
