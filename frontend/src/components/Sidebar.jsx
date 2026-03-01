import { useEffect, useState, memo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { getInitials, truncate } from "../lib/utils";
import { DEFAULT_AVATAR } from "../constants";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const ConversationItem = memo(function ConversationItem({
  user,
  isActive,
  onClick,
}) {
  return (
    <button
      onClick={() => onClick(user)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group text-left
        ${
          isActive
            ? "bg-accent/8 dark:bg-accent/10"
            : "hover:bg-surface dark:hover:bg-surface-dark/40"
        }`}
    >
      <div className="relative shrink-0">
        <img
          src={user.profilePic || DEFAULT_AVATAR}
          alt={user.fullName}
          className="w-9 h-9 rounded-full object-cover border border-border dark:border-border-dark"
        />

        {/* ONLINE DOT */}
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-panel dark:border-panel-dark" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate ${
            isActive
              ? "text-charcoal dark:text-[#f0f0ee] font-medium"
              : "text-charcoal dark:text-[#d0d0ce]"
          }`}
        >
          {user.fullName}
        </p>

        {user.lastMessage && (
          <p className="text-xs text-muted dark:text-muted-dark truncate mt-0.5">
            {truncate(user.lastMessage, 35)}
          </p>
        )}
      </div>
    </button>
  );
});

export default function Sidebar() {
  const {
    conversations,
    fetchConversations,
    isLoadingConversations,
    selectedChat,
    setSelectedChat,
    onlineUsers,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  // 🔥 Inject online status
  const filtered = conversations
    .map((user) => ({
      ...user,
      isOnline: onlineUsers.includes(user._id),
    }))
    .filter(
      (u) =>
        u._id !== authUser?._id &&
        u.fullName?.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <aside className="w-[280px] lg:w-[300px] h-full bg-panel dark:bg-panel-dark border-r border-border dark:border-border-dark flex flex-col shrink-0">
      <div className="px-4 pt-5 pb-3">
        <h2 className="font-display text-sm text-charcoal dark:text-[#f0f0ee] mb-3">
          Messages
        </h2>

        <div className="relative">
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface dark:bg-surface-dark/50 border border-border dark:border-border-dark rounded-xl text-charcoal dark:text-[#f0f0ee] outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {isLoadingConversations ? (
          <SidebarSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-sm text-muted dark:text-muted-dark">
              No conversations yet
            </p>
          </div>
        ) : (
          filtered.map((user) => (
            <ConversationItem
              key={user._id}
              user={user}
              isActive={selectedChat?._id === user._id}
              onClick={setSelectedChat}
            />
          ))
        )}
      </div>
    </aside>
  );
}
