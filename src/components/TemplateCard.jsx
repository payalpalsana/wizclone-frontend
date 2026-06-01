import { AnimatePresence } from "framer-motion";
import TemplateEditor from "./TemplateEditor";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useToast } from "../context/ToastContext";
import Badge from "./Badge";
import { motion } from "framer-motion";

function relDate(date) {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

const TemplateCard = ({ template, onUpdate, onDelete, itemId }) => {
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
            onClick={(e) => {
              e.stopPropagation();
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
            // itemId={itemId}
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
};

export default TemplateCard;
