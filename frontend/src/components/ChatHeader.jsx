import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { DEFAULT_AVATAR } from "../constants";

export default function ChatHeader() {
  const {
    selectedChat,
    setSelectedChat,
    onlineUsers,
    fetchSummary,
    isSummarizing,
    semanticSearch,
    searchQuery,
    setSearchQuery,
    clearSearch,
    openDeleteModal,
    // ✅ NEW: Rate limit state
    summaryError,
    rateLimitResetTime,
  } = useChatStore();

  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // ✅ NEW: Track if currently rate limited
  const [isRateLimited, setIsRateLimited] = useState(false);

  // ✅ NEW: Check rate limit status
  useEffect(() => {
    if (!rateLimitResetTime) {
      setIsRateLimited(false);
      return;
    }

    const checkRateLimit = () => {
      setIsRateLimited(Date.now() < rateLimitResetTime);
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);

    return () => clearInterval(interval);
  }, [rateLimitResetTime]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  if (!selectedChat) return null;

  const isOnline = onlineUsers.includes(selectedChat._id);

  // Handle back button click (clears selected chat) - Mobile only
  const handleBack = () => {
    setSelectedChat(null);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      semanticSearch(localSearch.trim());
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setLocalSearch("");
    clearSearch();
    setShowSearch(false);
  };

  // Handle summarize
  const handleSummarize = () => {
    fetchSummary();
    setShowMenu(false);
  };

  // Handle clear chat
  const handleClearChat = () => {
    openDeleteModal();
    setShowMenu(false);
  };

  // ✅ NEW: Check if summarize button should be disabled
  const isSummarizeDisabled = isSummarizing || isRateLimited;

  // ✅ NEW: Get button text based on state
  const getSummarizeButtonText = () => {
    if (isSummarizing) return "Summarizing...";
    if (isRateLimited) return "Limit Reached";
    return "Summarize";
  };

  return (
    <header className="h-14 bg-panel dark:bg-panel-dark border-b border-border dark:border-border-dark flex items-center justify-between px-4 gap-3 shrink-0">
      {/* Left section: Back button + User info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Back button - only visible on mobile (< md) */}
        <button
          onClick={handleBack}
          className="md:hidden flex items-center justify-center w-8 h-8 -ml-1 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors shrink-0"
          aria-label="Back to conversations"
        >
          <svg
            className="w-5 h-5 text-charcoal dark:text-[#f0f0ee]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={selectedChat.profilePic || DEFAULT_AVATAR}
            alt={selectedChat.fullName}
            className="w-9 h-9 rounded-full object-cover border border-border dark:border-border-dark"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-panel dark:border-panel-dark" />
          )}
        </div>

        {/* User info */}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium text-charcoal dark:text-[#f0f0ee] truncate">
            {selectedChat.fullName}
          </h2>
          <p className="text-xs text-muted dark:text-muted-dark">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search Section */}
        {showSearch ? (
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-32 sm:w-48 px-3 py-1.5 text-sm bg-surface dark:bg-surface-dark/50 border border-border dark:border-border-dark rounded-lg text-charcoal dark:text-[#f0f0ee] outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
            <button
              type="submit"
              className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors"
              aria-label="Close search"
            >
              <svg
                className="w-4 h-4 text-muted dark:text-muted-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </form>
        ) : (
          <>
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors"
              aria-label="Search messages"
            >
              <svg
                className="w-5 h-5 text-muted dark:text-muted-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* ✅ UPDATED: Summarize Button with rate limit visual feedback */}
            <button
              onClick={handleSummarize}
              disabled={isSummarizeDisabled}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                ${
                  isRateLimited
                    ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 cursor-not-allowed"
                    : "text-accent bg-accent/10 hover:bg-accent/20"
                }
                ${isSummarizeDisabled ? "opacity-60 cursor-not-allowed" : ""}
              `}
              aria-label="Summarize conversation"
              title={
                isRateLimited
                  ? "Rate limit reached. Please wait."
                  : "Summarize conversation"
              }
            >
              {isSummarizing ? (
                <>
                  <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <span>Summarizing...</span>
                </>
              ) : isRateLimited ? (
                <>
                  {/* Rate limited icon */}
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Limit Reached</span>
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

            {/* Three-dot Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors"
                aria-label="More options"
              >
                <svg
                  className="w-5 h-5 text-muted dark:text-muted-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-xl shadow-card overflow-hidden z-50">
                  {/* ✅ UPDATED: Summarize option for mobile with rate limit support */}
                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizeDisabled}
                    className={`sm:hidden w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
                      ${
                        isRateLimited
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-charcoal dark:text-[#f0f0ee]"
                      }
                      ${
                        isSummarizeDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-surface dark:hover:bg-surface-dark/50"
                      }
                    `}
                  >
                    {isRateLimited ? (
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    {getSummarizeButtonText()}
                  </button>

                  <div className="sm:hidden h-px bg-border dark:bg-border-dark mx-3" />

                  {/* Clear Chat option */}
                  <button
                    onClick={handleClearChat}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Clear Chat
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
