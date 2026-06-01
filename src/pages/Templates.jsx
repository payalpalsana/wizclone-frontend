import { useState } from "react";
import { motion } from "framer-motion";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { IconPlus } from "@tabler/icons-react";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import { NoTemplatesIcon } from "../utils/icon";
import Search from "../components/Search";
import CreateTemplateModal from "../components/CreateTemplateModal";
import TemplateCard from "../components/TemplateCard";

// --- Mock data ---
const INITIAL_TEMPLATES = [
  {
    id: 1,
    name: "New Client Onboarding",
    subitems: [
      { id: 10, name: "Send welcome email" },
      { id: 11, name: "Schedule kickoff call" },
      { id: 12, name: "Review proposal" },
      { id: 13, name: "Set up access & tools" },
      { id: 14, name: "Assign account owner" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5),
    copies: 14,
  },
  {
    id: 2,
    name: "Social Media Campaign",
    subitems: [
      { id: 20, name: "Define target audience" },
      { id: 21, name: "Create content calendar" },
      { id: 22, name: "Design visual assets" },
      { id: 23, name: "Write copy for all platforms" },
      { id: 24, name: "Schedule and publish posts" },
      { id: 25, name: "Monitor engagement and analytics" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2),
    copies: 7,
  },
  {
    id: 3,
    name: "Product Launch Checklist",
    subitems: [
      { id: 30, name: "Finalize feature list" },
      { id: 31, name: "QA sign-off" },
      { id: 32, name: "Prepare launch announcement" },
      { id: 33, name: "Coordinate with sales team" },
      { id: 34, name: "Post-launch monitoring" },
    ],
    createdAt: new Date(Date.now() - 86400000 * 10),
    copies: 3,
  },
];

export default function Templates() {
  const width = useWindowWidth();
  const isMobile = width > 0 && width < 600;

  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpdate = (updated) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  const handleDelete = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
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
          <p
            style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}
          >
            All subitem templates that WizClone uses for matching.
          </p>
        </div>
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            setOpen(true);
          }}
        >
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
          placeholder={"Search templates..."}
        />
        <span
          className="text-sm shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration={<NoTemplatesIcon />}
          heading={
            search ? "No templates match your search" : "No templates yet"
          }
          subtext={
            search
              ? "Try a different search term."
              : "Create your first template using the Template Builder to get started."
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
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => (
            <TemplateCard
              // itemId={_itemId}
              key={t.id}
              template={t}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <CreateTemplateModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => {
          // Handle template creation
        }}
      />
    </motion.div>
  );
}
