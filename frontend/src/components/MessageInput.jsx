import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { MESSAGE_MAX_LENGTH } from "../constants";

export default function MessageInput() {
  const { sendMessage, isSending } = useChatStore();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imagePreview) return;

    await sendMessage({
      text: trimmed,
      image: imagePreview,
    });

    setText("");
    setImagePreview(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  return (
    <div className="w-full px-4 py-3 border-t border-border dark:border-border-dark bg-panel dark:bg-panel-dark shrink-0">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Attachment"
            className="h-20 w-20 object-cover rounded-2xl border border-border dark:border-border-dark"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full 
            bg-charcoal dark:bg-[#f0f0ee] 
            text-panel dark:text-charcoal 
            flex items-center justify-center text-xs shadow-md"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-3">
        {/* Image Button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-10 h-10 rounded-xl flex items-center justify-center 
          text-muted dark:text-muted-dark 
          hover:text-charcoal dark:hover:text-[#f0f0ee] 
          hover:bg-surface dark:hover:bg-surface-dark/50 
          transition-all duration-200 shrink-0"
          aria-label="Attach image"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Write a message…"
          rows={1}
          className="flex-1 resize-none 
  bg-surface dark:bg-surface-dark/50 
  border border-border dark:border-border-dark 
  rounded-2xl px-4 py-2.5 text-sm 
  text-charcoal dark:text-[#f0f0ee] 
  placeholder:text-muted dark:placeholder:text-muted-dark 
  outline-none focus:ring-2 focus:ring-accent/20 
  transition-all duration-200 
  max-h-32 overflow-hidden leading-relaxed"
          style={{ height: "44px" }}
          onInput={(e) => {
            e.target.style.height = "44px";
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
          }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !imagePreview)}
          className="w-11 h-11 rounded-xl 
          bg-charcoal dark:bg-[#f0f0ee] 
          text-panel dark:text-charcoal 
          flex items-center justify-center 
          disabled:opacity-30 hover:opacity-80 
          transition-all duration-200 shrink-0"
          aria-label="Send message"
        >
          {isSending ? (
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
