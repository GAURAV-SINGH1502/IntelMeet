import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        message: "No meeting messages provided to summarize",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key is not configured on the server",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Attempt gemini-1.5-flash (widely supported) or gemini-2.0-flash
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `Summarize the following meeting discussion in concise, clear bullet points.
Meeting Chat Log:
${messages.join("\n")}
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return res.json({
      summary,
    });
  } catch (error) {
    console.error("AI Summary Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to generate AI summary",
    });
  }
});

export default router;