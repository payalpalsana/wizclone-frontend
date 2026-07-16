import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { useDebounce } from "../hooks/useDebounce";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import EmptyState, { NoTemplatesIllustration, NoSearchResultsIllustration } from "../components/EmptyState";
import Button from "../components/Button";
import Search from "../components/Search";
import CreateTemplateModal from "../components/CreateTemplateModal";
import TemplateCard from "../components/TemplateCard";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { templateApi } from "../api/client";

const PAGE_LIMIT = 20;

function normalize(t) {
  return {
    id:        t.id,
    name:      t.name,
    subitems:  t.subitems ?? [],
    createdAt: new Date(t.created_at),
    copies:    t.usage_count ?? 0,
  };
}

// Number of skeleton cards based on available vertical space
function skeletonCount(height) {
  if (height <= 0) return 4;
  const available = height - 200; // approx header + search bar height
  return Math.max(2, Math.min(8, Math.floor(available / 72)));
}

export default function Templates() {
  const width     = useWindowWidth();
  const isMobile  = width > 0 && width < 600;
  const toast     = useToast();
  const queryClient = useQueryClient();
  const { workspaceId, accountId } = useWorkspace();

  const [search, setSearch] = useState("");
  const [open,   setOpen]   = useState(false);

  const queryId       = workspaceId || accountId;
  const loaderRef     = useRef(null);
  const debouncedSearch = useDebounce(search, 400);

  // ── Infinite query ──
  const {
    data,
    isLoading,
    isFetching,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey:         ["templates", queryId, debouncedSearch],
    queryFn:          ({ pageParam = 1 }) =>
      templateApi.list(queryId, { page: pageParam, limit: PAGE_LIMIT, search: debouncedSearch || undefined }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled:              !!queryId,
    staleTime:            0,
    retry:                false,
    refetchOnWindowFocus: false,
    refetchOnMount:       true,
  });

  const templates = (data?.pages ?? []).flatMap((p) => (p.templates ?? []).map(normalize));
  const total     = data?.pages?.[0]?.total ?? 0;

  // Show skeleton when: initial load OR a new debounced search term with no cached data yet
  const isSearchChanging = search !== debouncedSearch;
  const showSkeleton = (isFetching && templates.length === 0) || isSearchChanging;

  // ── IntersectionObserver ──
  const handleObserver = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (payload) => templateApi.create(queryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", queryId] });
      toast.success("Template created");
      setOpen(false);
    },
    onError: () => toast.error("Failed to create template"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ templateId, payload }) =>
      templateApi.update(queryId, templateId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", queryId] });
      toast.success("Template updated");
    },
    onError: () => toast.error("Failed to update template"),
  });

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

  // Viewport height for responsive skeleton count
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const numSkeletons   = skeletonCount(viewportHeight);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        padding:        isMobile ? "16px" : "20px 24px",
        height:         "100vh",
        display:        "flex",
        flexDirection:  "column",
        overflow:       "hidden",
        boxSizing:      "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display:       "flex",
          alignItems:    "flex-start",
          justifyContent:"space-between",
          gap:           12,
          marginBottom:  20,
          flexWrap:      "wrap",
          flexShrink:    0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 4px" }}>
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

      {/* Search + count */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            10,
          marginBottom:   16,
          flexWrap:       "wrap",
          flexShrink:     0,
        }}
      >
        <Search
          search={search}
          setSearch={handleSearchChange}
          isMobile={isMobile}
          placeholder="Search templates..."
        />
        <span className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>
          {showSkeleton ? "—" : `${total} template${total !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Skeleton — clipped, never scrolls */}
      {showSkeleton && (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: numSkeletons }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error — centered, never scrolls */}
      {isError && !showSkeleton && (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState
            illustration={<NoTemplatesIllustration />}
            heading="Failed to load templates"
            subtext="Could not reach the server. Please refresh the page."
          />
        </div>
      )}

      {/* Empty — centered, never scrolls */}
      {!showSkeleton && !isError && templates.length === 0 && (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState
            illustration={search ? <NoSearchResultsIllustration /> : <NoTemplatesIllustration />}
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
        </div>
      )}

      {/* List — the only area that scrolls */}
      {!showSkeleton && !isError && templates.length > 0 && (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 16 }}>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {templates.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TemplateCard
                    template={t}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === t.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={loaderRef} style={{ height: 1 }} />

          {/* Next-page spinner */}
          {isFetchingNextPage && (
            <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
              <IconLoader2 size={18} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          )}
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
