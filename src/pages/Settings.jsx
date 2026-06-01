import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";
import Card, { SectionLabel } from "../components/Card";
import Select from "../components/Select";
import Toggle from "../components/Toggle";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import {
  fetchBoards,
  fetchAutomationBoards,
  addAutomationBoard,
  updateAutomationBoard,
  removeAutomationBoard,
} from "../lib/monday";
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

  const {
    data: workspaceBoards = [],
    isLoading: workspaceBoardsLoading,
    refetch: refetchWorkspaceBoards,
  } = useQuery({
    queryKey: ["workspaceBoards", workspaceId],
    queryFn: fetchBoards,
    enabled: false,
    retry: false,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings", workspaceId],
    queryFn: () => fetchAutomationBoards(workspaceId),
    enabled: !!workspaceId,
    retry: false,
  });
  console.log("Fetched settings:", workspaceBoards, settings);

  const automationBoards = settings?.boards ?? [];
  const [sensitivity, setSensitivity] = useState(
    settings?.sensitivity?.toLowerCase() ?? "balanced",
  );
  const [automationEnabled, setAutomationEnabled] = useState(
    settings?.automation_enabled ?? true,
  );

  const addBoardMutation = useMutation({
    mutationFn: (board) => addAutomationBoard(workspaceId, board, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", workspaceId] });
      toast.success("Board added");
    },
    onError: () => toast.error("Failed to add board"),
  });

  const updateBoardMutation = useMutation({
    mutationFn: ({ boardId, enabled }) =>
      updateAutomationBoard(workspaceId, boardId, enabled, settings),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["settings", workspaceId] }),
    onError: () => toast.error("Failed to update board"),
  });

  const removeBoardMutation = useMutation({
    mutationFn: (boardId) =>
      removeAutomationBoard(workspaceId, boardId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", workspaceId] });
      toast.success("Board removed");
    },
    onError: () => toast.error("Failed to remove board"),
  });

  const handleBoardSelect = (boardId) => {
    const alreadyAdded = automationBoards.some((b) => b.id === boardId);
    if (alreadyAdded) {
      toast.error("Board already added");
      return;
    }
    const board = workspaceBoards.find((b) => b.id === boardId);
    if (!board) return;
    addBoardMutation.mutate(board);
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await settingsApi.save(workspaceId, {
        ...settings,
        sensitivity: sensitivity.toUpperCase(),
        automation_enabled: automationEnabled,
      });
      queryClient.invalidateQueries({ queryKey: ["settings", workspaceId] });
      setSaveState("saved");
      toast.success("Settings saved successfully");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("idle");
      toast.error("Failed to save settings");
    }
  };

  const addedBoardIds = new Set(automationBoards.map((b) => b.id));
  const boardOptions = workspaceBoards
    .filter((b) => !addedBoardIds.has(b.id))
    .map((b) => ({ value: b.id, label: b.name }));

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
                onOpen={() => {
                  console.log("Select opened");
                  refetchWorkspaceBoards();
                }}
                options={workspaceBoardsLoading ? [] : boardOptions}
                placeholder={
                  workspaceBoardsLoading
                    ? "Loading boards..."
                    : "Add a board..."
                }
                disabled={addBoardMutation.isPending}
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
                        key={board.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div
                          className="rounded-lg p-3"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            border: board.user_enabled
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
                                {board.name}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-secondary)",
                                  margin: "2px 0 0",
                                }}
                              >
                                {board.user_enabled
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
                                {board.user_enabled ? "Enabled" : "Disabled"}
                              </span>
                              <Toggle
                                checked={board.user_enabled}
                                onChange={(val) =>
                                  updateBoardMutation.mutate({
                                    boardId: board.id,
                                    enabled: val,
                                  })
                                }
                                disabled={updateBoardMutation.isPending}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeBoardMutation.mutate(board.id)
                                }
                                disabled={removeBoardMutation.isPending}
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
                                <IconX size={14} />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {!board.user_enabled && (
                              <motion.div
                                key={`warn-${board.id}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.18 }}
                                style={{ overflow: "hidden" }}
                              >
                                <div
                                  className="rounded-lg px-3 py-2 text-sm"
                                  style={{
                                    backgroundColor: "var(--warning-light)",
                                    color: "var(--warning)",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 8,
                                    marginTop: 10,
                                  }}
                                >
                                  <IconAlertTriangle
                                    size={14}
                                    style={{ flexShrink: 0, marginTop: 1 }}
                                  />
                                  <span>
                                    This board is paused. New items will not
                                    receive subitems until you re-enable it.
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
          <Card>
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
          </Card>
        </div>

        {/* ── Automation ── */}
        <Card>
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
        </Card>
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
