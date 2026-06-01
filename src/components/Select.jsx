import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconCheck, IconLoader2 } from "@tabler/icons-react";

export default function Select({
  value,
  onChange,
  onOpen,
  options = [],
  loading = false,
  placeholder = "Select...",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selected = options.find((option) => option.value === value);

  const handleToggle = () => {
    if (disabled) return;

    if (!open) {
      onOpen?.();
    }

    setOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        style={{
          width: "100%",
          height: 42,
          padding: "0 14px",
          borderRadius: 10,
          border: open ? "1px solid var(--accent)" : "1px solid var(--border)",
          background: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 120ms ease",
          boxShadow: open ? "0 0 0 3px rgba(108,71,255,.12)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--text-muted)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--border)";
          }
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: selected ? "var(--text-primary)" : "var(--text-muted)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {selected?.label || placeholder}
        </span>

        <IconChevronDown
          size={16}
          style={{
            color: "var(--text-secondary)",
            transition: "transform 150ms ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 4,
            maxHeight: 260,
            overflowY: "auto",
            boxShadow: "0 12px 32px rgba(0,0,0,.12)",
            animation: "dropdownIn 120ms ease-out",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
            >
              <IconLoader2 size={16} className="animate-spin" />
              Loading boards...
            </div>
          ) : options.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              No boards available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    marginBottom: 2,
                    border: "none",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isSelected
                      ? "var(--accent-light)"
                      : "transparent",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: isSelected ? 500 : 400,
                    transition: "background-color 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "var(--bg-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {option.label}
                  </span>

                  {isSelected && <IconCheck size={15} color="var(--accent)" />}
                </button>
              );
            })
          )}
        </div>
      )}

      <style>
        {`
          @keyframes dropdownIn {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}