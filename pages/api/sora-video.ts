import type { NextApiRequest, NextApiResponse } from "next";
// import { generateSoraVideo } from "@/lib/openai"; // Uncomment if you have real Sora API

export const config = {
  api: { responseLimit: "32mb" }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    // const video = await generateSoraVideo(prompt);
    // const videoBuffer = Buffer.from(await video.arrayBuffer());
    // res.setHeader("Content-Type", "video/mp4");
    // res.setHeader("Content-Disposition", "inline; filename=sora.mp4");
    // res.status(200).send(videoBuffer);

    // Stub: return dummy response
    res.status(200).json({ url: "https://dummyvideo.com/video.mp4", note: "Replace with real Sora video stream" });
  } catch (err: any) {
    res.status(500).json({ error: "Sora video generation failed", details: err.message });
  }
}