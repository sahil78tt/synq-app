import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

export default function ConversationSummary() {
  const {
    summary,
    isSummarizing,
    summaryError,
    clearSummaryError,
    rateLimitResetTime,
  } = useChatStore();
  const [countdown, setCountdown] = useState(null);

  // ✅ Countdown timer for rate limit
  useEffect(() => {
    if (!rateLimitResetTime) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      if (now >= rateLimitResetTime) {
        setCountdown(null);
        clearSummaryError();
        return;
      }

      const secondsLeft = Math.ceil((rateLimitResetTime - now) / 1000);
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      setCountdown(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [rateLimitResetTime, clearSummaryError]);

  // Don't render if nothing to show
  if (!summary && !isSummarizing && !summaryError) return null;

  return (
    <div className="px-5 py-3 border-b border-border dark:border-border-dark bg-surface/50 dark:bg-surface-dark/30">
      <div className="max-w-3xl mx-auto">
        {/* ✅ Rate Limit Error State */}
        {summaryError?.isRateLimited && (
          <div className="flex items-start gap-3">
            {/* Warning Icon */}
            <div className="w-9 h-9 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Rate Limit Reached
                </h3>
                {/* Close button */}
                <button
                  onClick={clearSummaryError}
                  className="p-1 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors"
                  aria-label="Dismiss"
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
              </div>

              <p className="text-sm text-charcoal/80 dark:text-[#f0f0ee]/80 leading-relaxed">
                You've used all {summaryError.limit || 5} summarization requests
                for this {summaryError.windowMinutes || 15}-minute window.
              </p>

              {/* Countdown Timer */}
              {countdown && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/20 rounded-full">
                    <svg
                      className="w-3.5 h-3.5 text-amber-500"
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
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      Try again in {countdown}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ General Error State (non-rate-limit) */}
        {summaryError && !summaryError.isRateLimited && (
          <div className="flex items-start gap-3">
            {/* Error Icon */}
            <div className="w-9 h-9 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                  Summary Failed
                </h3>
                <button
                  onClick={clearSummaryError}
                  className="p-1 rounded-full hover:bg-surface dark:hover:bg-surface-dark/50 transition-colors"
                  aria-label="Dismiss"
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
              </div>
              <p className="text-sm text-charcoal/80 dark:text-[#f0f0ee]/80">
                {summaryError.message}
              </p>
            </div>
          </div>
        )}

        {/* ✅ Loading State */}
        {isSummarizing && !summaryError && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-charcoal dark:text-[#f0f0ee] uppercase tracking-wide mb-1">
                Generating Summary
              </h3>
              <p className="text-sm text-muted dark:text-muted-dark">
                AI is analyzing your conversation...
              </p>
            </div>
          </div>
        )}

        {/* ✅ Success State - Summary Display */}
        {summary && !isSummarizing && !summaryError && (
          <div className="flex items-start gap-3">
            {/* Success Icon */}
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-accent"
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
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-charcoal dark:text-[#f0f0ee] uppercase tracking-wide mb-1">
                Conversation Summary
              </h3>
              <p className="text-sm text-charcoal/90 dark:text-[#f0f0ee]/90 leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
