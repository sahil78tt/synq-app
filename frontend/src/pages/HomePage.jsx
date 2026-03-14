import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import DeleteChatModal from "../components/DeleteChatModal";
import { useChatStore } from "../store/useChatStore";

export default function HomePage() {
  const { selectedChat, isDeleteModalOpen } = useChatStore();

  return (
    <div className="h-screen flex flex-col bg-surface dark:bg-surface-dark overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div
          className={`
            ${selectedChat ? "hidden" : "flex"} 
            md:flex 
            w-full md:w-auto 
            h-full
          `}
        >
          <Sidebar />
        </div>

        {/* Chat area */}
        <div
          className={`
            flex-1 min-w-0 flex flex-col 
            ${!selectedChat ? "hidden md:flex" : "flex"}
          `}
        >
          {selectedChat ? <ChatContainer /> : <NoChatSelected />}
        </div>
      </div>

      {/* ✅ Delete Chat Modal */}
      {isDeleteModalOpen && <DeleteChatModal />}
    </div>
  );
}
