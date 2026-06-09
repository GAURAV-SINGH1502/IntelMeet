import express from "express";

const router = express.Router();

router.post(
  "/summary",
  async (req, res) => {

    try {

      const { messages } = req.body;

      const prompt = `
Summarize this meeting in concise bullet points:

${messages.join("\n")}
`;

      const response =
        await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini",

              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
            }),
          }
        );

      const data =
        await response.json();

      if (!data.choices) {

  console.log(
    "OpenRouter Error:",
    data
  );

  return res.status(500).json({
    message:
      data.error?.message ||
      "AI response failed",
  });
console.log(data);
}

const summary =
  data.choices[0]
    .message.content;

      res.json({
        summary,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });

    }

  }
);

export default router;