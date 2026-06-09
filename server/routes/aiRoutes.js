import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

router.post(
  "/summary",
  async (req, res) => {
    try {

      const { messages } = req.body;

      const model =
        genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });

      const prompt = `
Summarize the following meeting discussion in concise bullet points.

Messages:
${messages.join("\n")}
`;

      const result =
        await model.generateContent(
          prompt
        );

      const summary =
        result.response.text();

      res.json({
        summary,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Failed to generate summary",
      });

    }
  }
);

export default router;