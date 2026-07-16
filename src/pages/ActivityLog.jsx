import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { IconChevronDown, IconChevronUp, IconCheck } from "@tabler/icons-react";
import Badge from "../components/Badge";
import EmptyState, { NoActivityIllustration, NoSearchResultsIllustration } from "../components/EmptyState";
import { useWindowWidth } from "../hooks/useWindowWidth";
import Search from "../components/Search";
import { SkeletonCard } from "../components/Skeleton";
import { useWorkspace } from "../context/WorkspaceContext";
import { activityApi } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";

// Map backend status → frontend variant + label
const STATUS_MAP = {
  SUCCESS:         { variant: "success", label: "Success" },
  PARTIAL_SUCCESS: { variant: "success", label: "Partial" },
  NO_MATCH:        { variant: "warning", label: "No match" },
  FAILED:          { variant: "danger",  label: "Failed" },
};

function ConfidencePill({ confidence, matchMethod, aiFallback }) {
  const isExact = matchMethod === "EXACT_MATCH" && !aiFallback;
  if (isExact) return <Badge variant="blue">Exact match</Badge>;
  if (confidence == null) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const variant = confidence >= 75 ? "success" : confidence >= 55 ? "warning" : "danger";
  return <Badge variant={variant}>{confidence}%</Badge>;
}

function StatusBadge({ status }) {
  const { variant, label } = STATUS_MAP[status] ?? { variant: "default", label: status };
  return <Badge variant={variant}>{label}</Badge>;
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
          marginBottom: (log.status === "SUCCESS" || log.status === "PARTIAL_SUCCESS" || log.error_details) ? 12 : 0,
        }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Item</p>
          <p style={{ color: "var(--text-primary)", margin: 0, wordBreak: "break-word" }}>{log.item_name}</p>
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Board</p>
          <p style={{ color: "var(--text-primary)", margin: 0 }}>{log.board_name}</p>
        </div>
        {log.template_matched && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Template</p>
            <p style={{ color: "var(--text-primary)", margin: 0 }}>{log.template_matched}</p>
          </div>
        )}
        {log.duration && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Duration</p>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>{log.duration}</p>
          </div>
        )}
      </div>

      {(log.status === "SUCCESS" || log.status === "PARTIAL_SUCCESS") && log.subitems_copied_names?.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>
            Subitems copied
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {log.subitems_copied_names.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                <IconCheck size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {log.error_details && (
        <div style={{ marginTop: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>Error</p>
          <p className="text-sm" style={{ color: "var(--danger)", margin: 0 }}>{log.error_details}</p>
        </div>
      )}
    </div>
  );
}

function LogTableRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer", borderBottom: expanded ? "none" : "1px solid var(--border)", transition: "background-color 120ms" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-secondary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <td style={{ padding: "11px 16px", maxWidth: 200 }}>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {log.item_name}
          </span>
        </td>
        <td style={{ padding: "11px 16px" }}>
          <span className="text-sm" style={{ color: log.template_matched ? "var(--text-secondary)" : "var(--text-muted)" }}>
            {log.template_matched || "—"}
          </span>
        </td>
        <td style={{ padding: "11px 16px" }}>
          <ConfidencePill confidence={log.confidence} matchMethod={log.match_method} aiFallback={log.ai_fallback_used} />
        </td>
        <td style={{ padding: "11px 16px" }}>
          <StatusBadge status={log.status} />
        </td>
        <td style={{ padding: "11px 16px" }}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{log.time_ago}</span>
        </td>
        <td style={{ padding: "11px 12px", width: 24 }}>
          {expanded ? <IconChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <IconChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
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

function LogCard({ log }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", backgroundColor: "var(--bg-primary)" }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {log.item_name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <StatusBadge status={log.status} />
            <ConfidencePill confidence={log.confidence} matchMethod={log.match_method} aiFallback={log.ai_fallback_used} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{log.time_ago}</span>
          </div>
        </div>
        {expanded
          ? <IconChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
          : <IconChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
        }
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

const FILTER_TABS = [
  { key: "all",      label: "All" },
  { key: "success",  label: "Success" },
  { key: "no_match", label: "No match" },
  { key: "failed",   label: "Failed" },
];

export default function ActivityLog() {
  const width    = useWindowWidth();
  const isMobile = width > 0 && width < 640;
  const { workspaceId, accountId } = useWorkspace();
  const queryId = workspaceId || accountId;

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 1 whenever the debounced search term actually changes
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["activity-log", queryId, filter, debouncedSearch, page],
    queryFn:  () => activityApi.list(queryId, {
      status: filter === "all" ? undefined : filter,
      search: debouncedSearch || undefined,
      page,
      limit: 20,
    }),
    enabled:              !!queryId,
    staleTime:            0,
    retry:                false,
    refetchOnWindowFocus: false,
  });

  const items      = data?.items      ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const tabCounts  = data?.tab_counts  ?? {};

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    // page reset is handled by the useEffect on debouncedSearch
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ padding: isMobile ? "16px" : "20px 24px", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <div className="mb-5">
        <h1 style={{ fontSize: 20, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 4px" }}>Activity Log</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Every automation WizClone has run on this board.</p>
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 20, alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: isMobile ? "auto" : "visible", scrollbarWidth: "none", borderBottom: "1px solid var(--border)" }}>
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key;
            const count  = tab.key === "all" ? tabCounts.all : tabCounts[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleFilterChange(tab.key)}
                style={{
                  position: "relative", height: 48, border: "none",
                  background: active ? "var(--bg-secondary)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                  fontWeight: active ? 600 : 500, fontFamily: "inherit",
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 160ms ease",
                  padding: "0 24px", flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
                  {tab.label}
                  {count != null && !isLoading && (
                    <span style={{ minWidth: 18, height: 18, paddingInline: 6, borderRadius: 999, backgroundColor: active ? "var(--accent-light)" : "var(--bg-tertiary)", color: active ? "var(--accent)" : "var(--text-muted)", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      {count}
                    </span>
                  )}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeFilterTab"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, borderRadius: 999, backgroundColor: "var(--accent)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <Search search={search} setSearch={handleSearchChange} isMobile={isMobile} placeholder="Search automations..." />
      </div>

      {/* Skeleton — clipped, never scrolls */}
      {isLoading && (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {/* Error — centered, never scrolls */}
      {isError && !isLoading && (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState illustration={<NoActivityIllustration />} heading="Failed to load activity" subtext="Could not reach the server. Please refresh the page." />
        </div>
      )}

      {/* Empty — centered, never scrolls */}
      {!isLoading && !isError && items.length === 0 && (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState
            illustration={debouncedSearch ? <NoSearchResultsIllustration /> : <NoActivityIllustration />}
            heading={debouncedSearch ? "No results found" : "No automations have run yet"}
            subtext={debouncedSearch ? "Try a different search term." : "Create a new item on your board to trigger WizClone for the first time."}
          />
        </div>
      )}

      {/* Data — scrolls inside a flex column */}
      {!isLoading && !isError && items.length > 0 && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {isMobile ? (
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((log) => <LogCard key={log.id} log={log} />)}
            </div>
          ) : (
            <div style={{ border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-secondary)" }}>
                      {["Item name", "Template matched", "Confidence", "Status", "Time", ""].map((col) => (
                        <th key={col} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 5, backgroundColor: "var(--bg-secondary)" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((log) => <LogTableRow key={log.id} log={log} />)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} events
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {[["Previous", page === 1, () => setPage((p) => p - 1)], ["Next", page >= totalPages, () => setPage((p) => p + 1)]].map(([label, disabled, action]) => (
                  <button key={label} type="button" disabled={disabled} onClick={action}
                    style={{ height: 32, paddingInline: 12, borderRadius: 6, border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: disabled ? "var(--text-muted)" : "var(--text-primary)", fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
