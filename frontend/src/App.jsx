import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Send, ArrowUpRight, Cpu, Globe, Hash, X, Terminal, 
  Fingerprint, Zap, ArrowRight, Power, ShieldCheck, 
  User, Mail, Database, Activity, LayoutGrid 
} from "lucide-react";

const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap');
    :root { --accent: #D4FF33; --bg: #050505; }
    * { box-sizing: border-box; font-family: 'Space Grotesk', sans-serif; cursor: crosshair; }
    body { background: var(--bg); color: white; margin: 0; overflow: hidden; height: 100vh; }
    .glass-panel { background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(50px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .neon-border:focus-within { border-color: var(--accent); box-shadow: 0 0 20px rgba(212, 255, 51, 0.1); }
    .custom-scroll::-webkit-scrollbar { width: 2px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #222; }
    input { background: transparent; border: none; color: white; outline: none; width: 100%; }
  `}} />
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null); // User profile data
  const [isLoginView, setIsLoginView] = useState(true);
  const [authData, setAuthData] = useState({ username: "", email: "", password: "" });
  const [activePanel, setActivePanel] = useState("chat"); // 'chat' or 'profile'
  
  const [messages, setMessages] = useState([{ id: 1, text: "Nexus Core Initialized. Awaiting input.", sender: "bot" }]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      const socketInstance = io("http://localhost:3000", { transports: ["websocket"] });
      setSocket(socketInstance);
      socketInstance.on("ai-response", (res) => {
        setMessages(p => [...p, { id: Date.now(), text: res, sender: "bot" }]);
        setIsBotTyping(false);
      });
      return () => socketInstance.disconnect();
    }
  }, [isLoggedIn]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLoginView ? "/login/user" : "/register/user";
      const { data } = await axios.post(`http://localhost:3000/api/auth${endpoint}`, authData, { withCredentials: true });
      setUserData(data.user); // Backend se user info save ki
      setIsLoggedIn(true);
    } catch (err) {
      alert(err.response?.data?.message || "Auth Error");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages(p => [...p, { id: Date.now(), text: inputMessage, sender: "user" }]);
    socket?.emit("ai-message", { prompt: inputMessage });
    setInputMessage("");
    setIsBotTyping(true);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isBotTyping]);

  return (
    <div className="h-screen w-full relative">
      <GlobalStyles />
      
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div key="auth" className="h-full flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-panel p-10 rounded-[3rem]">
              <Fingerprint size={50} className="text-[#D4FF33] mb-8" />
              <h2 className="text-4xl font-light italic mb-8 tracking-tighter italic">{isLoginView ? "Nexus_Auth" : "Init_Node"}</h2>
              
              <form onSubmit={handleAuth} className="space-y-6">
                {!isLoginView && <input name="username" onChange={(e) => setAuthData({...authData, username: e.target.value})} placeholder="SUBJECT_NAME" className="p-4 border-b border-white/10 focus:border-[#D4FF33] transition-all" required />}
                <input type="email" onChange={(e) => setAuthData({...authData, email: e.target.value})} placeholder="REGISTRY_EMAIL" className="p-4 border-b border-white/10 focus:border-[#D4FF33] transition-all" required />
                <input type="password" onChange={(e) => setAuthData({...authData, password: e.target.value})} placeholder="ACCESS_KEY" className="p-4 border-b border-white/10 focus:border-[#D4FF33] transition-all" required />
                
                <button className="w-full py-5 bg-[#D4FF33] text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_30px_#D4FF3344] transition-all">
                  {loading ? "VERIFYING..." : "AUTHORIZE"} <ArrowRight size={20}/>
                </button>
              </form>
              <button onClick={() => setIsLoginView(!isLoginView)} className="w-full mt-8 text-[10px] tracking-[3px] text-zinc-500 uppercase font-bold">{isLoginView ? "// CREATE NEW IDENTITY" : "// RETURN TO AUTH"}</button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col md:flex-row p-4 gap-4 bg-[#020202]">
            
            {/* 1. LEFT SIDEBAR (NAVIGATION) */}
            <nav className="w-full md:w-20 glass-panel rounded-[2.5rem] flex md:flex-col items-center py-8 gap-10 justify-center md:justify-start">
              <div className="p-3 bg-[#D4FF33] rounded-2xl text-black shadow-[0_0_15px_#D4FF33]"><Cpu size={24}/></div>
              <div onClick={() => setActivePanel("chat")} className={`cursor-pointer transition-colors ${activePanel === "chat" ? "text-[#D4FF33]" : "text-zinc-600 hover:text-white"}`}><LayoutGrid size={24}/></div>
              <div onClick={() => setActivePanel("profile")} className={`cursor-pointer transition-colors ${activePanel === "profile" ? "text-[#D4FF33]" : "text-zinc-600 hover:text-white"}`}><User size={24}/></div>
              <button onClick={() => window.location.reload()} className="md:mt-auto text-rose-500 hover:scale-110 transition-transform"><Power size={24}/></button>
            </nav>

            {/* 2. MAIN INTERACTIVE AREA */}
            <main className="flex-1 glass-panel rounded-[3rem] flex flex-col overflow-hidden relative">
              <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#D4FF33] animate-pulse" />
                  <span className="text-[10px] tracking-[4px] font-bold text-zinc-500 uppercase">{activePanel === 'chat' ? 'Neural_Stream' : 'Identity_Vault'}</span>
                </div>
                <Terminal size={18} className="text-zinc-800" />
              </header>

              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {activePanel === "chat" ? (
                    <motion.div key="chat-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto p-8 lg:p-14 space-y-12 custom-scroll">
                        {messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-[85%] lg:max-w-[70%]">
                              <p className={`text-[9px] font-bold tracking-[3px] mb-2 uppercase ${msg.sender === "user" ? "text-[#D4FF33]" : "text-zinc-700"}`}>{msg.sender === "user" ? "// USER" : "// NEXUS"}</p>
                              <div className={`text-xl lg:text-2xl font-light leading-snug ${msg.sender === "user" ? "text-white" : "text-zinc-400"}`}>{msg.text}</div>
                            </div>
                          </div>
                        ))}
                        {isBotTyping && <div className="text-[10px] tracking-[5px] text-[#D4FF33] animate-pulse">THINKING...</div>}
                        <div ref={messagesEndRef} />
                      </div>
                      <footer className="p-8 lg:p-14 pt-0">
                        <form onSubmit={sendMessage} className="relative flex items-center border-b border-white/10 py-4 focus-within:border-[#D4FF33] transition-colors">
                          <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="SEND COMMAND..." className="text-xl lg:text-3xl placeholder:text-zinc-900" />
                          <button type="submit" className={`transition-all ${inputMessage.trim() ? "text-[#D4FF33] scale-125" : "opacity-0"}`}><ArrowUpRight size={36}/></button>
                        </form>
                      </footer>
                    </motion.div>
                  ) : (
                    <motion.div key="profile-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full flex items-center justify-center p-10">
                       <div className="w-full max-w-2xl space-y-12">
                          <div className="flex items-center gap-8 border-b border-white/5 pb-10">
                             <div className="w-24 h-24 rounded-full bg-[#D4FF33] flex items-center justify-center text-black font-bold text-4xl shadow-[0_0_30px_#D4FF3366]">
                                {userData?.username?.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <h3 className="text-4xl font-light tracking-tighter">{userData?.username}</h3>
                                <p className="text-zinc-500 tracking-[4px] text-[10px] uppercase">Neural_ID: {userData?._id?.slice(-8)}</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-2 font-bold">Email_Registry</p>
                                <p className="text-xl font-light text-zinc-300 flex items-center gap-3"><Mail size={16} className="text-[#D4FF33]"/> {userData?.email}</p>
                             </div>
                             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-2 font-bold">Protocol_Status</p>
                                <p className="text-xl font-light text-zinc-300 flex items-center gap-3"><ShieldCheck size={16} className="text-emerald-500"/> Verified_Node</p>
                             </div>
                          </div>

                          <div className="p-10 border border-white/5 rounded-[2rem] bg-gradient-to-r from-transparent to-[#D4FF3305]">
                             <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-6 font-bold">System_Diagnostics</p>
                             <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-[#D4FF3311] border border-[#D4FF3333] text-[#D4FF33] text-[10px] font-bold rounded-full">UPTIME: 99.9%</div>
                                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full">ENCRYPTION: AES-256</div>
                                <div className="px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-full">CORE: V2.5.0</div>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>

            {/* 3. RIGHT LOGS PANEL (Desktop Only) */}
            <aside className="hidden xl:flex w-80 glass-panel rounded-[2.5rem] flex-col p-8 overflow-hidden">
               <div className="flex justify-between items-center mb-10">
                  <span className="text-[10px] font-bold tracking-[4px] text-[#D4FF33]">LIVE_LOGS</span>
                  <Activity size={16} className="text-[#D4FF33] animate-pulse"/>
               </div>
               <div className="flex-1 font-mono text-[11px] text-zinc-600 space-y-4 custom-scroll overflow-y-auto">
                  <p className="text-emerald-500 tracking-tighter uppercase">{`> [${new Date().toLocaleTimeString()}] NODE_READY`}</p>
                  <p>{`> [STDOUT] STREAM_SYNCED`}</p>
                  <p>{`> [NETWORK] LATENCY: 12ms`}</p>
                  <p className="text-[#D4FF33]">{`> [ID] ${userData?.username?.toUpperCase()}_LOGGED_IN`}</p>
               </div>
               <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                  <Database size={16} className="text-zinc-700"/>
                  <span className="text-[9px] font-bold text-zinc-700 tracking-widest uppercase">Cluster: AWS_MUMBAI</span>
               </div>
            </aside>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}