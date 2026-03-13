import { useEffect, useRef, memo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { socket } from "../lib/socket";
import { formatTime } from "../lib/utils";
import { DEFAULT_AVATAR } from "../constants";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ConversationSummary from "./ConversationSummary";

const Message = memo(function Message({
  message,
  isMine,
  senderAvatar,
  senderName,
  isSearchResult,
}) {
  return (
    <div
      className={`flex gap-2.5 items-end message-enter ${isMine ? "flex-row-reverse" : "flex-row"} ${isSearchResult ? "opacity-90" : ""}`}
    >
      {!isMine && (
        <img
          src={senderAvatar || DEFAULT_AVATAR}
          alt={senderName}
          className="w-7 h-7 rounded-full object-cover border border-border dark:border-border-dark shrink-0 self-end"
        />
      )}

      <div
        className={`flex flex-col gap-1 max-w-[68%] ${isMine ? "items-end" : "items-start"}`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="max-w-full rounded-2xl border border-border dark:border-border-dark"
          />
        )}
        {message.text && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-message
              ${
                isMine
                  ? "bg-charcoal dark:bg-[#f0f0ee] text-panel dark:text-charcoal rounded-br-sm"
                  : "bg-panel dark:bg-panel-dark text-charcoal dark:text-[#f0f0ee] border border-border dark:border-border-dark rounded-bl-sm"
              }
              ${isSearchResult ? "ring-2 ring-accent/30" : ""}`}
          >
            {message.text}
          </div>
        )}
        <span className="text-[10px] text-muted dark:text-muted-dark px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
});

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
        />
      </div>
      <span className="text-sm text-gray-900 dark:text-gray-300 italic">
        typing...
      </span>
    </div>
  );
}

export default function ChatContainer() {
  const {
    messages,
    isLoadingMessages,
    selectedChat,
    addMessage,
    searchResults,
    searchQuery,
    isSearching,
    isTyping,
    typingUserId,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;

    const handleNewMessage = (newMessage) => {
      addMessage(newMessage);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat, addMessage]);

  useEffect(() => {
    const handleTyping = ({ senderId }) => {
      const state = useChatStore.getState();
      const currentSelectedChat = state.selectedChat;

      if (currentSelectedChat && senderId === currentSelectedChat._id) {
        useChatStore.getState().setTyping(senderId);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          useChatStore.getState().clearTyping();
        }, 3000);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      const state = useChatStore.getState();

      if (
        state.selectedChat &&
        senderId === state.selectedChat._id &&
        state.typingUserId === senderId
      ) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        useChatStore.getState().clearTyping();
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    useChatStore.getState().clearTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [selectedChat?._id]);

  useEffect(() => {
    if (bottomRef.current && !searchQuery) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, searchQuery, isTyping]);

  const hasSearchResults = searchResults && searchResults.length > 0;
  const showTypingIndicator =
    isTyping &&
    typingUserId &&
    selectedChat &&
    typingUserId === selectedChat._id;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-surface dark:bg-surface-dark">
      <ChatHeader />

      <ConversationSummary />

      {searchQuery && (
        <div className="px-5 py-3 border-b border-border dark:border-border-dark bg-accent/5 dark:bg-accent/10">
          <div className="flex items-center gap-2 mb-2">
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
            <h3 className="text-xs font-semibold text-charcoal dark:text-[#f0f0ee] uppercase tracking-wide">
              Search Results
              {!isSearching && hasSearchResults && (
                <span className="ml-2 text-muted dark:text-muted-dark font-normal">
                  ({searchResults.length} found)
                </span>
              )}
            </h3>
          </div>

          {isSearching ? (
            <div className="flex items-center gap-2 text-sm text-muted dark:text-muted-dark py-4">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <span>Searching by meaning...</span>
            </div>
          ) : hasSearchResults ? (
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
              {searchResults.map((msg) => (
                <Message
                  key={msg._id}
                  message={msg}
                  isMine={msg.senderId === authUser?._id}
                  senderAvatar={selectedChat?.profilePic}
                  senderName={selectedChat?.fullName}
                  isSearchResult={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted dark:text-muted-dark py-2">
              No messages found matching "{searchQuery}"
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {isLoadingMessages ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted dark:text-muted-dark">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              isMine={msg.senderId === authUser?._id}
              senderAvatar={selectedChat?.profilePic}
              senderName={selectedChat?.fullName}
              isSearchResult={false}
            />
          ))
        )}

        {showTypingIndicator && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
}
