export default function NoChatSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface dark:bg-surface-dark select-none">
      <div className="max-w-xs text-center px-6">
        {/* Logo (Replaced SVG safely) */}
        <div className="w-14 h-14 rounded-2xl bg-panel dark:bg-panel-dark border border-border dark:border-border-dark shadow-soft flex items-center justify-center mx-auto mb-6">
          <img
            src="/SynQ-Logo.png"
            alt="SynQ Logo"
            className="w-30 h-30 object-contain opacity-90"
            draggable="false"
          />
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
