import { IconMoon, IconSun } from "@tabler/icons-react";

const ThemeToggleButton = ({ isDark, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "1px solid var(--border)",
        backgroundColor: "transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background-color 120ms, color 120ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {isDark ? <IconSun size={14} /> : <IconMoon size={14} />}
    </button>
  );
};

export default ThemeToggleButton;
