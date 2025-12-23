require('dotenv').config();
const app = require('./src/app');
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateContent = require('./src/service/ai.service');
const connectToDB = require('./src/db/db')
const httpServer = createServer(app);
connectToDB()

const io = new Server(httpServer, { 
  cors: { origin: "http://localhost:5173" }
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  const chatHistory = [];
  let isProcessing = false;

  socket.on("ai-message", async (data) => {
    console.log("📩 Message received:", data);
    
    if (!data?.prompt || isProcessing) return;

    chatHistory.push({
      role: "user",
      parts: [{ text: data.prompt }]
    });

    // History clean up
    if (chatHistory.length > 10) chatHistory.shift();

    isProcessing = true;

    try {
      const response = await generateContent(chatHistory);

      chatHistory.push({
        role: "model",
        parts: [{ text: response }]
      });

      socket.emit("ai-response", response);
    } catch (err) {
      console.error("Socket Error:", err.message);
      socket.emit("ai-error", "AI is busy or model is loading. Try again in 10 seconds.");
    } finally {
      isProcessing = false;
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 HF Key check: ${process.env.HF_API_KEY ? "Found" : "Missing"}`);
});