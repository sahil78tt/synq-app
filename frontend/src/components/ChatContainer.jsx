import { useEffect, useRef, memo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { socket } from "../lib/socket";
import { formatTime } from "../lib/utils";
import { DEFAULT_AVATAR } from "../constants";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const Message = memo(function Message({
  message,
  isMine,
  senderAvatar,
  senderName,
}) {
  return (
    <div
      className={`flex gap-2.5 items-end message-enter ${isMine ? "flex-row-reverse" : "flex-row"}`}
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
              }`}
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

export default function ChatContainer() {
  const {
    messages,
    isLoadingMessages,
    selectedChat,
    addMessage, // ⚠️ make sure this exists in your store
  } = useChatStore();

  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  // 🔥 Realtime Listener
  useEffect(() => {
    if (!selectedChat) return;

    const handleNewMessage = (newMessage) => {
      addMessage(newMessage);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat]);

  // Auto scroll on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-surface dark:bg-surface-dark">
      <ChatHeader />

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
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
}
