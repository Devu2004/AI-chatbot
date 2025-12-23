const { HfInference } = require("@huggingface/inference");
// require("dotenv").config();

const hf = new HfInference(process.env.HF_API_KEY);

async function generateContent(chatHistory) {
  try {
    console.log("🚀 Sending request to Stable HF Provider...");

    const formattedMessages = chatHistory.map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.parts[0].text
    }));

    const response = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct", 
      messages: formattedMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    if (response.choices && response.choices[0].message) {
      const aiResponse = response.choices[0].message.content;
      console.log("✅ HF RESPONSE:", aiResponse);
      return aiResponse;
    }

    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("HF SDK Error:", error.message);

    if (error.message.includes("HTTP error") || error.message.includes("provider")) {
      return "System is a bit busy right now. Please try sending your message again in a moment.";
    }

    if (error.message.includes("loading")) {
      return "Model is starting up... please wait a few seconds.";
    }
    
    throw error;
  }
}

module.exports = generateContent;