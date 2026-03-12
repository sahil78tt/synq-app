import { useChatStore } from "../store/useChatStore";
import { getInitials } from "../lib/utils";
import { DEFAULT_AVATAR } from "../constants";

export default function ChatHeader() {
  const { selectedChat, setSelectedChat, fetchSummary, isSummarizing } =
    useChatStore();

  if (!selectedChat) return null;

  return (
    <div className="h-14 px-5 flex items-center gap-3 border-b border-border dark:border-border-dark bg-panel dark:bg-panel-dark shrink-0">
      <button
        onClick={() => setSelectedChat(null)}
        className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-charcoal dark:hover:text-[#f0f0ee] hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors duration-200"
        aria-label="Back"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="relative">
        <img
          src={selectedChat.profilePic || DEFAULT_AVATAR}
          alt={selectedChat.fullName}
          className="w-8 h-8 rounded-full object-cover border border-border dark:border-border-dark"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <span
          className="hidden w-8 h-8 rounded-full bg-accent/10 text-accent text-xs font-medium items-center justify-center border border-border dark:border-border-dark"
          aria-hidden
        >
          {getInitials(selectedChat.fullName)}
        </span>
        {selectedChat.isOnline && (
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-panel dark:border-panel-dark" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal dark:text-[#f0f0ee] truncate">
          {selectedChat.fullName}
        </p>
        <p className="text-xs text-muted dark:text-muted-dark">
          {selectedChat.isOnline ? "Active now" : "Offline"}
        </p>
      </div>

      <button
        onClick={fetchSummary}
        disabled={isSummarizing}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 hover:bg-accent/20 text-accent dark:bg-accent/20 dark:hover:bg-accent/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        {isSummarizing ? (
          <>
            <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span>Summarizing...</span>
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Summarize</span>
          </>
        )}
      </button>
    </div>
  );
}
