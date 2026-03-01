export default function NoChatSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface dark:bg-surface-dark select-none">
      <div className="max-w-xs text-center px-6">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-panel dark:bg-panel-dark border border-border dark:border-border-dark shadow-soft flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-muted dark:text-muted-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>

        <h3 className="font-display text-xl text-charcoal dark:text-[#f0f0ee] mb-2">
          No conversation selected
        </h3>
        <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
          Choose someone from the sidebar to start a conversation.
        </p>
      </div>
    </div>
  );
}
