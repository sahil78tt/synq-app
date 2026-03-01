import { Link } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import Navbar from "../components/Navbar";

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border dark:border-border-dark last:border-0">
      <div>
        <p className="text-sm text-charcoal dark:text-[#f0f0ee]">{label}</p>
        {description && (
          <p className="text-xs text-muted dark:text-muted-dark mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
        checked ? "bg-charcoal dark:bg-[#f0f0ee]" : "bg-border dark:bg-border-dark"
      }`}
      style={{ height: "22px" }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-panel dark:bg-panel-dark shadow-soft transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <Link
              to="/"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-[#f0f0ee] hover:bg-panel dark:hover:bg-panel-dark border border-border dark:border-border-dark transition-colors duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div>
              <h1 className="font-display text-xl text-charcoal dark:text-[#f0f0ee]">Settings</h1>
              <p className="text-xs text-muted dark:text-muted-dark">Preferences &amp; display</p>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl px-5 mb-4">
            <p className="text-xs font-medium text-charcoal dark:text-[#c0c0be] uppercase tracking-wide pt-5 pb-1">
              Appearance
            </p>

            <SettingRow
              label="Dark mode"
              description="Easier on the eyes at night"
            >
              <Toggle checked={isDark} onChange={toggleTheme} />
            </SettingRow>
          </div>

          {/* Theme preview */}
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl px-5 mb-4">
            <p className="text-xs font-medium text-charcoal dark:text-[#c0c0be] uppercase tracking-wide pt-5 pb-1">
              Preview
            </p>

            <div className="py-4 flex flex-col gap-3">
              {/* Outgoing message bubble */}
              <div className="flex justify-end">
                <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal text-sm max-w-[70%] shadow-message">
                  This is how your messages look.
                </div>
              </div>
              {/* Incoming message bubble */}
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-charcoal dark:text-[#f0f0ee] text-sm max-w-[70%] shadow-message">
                  Looks great!
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl px-5 mb-4">
            <p className="text-xs font-medium text-charcoal dark:text-[#c0c0be] uppercase tracking-wide pt-5 pb-1">
              Notifications
            </p>

            <SettingRow
              label="Message notifications"
              description="Notify when you receive a new message"
            >
              <Toggle checked={true} onChange={() => {}} />
            </SettingRow>

            <SettingRow
              label="Sound"
              description="Play a sound for new messages"
            >
              <Toggle checked={false} onChange={() => {}} />
            </SettingRow>
          </div>

          {/* About */}
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-2xl px-5">
            <p className="text-xs font-medium text-charcoal dark:text-[#c0c0be] uppercase tracking-wide pt-5 pb-1">
              About
            </p>
            <SettingRow label="Version">
              <span className="text-xs text-muted dark:text-muted-dark font-mono">1.0.0</span>
            </SettingRow>
            <SettingRow label="App name">
              <span className="font-display text-sm text-charcoal dark:text-[#f0f0ee]">SynQ</span>
            </SettingRow>
          </div>
        </div>
      </div>
    </div>
  );
}
