import type { NextApiRequest, NextApiResponse } from "next";
import { generateTTS } from "@/lib/openai";

export const config = {
  api: { responseLimit: "8mb" }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const speech = await generateTTS(text);
    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=tts.mp3");
    res.status(200).send(audioBuffer);
  } catch (err: any) {
    res.status(500).json({ error: "TTS generation failed", details: err.message });
  }
}