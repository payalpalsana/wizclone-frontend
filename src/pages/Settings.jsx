import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import Card, { SectionLabel } from "../components/Card";
import Select from "../components/Select";
import Toggle from "../components/Toggle";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { fetchBoards, fetchBoardItems } from "../lib/monday";
import TemplateSuggestionBanner from "../components/TemplateSuggestionBanner";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { SENSITIVITY_OPTIONS } from "../utils/constant";

export default function Settings() {
  const toast = useToast();
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 600;
  const isNarrow = width > 0 && width < 400;

  const [templateBoardId, setTemplateBoardId] = useState("");
  const [sensitivity, setSensitivity] = useState("balanced");
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [saveState, setSaveState] = useState("idle");
  const [showSuggestion, setShowSuggestion] = useState(true);

  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoards,
    retry: false,
  });

  const { data: templateItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["board-items", templateBoardId],
    queryFn: () => fetchBoardItems(templateBoardId),
    enabled: !!templateBoardId,
    retry: false,
  });

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSaveState("saved");
      toast.success("Settings saved successfully");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("idle");
      toast.error("Failed to save settings");
    }
  };

  const boardOptions = boards.map((b) => ({ value: b.id, label: b.name }));

  const sidebarW = isNarrow ? 0 : isMobile ? 52 : 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex flex-col min-h-full"
      style={{ padding: isMobile ? "16px" : "20px 24px", paddingBottom: 80 }}
    >
      {showSuggestion && (
        <TemplateSuggestionBanner
          itemType="social media campaign"
          onDismiss={() => setShowSuggestion(false)}
          onSaveTemplate={() => setShowSuggestion(false)}
          compact={isMobile}
        />
      )}

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
        {boardsLoading ? (
          <SkeletonCard />
        ) : (
          <Card>
            <SectionLabel>Template Board</SectionLabel>
            <p
              className="text-sm mb-3"
              style={{ color: "var(--text-secondary)", margin: "0 0 12px" }}
            >
              Select the board where your subitem templates live.
            </p>
            <Select
              value={templateBoardId}
              onChange={setTemplateBoardId}
              options={boardOptions}
              placeholder="Choose a board..."
            />
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: templateBoardId
                  ? "1px solid var(--border)"
                  : "1px dashed var(--border)",
                marginTop: 12,
              }}
            >
              {!templateBoardId ? (
                <p
                  className="text-sm text-center py-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  No board selected yet
                </p>
              ) : itemsLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="skeleton-shimmer rounded"
                      style={{
                        height: 14,
                        width: i === 1 ? "60%" : i === 2 ? "80%" : "50%",
                        borderRadius: 4,
                      }}
                    />
                  ))}
                </div>
              ) : templateItems.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No items found in this board.
                </p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {templateItems.slice(0, 5).map((item) => (
                    <li key={item.id} className="mb-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name}
                      </span>
                      {item.subitems?.length > 0 && (
                        <ul
                          style={{
                            margin: "2px 0 0 16px",
                            padding: 0,
                            listStyle: "none",
                          }}
                        >
                          {item.subitems.map((sub) => (
                            <li
                              key={sub.id}
                              className="text-xs"
                              style={{
                                color: "var(--text-secondary)",
                                lineHeight: 1.8,
                              }}
                            >
                              • {sub.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                  {templateItems.length > 5 && (
                    <li
                      className="text-xs"
                      style={{
                        color: "var(--accent)",
                        cursor: "pointer",
                        marginTop: 4,
                      }}
                    >
                      + {templateItems.length - 5} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          </Card>
        )}

        <Card>
          <SectionLabel>AI Matching Sensitivity</SectionLabel>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)", margin: "0 0 16px" }}
          >
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
                        color: "#fff",
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

        <Card>
          <SectionLabel>Automation</SectionLabel>
          <div className="flex items-center justify-between gap-3">
            <span
              className="text-sm"
              style={{ color: "var(--text-primary)", lineHeight: 1.5 }}
            >
              Enable automatic subitem copy on this board
            </span>
            <Toggle
              checked={automationEnabled}
              onChange={setAutomationEnabled}
            />
          </div>
          {!automationEnabled && (
            <div
              className="rounded-lg px-3 py-2.5 text-sm"
              style={{
                backgroundColor: "var(--warning-light)",
                color: "var(--warning)",
                marginTop: 12,
              }}
            >
              Automation is paused. New items will not receive subitems
              automatically.
            </div>
          )}
        </Card>
      </div>

      <div
        className="fixed bottom-0 right-0 flex justify-end px-4 py-3"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderTop: "1px solid var(--border)",
          left: sidebarW,
          zIndex: 40,
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          style={{
            height: 34,
            paddingInline: 16,
            borderRadius: 6,
            backgroundColor: "var(--accent)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            border: "none",
            cursor: saveState === "saving" ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "inherit",
            opacity: saveState === "saving" ? 0.8 : 1,
          }}
        >
          {saveState === "saving" && (
            <IconLoader2 size={14} className="animate-spin" />
          )}
          {saveState === "saved" && <IconCheck size={14} />}
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved"
              : "Save settings"}
        </button>
      </div>
    </motion.div>
  );
}
