// const { GoogleGenAI } = require("@google/genai");
// const ai = new GoogleGenAI({
// });
// async function generateContent(chatHistory){
//     const response = await ai.models.generateContent({
//         model:"gemini-2.0-flash",
//         contents:chatHistory,
//     })
//     return response.text
// }
// module.exports = generateContent;

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateContent(chatHistory) {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  let retries = 2;
  while (retries--) {
    try {
      const result = await model.generateContent({
        contents: chatHistory
      });

      return result.response.text();
    } catch (err) {
      if (err.status === 429) {
        await new Promise(res => setTimeout(res, 1200));
        continue;
      }
      throw err;
    }
  }

  return "The system is busy. Please try again in a moment.";
}

module.exports = generateContent;
