import { Router } from "express";
import OpenAI from "openai";

const router = Router();

router.post("/ai", async (req, res, next) => {
  try {
    const { action, content } = req.body as { action: string; content: string };

    if (!action || !content) {
      res.status(400).json({ error: "action and content are required" });
      return;
    }

    const client = new OpenAI({
      baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
      apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
    });

    const prompts: Record<string, string> = {
      summarize: `Summarize the following note in 2-3 concise sentences. Be direct and clear:\n\n${content}`,
      cleanup: `Clean up and improve the following note for clarity, grammar, and structure. Return only the improved text:\n\n${content}`,
      "to-tasks": `Convert the following note into a list of specific, actionable tasks. Return each task on a new line starting with "• ":\n\n${content}`,
      outline: `Turn the following rough idea into a clear, structured outline with main headings and sub-points:\n\n${content}`,
    };

    const prompt = prompts[action];
    if (!prompt) {
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: completion.choices[0]?.message?.content ?? "" });
  } catch (err) {
    next(err);
  }
});

export default router;
