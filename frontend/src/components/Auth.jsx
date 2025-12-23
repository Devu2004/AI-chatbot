import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Fingerprint, Activity, Zap, ArrowUpRight } from "lucide-react";
// 1. Axios ko import karo
import axios from "axios";

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // 2. Input values ko store karne ke liye states banao
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  // 3. Error handle karne ke liye state
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Type karte hi error hat jaye
  };

// Auth.jsx ke andar handleSubmit ko aise check karo
const handleSubmit = async (e) => {
    e.preventDefault(); // Page refresh hone se rokta hai
    setLoading(true);

    try {
      const endpoint = isLogin ? "/login/user" : "/register/user";
      // 🚨 PORT check kar, backend 3000 par hi hai na?
      const url = `http://localhost:3000/api/auth${endpoint}`;

      console.log("📡 Sending Data:", formData); // ✅ Check kar console mein data aa raha hai?

      const response = await axios.post(url, formData, {
        withCredentials: true 
      });

      if (response.status === 200 || response.status === 201) {
        console.log("✅ DB Success:", response.data);
        onLoginSuccess(); // ✅ Login success tabhi hoga jab DB se response aayega
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Connection Failed");
    } finally {
      setLoading(false);
    }
};

  const inputStyle = `
    .custom-input {
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      color: white !important;
      padding: 18px 24px !important;
      border-radius: 20px !important;
      width: 100%;
      outline: none;
      font-family: 'Space Grotesk', sans-serif;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .custom-input:focus {
      border-color: #D4FF33 !important;
      background: rgba(212, 255, 51, 0.05) !important;
      box-shadow: 0 0 25px rgba(212, 255, 51, 0.15);
      transform: translateY(-2px);
    }
    .scan-line { width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #D4FF33, transparent); position: absolute; top: 0; left: 0; animation: scan 3s linear infinite; z-index: 10; opacity: 0.3; }
    @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 0.5; } 100% { top: 100%; opacity: 0; } }
  `;

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <style>{inputStyle}</style>
      
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 6, repeat: Infinity }} className="absolute w-[800px] h-[800px] bg-[#D4FF33] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative bg-[#0D0D0D] border border-white/5 rounded-[3.5rem] p-10 md:p-12 shadow-[0_25px_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="scan-line" />

          <div className="flex justify-between items-start mb-12">
            <div className="p-4 bg-[#151515] rounded-3xl border border-white/10 shadow-inner">
              <Fingerprint size={36} className={loading ? "text-amber-500 animate-pulse" : "text-[#D4FF33]"} />
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[4px] text-[#444] font-bold uppercase mb-1">Secure_Gate</p>
              <div className="flex items-center justify-end gap-2 text-[#D4FF33] text-[11px] font-bold uppercase">
                <Activity size={14} /> {isLogin ? 'Login_Mode' : 'Signup_Mode'}
              </div>
            </div>
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-4xl font-light tracking-tighter mb-2 italic">
              {isLogin ? "Nexus_Auth" : "New_Subject"}
            </h2>
            {/* 8. Error message display logic */}
            {error ? (
              <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">{`// Error: ${error}`}</p>
            ) : (
              <p className="text-[#555] text-[11px] tracking-[3px] font-bold uppercase">
                {isLogin ? "// Establish Neural Link" : "// Create Registry Entry"}
              </p>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  {/* 9. Input fields mein name, value aur onChange set karo */}
                  <input 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    type="text" 
                    className="custom-input" 
                    placeholder="FULL_NAME" 
                    required 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <input 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                type="email" 
                className="custom-input" 
                placeholder="REGISTRY_EMAIL" 
                required 
              />
            </div>

            <div className="relative group">
              <input 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                type="password" 
                className="custom-input" 
                placeholder="ACCESS_KEY" 
                required 
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212, 255, 51, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-5 rounded-[20px] font-bold flex items-center justify-center gap-3 transition-all duration-500 tracking-widest uppercase text-xs ${
                loading ? "bg-[#1A1A1A] text-[#444]" : "bg-[#D4FF33] text-black"
              }`}
            >
              {loading ? "Verifying..." : isLogin ? "Authorize" : "Register"}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="group text-[10px] tracking-[3px] text-[#555] hover:text-[#D4FF33] transition-colors uppercase font-bold flex items-center justify-center mx-auto gap-2"
            >
              <Zap size={14} className="group-hover:fill-[#D4FF33]" />
              {isLogin ? "Register New Identity" : "Return to Login Protocol"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}