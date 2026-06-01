import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical, IconX } from "@tabler/icons-react";

const SortableSubitemRow = ({ item, onEdit, onDelete }) => {
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
};

export default SortableSubitemRow;
