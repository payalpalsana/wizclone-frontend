import { NavLink } from "react-router-dom";
import {
  IconSettings,
  IconList,
  IconWand,
  IconHelpCircle,
  IconLayoutList,
} from "@tabler/icons-react";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { useTheme } from "../context/ThemeContext";
import { WizLogo } from "../utils/icon";
import ThemeToggleButton from "./ThemeToggleButton";

const NAV_ITEMS = [
  { to: "/settings", icon: IconSettings, label: "Settings" },
  { to: "/templates", icon: IconLayoutList, label: "Templates" },
  { to: "/activity", icon: IconList, label: "Activity Log" },
  { to: "/builder", icon: IconWand, label: "Template Builder" },
  { to: "/help", icon: IconHelpCircle, label: "Help" },
];

export default function Sidebar({ plan = "Free" }) {
  const width = useWindowWidth();
  const collapsed = width > 0 && width < 600;
  const hidden = width > 0 && width < 400;
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  if (hidden) return null;

  return (
    <aside
      className="flex flex-col shrink-0 h-full"
      style={{
        width: collapsed ? 52 : 200,
        borderRight: "1px solid var(--border)",
        backgroundColor: "var(--bg-primary)",
        transition: "width 200ms ease",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          padding: collapsed ? "12px" : "12px 12px 12px 14px",
          gap: collapsed ? 0 : 8,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <WizLogo />
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <span
                className="block font-medium text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                WizClone
              </span>
            </div>
            <ThemeToggleButton isDark={isDark} onToggle={toggle} />
          </>
        )}
      </div>

      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            style={({ isActive: active }) => ({
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              padding: collapsed ? "10px 0" : "9px 16px",
              justifyContent: collapsed ? "center" : "flex-start",
              color: active ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor: active ? "var(--accent-light)" : "transparent",
              fontWeight: active ? 500 : 400,
              fontSize: 14,
              textDecoration: "none",
              transition: "color 120ms, background-color 120ms",
            })}
          >
            <Icon size={17} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: collapsed ? "12px 0" : "10px 14px",
        }}
      >
        {!collapsed ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              className="text-xs font-medium px-2 py-1 rounded"
              style={{
                backgroundColor:
                  plan === "Free"
                    ? "var(--bg-secondary)"
                    : "var(--accent-light)",
                color:
                  plan === "Free" ? "var(--text-secondary)" : "var(--accent)",
              }}
            >
              {plan}
            </span>
            {plan === "Free" && (
              <a
                href="#"
                className="text-xs font-medium"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                Upgrade
              </a>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              title={`Plan: ${plan}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  plan === "Free" ? "var(--text-muted)" : "var(--accent)",
              }}
            />
            <ThemeToggleButton isDark={isDark} onToggle={toggle} />
          </div>
        )}
      </div>
    </aside>
  );
}
