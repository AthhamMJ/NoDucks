import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProfileMenu.module.css";

export default function ProfileMenu({ name, email, initials }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const isAdmin = user?.role === "admin";

  // Close on outside click or Escape, and return focus to the trigger
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Move focus into the menu when it opens
  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    }
  }, [open]);

  function getItems() {
    return Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? []);
  }

  // Arrow keys move between items, Home and End jump to the ends
  function handleMenuKeyDown(event) {
    const items = getItems();
    const index = items.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  function goTo(path) {
    setOpen(false);
    navigate(path);
  }

  async function handleSignOut() {
    setOpen(false);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign-out failed:", error.message);
    }
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        <div className={styles.avatar}>{initials}</div>

        <div className={styles.userText}>
          <strong>{name}</strong>
          <small>{email}</small>
        </div>

        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          className={styles.menu}
          role="menu"
          aria-label="Account menu"
          onKeyDown={handleMenuKeyDown}
        >
          <div className={styles.header}>
            <strong>{name}</strong>
            <small>{email}</small>
          </div>

          <div className={styles.divider} />

          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => goTo("/settings")}
          >
            <Settings size={18} strokeWidth={1.5} />
            <span>Settings</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => goTo("/admin")}
            >
              <Shield size={18} strokeWidth={1.5} />
              <span>Admin dashboard</span>
            </button>
          )}

          <div className={styles.divider} />

          <button
            type="button"
            role="menuitem"
            className={`${styles.item} ${styles.danger}`}
            onClick={handleSignOut}
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}