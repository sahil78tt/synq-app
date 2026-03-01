import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getInitials } from "../lib/utils";
import { DEFAULT_AVATAR } from "../constants";

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-14 bg-panel dark:bg-panel-dark border-b border-border dark:border-border-dark flex items-center px-5 justify-between shrink-0 z-20">
      <Link
        to="/"
        className="font-display text-lg text-charcoal dark:text-[#f0f0ee] tracking-tight select-none"
      >
        SynQ
      </Link>

      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          className="text-xs text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-[#f0f0ee] transition-colors duration-200"
        >
          Settings
        </Link>

        {authUser && (
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors duration-200"
            >
              <img
                src={authUser.profilePic || DEFAULT_AVATAR}
                alt={authUser.fullName}
                className="w-7 h-7 rounded-full object-cover border border-border dark:border-border-dark"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
              <span
                className="hidden w-7 h-7 rounded-full bg-accent/10 text-accent text-[10px] font-medium items-center justify-center"
              >
                {getInitials(authUser.fullName)}
              </span>
              <span className="text-sm text-charcoal dark:text-[#f0f0ee] hidden sm:block max-w-[100px] truncate">
                {authUser.fullName}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl shadow-card overflow-hidden">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal dark:text-[#f0f0ee] hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  Profile
                </Link>
                <div className="h-px bg-border dark:bg-border-dark mx-3" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-[#f0f0ee] hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
