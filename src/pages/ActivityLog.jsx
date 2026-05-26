import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronDown, IconChevronUp, IconCheck } from "@tabler/icons-react";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import { useWindowWidth } from "../hooks/useWindowWidth";
import Search from "../components/Search";
import { EmptyStateIcon } from "../utils/icon";

const MOCK_LOGS = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  itemName: `Task ${i + 1}: ${["Social Media Campaign", "Product Launch", "Q3 Report", "Design Review", "Sprint Planning"][i % 5]}`,
  templateMatched:
    i % 7 === 0
      ? null
      : [
          "Campaign Template",
          "Launch Checklist",
          "Report Template",
          "Design Process",
          "Sprint Template",
        ][i % 5],
  confidence: i % 7 === 0 ? null : [94, 87, 72, 61, 98][i % 5],
  exactMatch: i % 5 === 4,
  status: i % 7 === 0 ? "no_match" : i % 11 === 0 ? "failed" : "success",
  time: new Date(Date.now() - i * 3600000 * 2),
  boardName: "Marketing Projects",
  subitems: [
    "Write copy",
    "Design assets",
    "Schedule posts",
    "Review analytics",
  ],
  duration: "1.8s",
  error: i % 11 === 0 ? "Template board not found" : null,
}));

const PAGE_SIZE = 25;

function relativeTime(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

function ConfidencePill({ confidence, exactMatch }) {
  if (exactMatch) return <Badge variant="blue">Exact match</Badge>;
  if (!confidence) return <span style={{ color: "var(--text-muted)" }}>-</span>;
  const variant =
    confidence >= 75 ? "success" : confidence >= 55 ? "warning" : "danger";
  return <Badge variant={variant}>{confidence}%</Badge>;
}

function StatusBadge({ status }) {
  const map = { success: "success", no_match: "warning", failed: "danger" };
  const labels = { success: "Success", no_match: "No match", failed: "Failed" };
  return <Badge variant={map[status]}>{labels[status]}</Badge>;
}

function LogDetail({ log }) {
  return (
    <div
      className="text-sm"
      style={{
        padding: "12px 16px",
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: log.status === "success" || log.error ? 12 : 0,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 3px",
            }}
          >
            Item
          </p>
          <p
            style={{
              color: "var(--text-primary)",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            {log.itemName}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 3px",
            }}
          >
            Board
          </p>
          <p style={{ color: "var(--text-primary)", margin: 0 }}>
            {log.boardName}
          </p>
        </div>
        {log.templateMatched && (
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 3px",
              }}
            >
              Template
            </p>
            <p style={{ color: "var(--text-primary)", margin: 0 }}>
              {log.templateMatched}
            </p>
          </div>
        )}
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 3px",
            }}
          >
            Duration
          </p>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Completed in {log.duration}
          </p>
        </div>
      </div>
      {log.status === "success" && (
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 6px",
            }}
          >
            Subitems copied
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {log.subitems.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <IconCheck
                  size={12}
                  style={{ color: "var(--success)", flexShrink: 0 }}
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {log.error && (
        <div style={{ marginTop: log.status === "success" ? 12 : 0 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--danger)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 3px",
            }}
          >
            Error
          </p>
          <p className="text-sm" style={{ color: "var(--danger)", margin: 0 }}>
            {log.error}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Desktop table row ── */
function LogTableRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        style={{
          cursor: "pointer",
          borderBottom: expanded ? "none" : "1px solid var(--border)",
          transition: "background-color 120ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <td style={{ padding: "11px 16px", maxWidth: 200 }}>
          <span
            className="text-sm font-medium"
            style={{
              color: "var(--text-primary)",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {log.itemName}
          </span>
        </td>
        <td style={{ padding: "11px 16px" }}>
          <span
            className="text-sm"
            style={{
              color: log.templateMatched
                ? "var(--text-secondary)"
                : "var(--text-muted)",
            }}
          >
            {log.templateMatched || "-"}
          </span>
        </td>
        <td style={{ padding: "11px 16px" }}>
          <ConfidencePill
            confidence={log.confidence}
            exactMatch={log.exactMatch}
          />
        </td>
        <td style={{ padding: "11px 16px" }}>
          <StatusBadge status={log.status} />
        </td>
        <td style={{ padding: "11px 16px" }}>
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
            title={log.time.toLocaleString()}
          >
            {relativeTime(log.time)}
          </span>
        </td>
        <td style={{ padding: "11px 12px", width: 24 }}>
          {expanded ? (
            <IconChevronUp size={14} style={{ color: "var(--text-muted)" }} />
          ) : (
            <IconChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          )}
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td colSpan={6} style={{ padding: 0 }}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ overflow: "hidden" }}
              >
                <LogDetail log={log} />
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Mobile card row ── */
function LogCard({ log }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: 12,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {log.itemName}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <StatusBadge status={log.status} />
            <ConfidencePill
              confidence={log.confidence}
              exactMatch={log.exactMatch}
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {relativeTime(log.time)}
            </span>
          </div>
        </div>
        {expanded ? (
          <IconChevronUp
            size={14}
            style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}
          />
        ) : (
          <IconChevronDown
            size={14}
            style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}
          />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: "hidden" }}
          >
            <LogDetail log={log} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ActivityLog() {
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 640;

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_LOGS.filter((log) => {
    if (filter !== "all" && log.status !== filter) return false;
    if (search && !log.itemName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = filtered.length;
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, total);
  const paginated = filtered.slice(pageStart, pageEnd);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "success", label: "Success" },
    { key: "no_match", label: "No match" },
    { key: "failed", label: "Failed" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        padding: isMobile ? "16px" : "20px 24px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
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
          Activity Log
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Every automation WizClone has run on this board.
        </p>
      </div>

      {/* Filters row */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
          marginBottom: 20,
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            overflowX: isMobile ? "auto" : "visible",
            scrollbarWidth: "none",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setFilter(tab.key);
                  setPage(1);
                }}
                style={{
                  position: "relative",
                  height: 48,
                  border: "none",
                  background: active ? "var(--bg-secondary)" : "transparent",
                  color: active
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: active ? 600 : 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 160ms ease",
                  padding: "0 24px",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {tab.label}

                  {tab.count !== undefined && (
                    <span
                      style={{
                        minWidth: 18,
                        height: 18,
                        paddingInline: 6,
                        borderRadius: 999,
                        backgroundColor: active
                          ? "var(--accent-light)"
                          : "var(--bg-tertiary)",
                        color: active ? "var(--accent)" : "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>

                {active && (
                  <motion.div
                    layoutId="activeFilterTab"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 2,
                      borderRadius: 999,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {/*  */}

        {/* Search */}
        <Search
          search={search}
          setSearch={setSearch}
          isMobile={isMobile}
          placeholder="Search automations..."
        />
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Content */}
        {paginated.length === 0 ? (
          <EmptyState
            illustration={<EmptyStateIcon />}
            heading="No automations have run yet"
            subtext="Create a new item on your board to trigger WizClone for the first time."
          />
        ) : isMobile ? (
          /* Mobile: card list */
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {paginated.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        ) : (
          /* Desktop: table */
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 6,
              overflow: "hidden",
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                overflow: "auto",
                flex: 1,
                minHeight: 0,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 560,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    {[
                      "Item name",
                      "Template matched",
                      "Confidence",
                      "Status",
                      "Time",
                      "",
                    ].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 500,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                          position: "sticky",
                          top: 0,
                          zIndex: 5,
                          backgroundColor: "var(--bg-secondary)",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log) => (
                    <LogTableRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 16,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {pageStart + 1}–{pageEnd} of {total} events
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                ["Previous", page === 1, () => setPage((p) => p - 1)],
                ["Next", page >= totalPages, () => setPage((p) => p + 1)],
              ].map(([label, disabled, action]) => (
                <button
                  key={label}
                  type="button"
                  disabled={disabled}
                  onClick={action}
                  style={{
                    height: 32,
                    paddingInline: 12,
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-primary)",
                    color: disabled
                      ? "var(--text-muted)"
                      : "var(--text-primary)",
                    fontSize: 13,
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
