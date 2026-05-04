import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const PROMPTS: Record<string, (content: string) => string> = {
  summarize: (c) =>
    `Summarize the following note in 2-3 concise sentences. Be direct and clear:\n\n${c}`,
  cleanup: (c) =>
    `Clean up and improve the following note for clarity, grammar, and structure. Return only the improved text:\n\n${c}`,
  "to-tasks": (c) =>
    `Convert the following note into a list of specific, actionable tasks. Return each task on a new line starting with "• ":\n\n${c}`,
  outline: (c) =>
    `Turn the following rough idea into a clear, structured outline with main headings and sub-points:\n\n${c}`,
  expand: (c) =>
    `Take the following brief note or idea and expand it into a rich, detailed, well-structured note. Add context, examples, and insights. Return only the expanded content:\n\n${c}`,
  "key-points": (c) =>
    `Extract the most important key points from the following note. Return each point on a new line starting with "→ ". Be concise:\n\n${c}`,
  title: (c) =>
    `Generate 3 creative, descriptive titles for the following note. Return each title on a new line numbered 1. 2. 3. Keep titles under 8 words each:\n\n${c}`,
  brainstorm: (c) =>
    `Based on the following note or idea, brainstorm 8-10 related ideas, angles, or extensions. Return each idea on a new line starting with "💡 ":\n\n${c}`,
  "fix-grammar": (c) =>
    `Fix the grammar, spelling, and punctuation in the following text. Return only the corrected text, keeping the same style and meaning:\n\n${c}`,
  "meeting-notes": (c) =>
    `Format the following raw meeting notes into a clean, professional structure with: Summary, Attendees (if mentioned), Key Decisions, Action Items, and Next Steps:\n\n${c}`,
};

router.post("/ai", async (req, res, next) => {
  try {
    const { action, content } = req.body as { action: string; content: string };

    if (!action || !content) {
      res.status(400).json({ error: "action and content are required" });
      return;
    }

    const promptFn = PROMPTS[action];
    if (!promptFn) {
      res.status(400).json({ error: "Invalid action" });
      return;
    }

    const client = new OpenAI({
      baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
      apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptFn(content) }],
    });

    res.json({ result: completion.choices[0]?.message?.content ?? "" });
  } catch (err) {
    next(err);
  }
});

export default router;
