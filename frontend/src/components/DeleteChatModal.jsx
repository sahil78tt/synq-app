import { useEffect, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { DEFAULT_AVATAR } from "../constants";
import { getInitials } from "../lib/utils";

export default function DeleteChatModal() {
  const {
    selectedChat,
    isDeleteModalOpen,
    deleteForBoth,
    isDeleting,
    closeDeleteModal,
    setDeleteForBoth,
    clearChat,
  } = useChatStore();

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isDeleteModalOpen) {
        closeDeleteModal();
      }
    },
    [isDeleteModalOpen, closeDeleteModal],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle click outside modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeDeleteModal();
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (isDeleting) return;
    await clearChat();
  };

  if (!isDeleteModalOpen || !selectedChat) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-panel dark:bg-panel-dark rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-border dark:border-border-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Avatar and Title */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-3">
            {selectedChat.profilePic ? (
              <img
                src={selectedChat.profilePic}
                alt={selectedChat.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-border dark:border-border-dark"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`${selectedChat.profilePic ? "hidden" : "flex"} w-16 h-16 rounded-full bg-accent/10 text-accent text-xl font-semibold items-center justify-center border-2 border-border dark:border-border-dark`}
            >
              {getInitials(selectedChat.fullName)}
            </div>
          </div>

          <h2 className="text-lg font-semibold text-charcoal dark:text-[#f0f0ee]">
            Delete Chat
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm text-muted dark:text-muted-dark text-center mb-5">
          Permanently delete the chat with{" "}
          <span className="font-medium text-charcoal dark:text-[#f0f0ee]">
            {selectedChat.fullName}
          </span>
          ?
        </p>

        {/* Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer mb-6 px-1">
          <input
            type="checkbox"
            checked={deleteForBoth}
            onChange={(e) => setDeleteForBoth(e.target.checked)}
            className="w-4 h-4 rounded border-border dark:border-border-dark 
              text-accent bg-surface dark:bg-surface-dark 
              focus:ring-accent/50 focus:ring-2 cursor-pointer"
          />
          <span className="text-sm text-muted dark:text-muted-dark">
            Also delete for{" "}
            <span className="font-medium text-charcoal dark:text-[#f0f0ee]">
              {selectedChat.fullName}
            </span>
          </span>
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={closeDeleteModal}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-accent hover:text-accent/80 
              transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-400 
              transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete Chat"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
