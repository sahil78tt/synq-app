import { useChatStore } from "../store/useChatStore";

export default function ConversationSummary() {
  const { summary, isSummarizing } = useChatStore();

  if (!summary && !isSummarizing) return null;

  return (
    <div className="px-5 py-3 border-b border-border dark:border-border-dark bg-surface/50 dark:bg-surface-dark/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-accent shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-charcoal dark:text-[#f0f0ee] uppercase tracking-wide mb-1">
              Conversation Summary
            </h3>
            {isSummarizing ? (
              <div className="flex items-center gap-2 text-sm text-muted dark:text-muted-dark">
                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <span>Generating summary...</span>
              </div>
            ) : (
              <p className="text-sm text-charcoal/90 dark:text-[#f0f0ee]/90 leading-relaxed">
                {summary}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
