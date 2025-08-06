import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";
import { mergeVideoAndAudio, concatVideos } from "@/lib/ffmpeg";

export const config = { api: { bodyParser: true, responseLimit: "100mb" } };

async function downloadFile(url: string, dest: string): Promise<void> {
  const writer = fs.createWriteStream(dest);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { scenes } = req.body;
  if (!scenes || !Array.isArray(scenes)) {
    return res.status(400).json({ error: "Missing or invalid scenes" });
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vspro-"));
  const mergedPaths: string[] = [];

  try {
    for (let i = 0; i < scenes.length; i++) {
      const { videoUrl, audioUrl } = scenes[i];
      const videoPath = path.join(tempDir, `video${i}.mp4`);
      const audioPath = path.join(tempDir, `audio${i}.mp3`);
      const mergedPath = path.join(tempDir, `merged${i}.mp4`);

      await downloadFile(videoUrl, videoPath);
      await downloadFile(audioUrl, audioPath);

      await mergeVideoAndAudio(videoPath, audioPath, mergedPath);
      mergedPaths.push(mergedPath);
    }

    const finalPath = path.join(tempDir, "final.mp4");
    await concatVideos(mergedPaths, finalPath);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", "attachment; filename=final.mp4");
    const stream = fs.createReadStream(finalPath);
    stream.pipe(res);

    stream.on("close", () => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  } catch (err: any) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    res.status(500).json({ error: "Stitching failed", details: err.message });
  }
}