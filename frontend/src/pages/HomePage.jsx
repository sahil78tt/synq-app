import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import { useChatStore } from "../store/useChatStore";

export default function HomePage() {
  const { selectedChat } = useChatStore();

  return (
    <div className="h-screen flex flex-col bg-surface dark:bg-surface-dark overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar: hidden on mobile when chat is selected */}
        <div className={`${selectedChat ? "hidden sm:flex" : "flex"} h-full`}>
          <Sidebar />
        </div>

        {/* Main area */}
        <div className={`flex-1 min-w-0 flex flex-col ${!selectedChat && "hidden sm:flex"}`}>
          {selectedChat ? <ChatContainer /> : <NoChatSelected />}
        </div>
      </div>
    </div>
  );
}
