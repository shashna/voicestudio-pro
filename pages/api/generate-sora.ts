import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { scenes } = req.body;
  if (!scenes || !Array.isArray(scenes)) {
    return res.status(400).json({ error: "Missing or invalid scenes" });
  }

  const prompt = `
For each scene chunk of a narration, generate a vivid, detailed visual description suitable as a prompt for an AI video generation model (like Sora). 
The prompt should visually represent the text, without mentioning narration or the script. 
Output as JSON array: 
[
  { "scene": 1, "prompt": "..." },
  ...
]
Scenes: 
${JSON.stringify(scenes, null, 2)}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0].message.content!);
    res.status(200).json({ prompts: parsed });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate prompts", details: err.message });
  }
}