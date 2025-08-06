import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { inputText } = req.body;

  if (!inputText) return res.status(400).json({ error: "Missing inputText" });

  const prompt = `Split the following into 10-20 second chunks for video narration. Format as JSON:
[
  { "scene": 1, "text": "..." },
  ...
]

Text: ${inputText}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: "json"
    });

    const parsed = JSON.parse(completion.choices[0].message.content!);
    res.status(200).json({ scenes: parsed });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to chunk text", details: err.message });
  }
}