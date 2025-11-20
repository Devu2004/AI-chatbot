import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Sun, Moon, Send, Bot, User, Zap, CircleDot } from "lucide-react";

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  body {
    font-family: 'Inter', sans-serif;
  }

  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(107, 114, 128, 0.8);
  }

  /* Message Animation */
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .animate-message {
    animation: messageSlideIn 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }
  
  /* Typing Dot Animation */
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  .dot-bounce {
    animation: bounce 1s infinite;
  }
  .dot-1 { animation-delay: 0s; }
  .dot-2 { animation-delay: 0.2s; }
  .dot-3 { animation-delay: 0.4s; }
`;

export default function App() {
  const [theme, setTheme] = useState("light");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // -----------------------------
  // 🔥 SOCKET CONNECTION
  // -----------------------------
  useEffect(() => {
    const socketInstance = io("http://localhost:3000", {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🔥 Connected to backend:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      setIsConnected(false);
    });

    socketInstance.on("ai-response", (response) => {
      const botMessage = {
        id: Date.now(),
        text: response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsBotTyping(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // -----------------------------
  // ✉️ Handle Send Message
  // -----------------------------
  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsBotTyping(true);

    if (socket && isConnected) {
      socket.emit("ai-message", { prompt: inputMessage });
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "I see you're not connected to the backend, but I look great don't I? Check your console for socket errors if you are trying to connect to a real server.",
            sender: "bot",
          },
        ]);
        setIsBotTyping(false);
      }, 1500);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className={theme}>
      <style>{customStyles}</style>
      
      {/* Main App Container */}
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] transition-colors duration-500 ease-in-out p-0 sm:p-6">
        
        {/* Chat Interface Card */}
        <div className="w-full max-w-4xl h-[100dvh] sm:h-[85vh] bg-white dark:bg-[#1e293b] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-500 border border-gray-200 dark:border-slate-700 relative">
          
          {/* Header */}
          <header className="px-6 py-4 bg-white/80 dark:bg-[#1e293b]/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-700 z-10 flex justify-between items-center sticky top-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Zap size={20} strokeWidth={2.5} />
                </div>
                {/* Status Dot */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1e293b] ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                  AI Assistant
                </h1>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  {isConnected ? "Online & Ready" : "Connecting..."}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-[#0f172a]/20 dark:to-[#1e293b]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full animate-message ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-auto mb-1 ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {msg.sender === "bot" ? (
                      <Bot size={16} strokeWidth={2.5} />
                    ) : (
                      <User size={16} strokeWidth={2.5} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed break-words ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isBotTyping && (
              <div className="flex justify-start w-full animate-message">
                <div className="flex max-w-[85%] gap-3">
                   <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-auto mb-1 bg-emerald-600 text-white">
                      <Bot size={16} strokeWidth={2.5} />
                   </div>
                   <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full dot-bounce dot-1"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full dot-bounce dot-2"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full dot-bounce dot-3"></span>
                   </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-white dark:bg-[#1e293b] border-t border-gray-100 dark:border-slate-700 z-10">
            <form
              onSubmit={sendMessage}
              className="relative flex items-center gap-2 bg-gray-100 dark:bg-slate-800/50 p-2 rounded-[2rem] border border-transparent focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-500/10 transition-all duration-300"
            >
              <button
                 type="button"
                 className="p-3 rounded-full text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ml-1"
              >
                <CircleDot size={22} />
              </button>
              
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Message AI..."
                className="flex-1 bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-slate-400 outline-none text-base px-2"
                disabled={!isConnected && !messages.length} // Optional: disable if totally offline
              />
              
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className={`p-3 rounded-full transition-all duration-300 transform ${
                  inputMessage.trim()
                    ? "bg-indigo-600 text-white hover:scale-105 hover:shadow-lg active:scale-95"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Send size={20} strokeWidth={2.5} className={inputMessage.trim() ? "ml-0.5" : ""} />
              </button>
            </form>
            
            <div className="text-center mt-2">
               <p className="text-[10px] text-gray-400 dark:text-slate-500">
                 AI can make mistakes. Please double-check responses.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}