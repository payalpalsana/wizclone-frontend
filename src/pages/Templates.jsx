import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { IconPlus } from "@tabler/icons-react";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import { NoTemplatesIcon } from "../utils/icon";
import Search from "../components/Search";
import CreateTemplateModal from "../components/CreateTemplateModal";
import TemplateCard from "../components/TemplateCard";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { templateApi } from "../api/client";

// Normalise server shape → component shape
function normalize(t) {
  return {
    id:        t.id,
    name:      t.name,
    subitems:  t.subitems ?? [],   // [{ id, name, sort_order }]
    createdAt: new Date(t.created_at),
    copies:    t.usage_count ?? 0,
  };
}

export default function Templates() {
  const width      = useWindowWidth();
  const isMobile   = width > 0 && width < 600;
  const toast      = useToast();
  const queryClient = useQueryClient();
  const { workspaceId, accountId } = useWorkspace();

  const [search, setSearch] = useState("");
  const [open,   setOpen]   = useState(false);

  // Use accountId as path param if workspaceId is not yet set
  // Backend resolves workspace via account_id from the session token anyway
  const queryId = workspaceId || accountId;

  console.log("[Templates] workspaceId:", workspaceId, "accountId:", accountId, "queryId:", queryId);

  // ── Fetch templates ──
  const { data: raw, isLoading, isError } = useQuery({
    queryKey: ["templates", queryId],
    queryFn:  () => templateApi.list(queryId),
    enabled:  !!queryId,
    retry:    false,
    staleTime: 0,
  });

  const templates = (raw?.templates ?? []).map(normalize);
  const filtered  = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: (payload) => templateApi.create(queryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", queryId] });
      toast.success("Template created");
      setOpen(false);
    },
    onError: () => toast.error("Failed to create template"),
  });

  // ── Update ──
  const updateMutation = useMutation({
    mutationFn: ({ templateId, payload }) =>
      templateApi.update(queryId, templateId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", queryId] });
      toast.success("Template updated");
    },
    onError: () => toast.error("Failed to update template"),
  });

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: (templateId) => templateApi.remove(queryId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", queryId] });
      toast.success("Template deleted");
    },
    onError: () => toast.error("Failed to delete template"),
  });

  const handleCreate = (payload) => {
    if (!payload.name?.trim()) return;
    createMutation.mutate({
      name:     payload.name.trim(),
      subitems: payload.subitems
        .filter((s) => s.name.trim())
        .map((s, idx) => ({ name: s.name.trim(), sort_order: idx })),
    });
  };

  const handleUpdate = async (templateId, payload) => {
    await updateMutation.mutateAsync({ templateId, payload });
  };

  const handleDelete = (templateId) => {
    deleteMutation.mutate(templateId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ padding: isMobile ? "16px" : "20px 24px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 4px",
            }}
          >
            Templates
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            All subitem templates that WizClone uses for matching.
          </p>
        </div>
        <Button variant="primary" type="button" onClick={() => setOpen(true)}>
          <IconPlus size={14} />
          New template
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Search
          search={search}
          setSearch={setSearch}
          isMobile={isMobile}
          placeholder="Search templates..."
        />
        <span className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>
          {isLoading ? "—" : `${filtered.length} template${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <EmptyState
          illustration={<NoTemplatesIcon />}
          heading="Failed to load templates"
          subtext="Could not reach the server. Please refresh the page."
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          illustration={<NoTemplatesIcon />}
          heading={search ? "No templates match your search" : "No templates yet"}
          subtext={
            search
              ? "Try a different search term."
              : "Create your first template to get started."
          }
          action={
            !search && (
              <Button variant="primary" onClick={() => setOpen(true)}>
                <IconPlus size={14} />
                Create first template
              </Button>
            )
          }
        />
      )}

      {/* List */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === t.id}
            />
          ))}
        </div>
      )}

      <CreateTemplateModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </motion.div>
  );
}
