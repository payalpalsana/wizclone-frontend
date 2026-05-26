import { IconSearch } from "@tabler/icons-react";

const Search = ({ search, setSearch, isMobile, placeholder }) => {
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        maxWidth: isMobile ? "100%" : 340,
      }}
    >
      <IconSearch
        size={15}
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          pointerEvents: "none",
        }}
      />

      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          height: 36,
          paddingLeft: 38,
          paddingRight: 14,
          fontSize: 14,
          border: "1px solid var(--border)",
          borderRadius: 6,
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
          outline: "none",
          fontFamily: "inherit",
          transition:
            "border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.backgroundColor = "var(--bg-primary)";
          e.target.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.04)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.backgroundColor = "var(--bg-secondary)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
};

export default Search;
