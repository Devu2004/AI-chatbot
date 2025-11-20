require('dotenv').config()
const app = require('./src/app')
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateContent = require('./src/service/ai.service');
const { log } = require('console');
const httpServer = createServer();
const io = new Server(httpServer, { 
  cors:{
    origin: "http://localhost:5173",
  }
 });
// inbuilt method - 1

const chatHistory = []
io.on("connection", (socket) => {
  console.log("User is Connected");

  // Cooldown flag per user
  let isProcessing = false;

socket.on("ai-message", async (data) => {
  if (!data?.prompt) return;

  // push user message
  chatHistory.push({
    role: "user",
    parts: [{ text: data.prompt }]
  });

  if (isProcessing) {
    socket.emit("ai-error", "Please wait… processing previous request.");
    return;
  }

  isProcessing = true;

  try {
    const response = await generateContent(chatHistory);

    // push model message
    chatHistory.push({
      role: "model",
      parts: [{ text: response }]
    });

    socket.emit("ai-response", response);
  } catch (err) {
    console.log("AI Error:", err);
    socket.emit("ai-error", "System is busy. Please try again in a moment.");
  } finally {
    setTimeout(() => (isProcessing = false), 1500);
  }
});
  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});


httpServer.listen(process.env.PORT,()=>{
    console.log(`Server is Runinng on port - ${process.env.PORT}`);
});