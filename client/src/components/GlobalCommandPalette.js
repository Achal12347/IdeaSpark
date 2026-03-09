import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/CommandPalette.css";

const publicCommands = [
  { id: "home", label: "Go to Home", path: "/" },
  { id: "about", label: "Go to About", path: "/about" },
  { id: "features", label: "Go to Features", path: "/features" },
  { id: "pricing", label: "Go to Pricing", path: "/pricing" },
  { id: "contact", label: "Go to Contact", path: "/contact" },
];

const userCommands = [
  { id: "dashboard", label: "Open Dashboard", path: "/dashboard" },
  { id: "ideas", label: "Explore Ideas", path: "/ideas" },
  { id: "post", label: "Create New Idea", path: "/add-idea" },
  { id: "messages", label: "Open Messages", path: "/messages" },
  { id: "activity", label: "Open Activity", path: "/activity" },
  { id: "bookmarks", label: "Open Bookmarks", path: "/bookmarks" },
  { id: "members", label: "Open Members", path: "/members" },
  { id: "settings", label: "Open Settings", path: "/settings" },
];

const adminCommands = [
  { id: "admin-dashboard", label: "Admin Dashboard", path: "/admin/dashboard" },
  { id: "analytics", label: "Open Analytics", path: "/analytics" },
  { id: "reports", label: "Open Reports", path: "/reports" },
];

export default function GlobalCommandPalette() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = useMemo(() => {
    const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/analytics" || location.pathname === "/reports";
    return [
      ...publicCommands,
      ...(currentUser ? userCommands : []),
      ...(currentUser && isAdminRoute ? adminCommands : []),
    ];
  }, [currentUser, location.pathname]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) =>
      command.label.toLowerCase().includes(normalized)
    );
  }, [commands, query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (!open) return;
      if (event.key === "Escape") {
        setOpen(false);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) =>
          Math.min(prev + 1, Math.max(filteredCommands.length - 1, 0))
        );
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const selected = filteredCommands[activeIndex];
        if (!selected) return;
        setOpen(false);
        setQuery("");
        navigate(selected.path);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, filteredCommands, navigate, open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  if (!open) return null;

  return (
    <div className="command-overlay" onClick={() => setOpen(false)}>
      <div className="command-panel" onClick={(event) => event.stopPropagation()}>
        <div className="command-head">
          <h4>Command Palette</h4>
          <span>Ctrl/Cmd + K</span>
        </div>
        <input
          autoFocus
          className="command-input"
          placeholder="Jump to a page or action..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="command-list">
          {filteredCommands.length === 0 ? (
            <p className="command-empty">No matching commands.</p>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                className={`command-item ${activeIndex === index ? "active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  navigate(command.path);
                }}
              >
                <span>{command.label}</span>
                <small>{command.path}</small>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
