import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconTrash,
} from "@tabler/icons-react";
import Card, { SectionLabel } from "../components/Card";
import Select from "../components/Select";
import Toggle from "../components/Toggle";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { fetchBoards, fetchAutomationBoards } from "../lib/monday";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { SENSITIVITY_OPTIONS } from "../utils/constant";
import Button from "../components/Button";
import { useWorkspace } from "../context/WorkspaceContext";
import { settingsApi } from "../api/client";

export default function Settings() {
  const toast = useToast();
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 600;
  const isNarrow = width > 0 && width < 400;
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspace();

  const [saveState, setSaveState] = useState("idle");

  const [workspaceBoards, setWorkspaceBoards] = useState([]);
  const [workspaceBoardsLoading, setWorkspaceBoardsLoading] = useState(false);

  const loadBoards = async () => {
    setWorkspaceBoardsLoading(true);
    try {
      const boards = await fetchBoards();
      setWorkspaceBoards(boards);
    } catch {
      setWorkspaceBoards([]);
    } finally {
      setWorkspaceBoardsLoading(false);
    }
  };

  const { data: settings, isLoading: settingsLoading, isError: settingsError } = useQuery({
    queryKey: ["settings", workspaceId],
    queryFn: () => fetchAutomationBoards(workspaceId),
    enabled: !!workspaceId,
    retry: false,
    staleTime: 0,
  });

  const [automationBoards, setAutomationBoards] = useState([]);
  const [sensitivity, setSensitivity]           = useState("balanced");
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const syncedWorkspaceRef = useRef(null);

  useEffect(() => {
    if (settings && syncedWorkspaceRef.current !== workspaceId) {
      setAutomationBoards(settings.boards ?? []);
      setSensitivity(settings.sensitivity?.toLowerCase() ?? "balanced");
      setAutomationEnabled(settings.automation_enabled ?? true);
      syncedWorkspaceRef.current = workspaceId;
    }
  }, [settings, workspaceId]);

  const handleBoardSelect = (boardId) => {
    if (automationBoards.some((b) => String(b.board_id) === String(boardId))) {
      toast.error("Board already added");
      return;
    }
    const board = workspaceBoards.find((b) => String(b.id) === String(boardId));
    if (!board) return;
    setAutomationBoards((prev) => [
      ...prev,
      { board_id: parseInt(board.id), board_name: board.name, board_enabled: true },
    ]);
  };

  const handleToggleBoard = (boardId, enabled) => {
    setAutomationBoards((prev) =>
      prev.map((b) => String(b.board_id) === String(boardId) ? { ...b, board_enabled: enabled } : b)
    );
  };

  const handleRemoveBoard = (boardId) => {
    setAutomationBoards((prev) => prev.filter((b) => String(b.board_id) !== String(boardId)));
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await settingsApi.save(workspaceId, {
        sensitivity: sensitivity.toUpperCase(),
        automation_enabled: automationEnabled,
        boards: automationBoards,
      });
      // Re-sync from server after save so DB state is reflected
      syncedWorkspaceRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["settings", workspaceId] });
      setSaveState("saved");
      toast.success("Settings saved successfully");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("idle");
      toast.error("Failed to save settings");
    }
  };

  const addedBoardIds = new Set(automationBoards.map((b) => String(b.board_id)));
  const boardOptions = workspaceBoards.map((b) => ({
    value: b.id,
    label: b.name,
    disabled: addedBoardIds.has(String(b.id)),
  }));

  const sidebarW = isNarrow ? 0 : isMobile ? 52 : 200;
  const contentDisabled = !automationEnabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex flex-col min-h-full"
      style={{ padding: isMobile ? "16px" : "20px 24px", paddingBottom: 80 }}
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
          Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Configure how WizClone works on this board.
        </p>
      </div>

      {settingsError && (
        <div
          className="rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-sm"
          style={{ backgroundColor: "var(--danger-light, #fee2e2)", color: "var(--danger, #dc2626)" }}
        >
          <IconAlertTriangle size={15} style={{ flexShrink: 0 }} />
          Failed to load settings. Please refresh the page.
        </div>
      )}

      <div className="flex flex-col gap-4 flex-1">
        {/* ── Template Board ── */}
        <div
          style={{
            opacity: contentDisabled ? 0.45 : 1,
            pointerEvents: contentDisabled ? "none" : "auto",
            transition: "opacity 0.2s ease",
          }}
        >
          {settingsLoading ? (
            <SkeletonCard />
          ) : (
            <Card>
              <SectionLabel>Template Board</SectionLabel>
              <p
                style={{
                  color: "var(--text-secondary)",
                  margin: "0 0 12px",
                  fontSize: 14,
                }}
              >
                Select boards where your subitem templates live.
              </p>

              <Select
                value=""
                onChange={handleBoardSelect}
                onOpen={loadBoards}
                options={workspaceBoardsLoading ? [] : boardOptions}
                placeholder={
                  workspaceBoardsLoading
                    ? "Loading boards..."
                    : "Add a board..."
                }
                disabled={false}
                loading={workspaceBoardsLoading}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <AnimatePresence initial={false}>
                  {automationBoards.length === 0 ? (
                    <div
                      className="rounded-lg p-3"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px dashed var(--border)",
                      }}
                    >
                      <p
                        className="text-sm text-center py-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No boards added yet
                      </p>
                    </div>
                  ) : (
                    automationBoards.map((board) => (
                      <motion.div
                        key={board.board_id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div
                          className="rounded-lg p-3"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: board.board_enabled
                              ? "1px solid var(--border)"
                              : "1px dashed var(--border)",
                            transition: "border 0.2s ease",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "var(--text-primary)",
                                  margin: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {board.board_name}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-secondary)",
                                  margin: "2px 0 0",
                                }}
                              >
                                {board.board_enabled
                                  ? "Template automation active"
                                  : "Automation paused"}
                              </p>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {board.board_enabled ? "Enabled" : "Disabled"}
                              </span>
                              <Toggle
                                checked={board.board_enabled}
                                onChange={(val) => handleToggleBoard(board.board_id, val)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveBoard(board.board_id)}
                                disabled={false}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 4,
                                  borderRadius: 4,
                                  color: "var(--text-muted)",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "color 0.15s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--warning)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--text-muted)")
                                }
                              >
                                <IconTrash size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </Card>
          )}
        </div>

        {/* ── AI Matching Sensitivity ── */}
        <div
          style={{
            opacity: contentDisabled ? 0.45 : 1,
            pointerEvents: contentDisabled ? "none" : "auto",
            transition: "opacity 0.2s ease",
          }}
        >
          {settingsLoading ? <SkeletonCard /> : <Card>
            <SectionLabel>AI Matching Sensitivity</SectionLabel>
            <p style={{ color: "var(--text-secondary)", margin: "0 0 16px" }}>
              Controls how closely an item name must match a template.
            </p>
            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              }}
            >
              {SENSITIVITY_OPTIONS.map((opt) => {
                const selected = sensitivity === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSensitivity(opt.key)}
                    style={{
                      border: selected
                        ? "2px solid var(--accent)"
                        : "1px solid var(--border)",
                      borderRadius: 10,
                      padding: isMobile ? "10px 12px" : 12,
                      backgroundColor: selected
                        ? "var(--accent-light)"
                        : "var(--bg-primary)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "all 120ms",
                      position: "relative",
                      display: isMobile ? "flex" : "block",
                      alignItems: isMobile ? "center" : undefined,
                      gap: isMobile ? 12 : 0,
                    }}
                  >
                    {opt.recommended && !isMobile && (
                      <span
                        style={{
                          position: "absolute",
                          top: -8,
                          right: 8,
                          backgroundColor: "var(--accent)",
                          color: "var(--text-color)",
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        Recommended
                      </span>
                    )}
                    <div style={{ flex: isMobile ? 1 : undefined }}>
                      <div
                        className="font-medium text-sm"
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: isMobile ? 0 : 2,
                        }}
                      >
                        {opt.label}
                        {opt.recommended && isMobile && (
                          <span
                            style={{
                              marginLeft: 6,
                              backgroundColor: "var(--accent)",
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 600,
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            Recommended
                          </span>
                        )}
                      </div>
                      {!isMobile && (
                        <>
                          <div
                            className="text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {opt.threshold}
                          </div>
                          <div
                            className="text-xs"
                            style={{
                              color: "var(--text-secondary)",
                              lineHeight: 1.4,
                            }}
                          >
                            {opt.description}
                          </div>
                        </>
                      )}
                    </div>
                    {isMobile && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      >
                        {opt.threshold}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>}
        </div>

        {/* ── Automation ── */}
        {settingsLoading ? <SkeletonCard /> : <Card>
          <SectionLabel>Automation</SectionLabel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-sm"
                style={{
                  color: "var(--text-primary)",
                  lineHeight: 1.5,
                  margin: "0 0 2px",
                }}
              >
                Enable WizClone automation for this workspace
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}
              >
                When disabled, all boards stop receiving subitems automatically
                - this overrides individual board settings.
              </p>
            </div>
            <Toggle
              checked={automationEnabled}
              onChange={setAutomationEnabled}
            />
          </div>

          <AnimatePresence>
            {!automationEnabled && (
              <motion.div
                key="global-off"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="rounded-lg px-3 py-2.5 text-sm"
                  style={{
                    backgroundColor: "var(--warning-light)",
                    color: "var(--warning)",
                    marginTop: 12,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <IconAlertTriangle
                    size={14}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span>
                    Automation is fully paused. No boards will receive subitems
                    automatically until you re-enable this.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>}
      </div>

      {/* ── Save Bar ── */}
      <div
        className="fixed bottom-0 right-0 flex justify-end px-4 py-3"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderTop: "1px solid var(--border)",
          left: sidebarW,
          zIndex: 40,
        }}
      >
        <Button onClick={handleSave} disabled={saveState === "saving"}>
          {saveState === "saving" && (
            <IconLoader2 size={14} className="animate-spin" />
          )}
          {saveState === "saved" && <IconCheck size={14} />}
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved"
              : "Save settings"}
        </Button>
      </div>
    </motion.div>
  );
}
