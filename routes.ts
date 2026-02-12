import type { Express, Request, Response } from "express";
import { openai } from "./client";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import multer from "multer";
import { toFile } from "openai";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export function registerImageRoutes(app: Express): void {
  app.use("/uploads", (req, res, next) => {
    if (req.path.endsWith(".mp4")) {
      res.setHeader("Content-Type", "video/mp4");
    } else {
      res.setHeader("Content-Disposition", "attachment");
    }
    next();
  }, express.static(uploadsDir));

  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt, size = "1024x1024" } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: size as "1024x1024" | "512x512" | "256x256",
      });

      const imageData = response.data?.[0];
      if (!imageData) {
        return res.status(500).json({ error: "No image data returned" });
      }
      const base64Data = imageData.b64_json;

      if (base64Data) {
        const fileName = `meaningl_${Date.now()}.png`;
        const filePath = path.join(uploadsDir, fileName);
        const buffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(filePath, buffer);

        res.json({
          url: imageData.url,
          b64_json: base64Data,
          download: `/uploads/${fileName}`,
        });
      } else {
        res.json({
          url: imageData.url,
          b64_json: imageData.b64_json,
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  app.post("/api/edit-image", imageUpload.single("image"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const prompt = req.body.prompt;

      if (!file) {
        return res.status(400).json({ error: "Vui lòng tải lên một ảnh." });
      }
      if (!prompt) {
        return res.status(400).json({ error: "Vui lòng nhập yêu cầu chỉnh sửa." });
      }

      const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedMimes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Chỉ hỗ trợ ảnh PNG, JPG hoặc WebP." });
      }

      const imageFile = await toFile(Buffer.from(file.buffer), file.originalname || "image.png", {
        type: "image/png",
      });

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt,
      });

      const imageData = response.data?.[0];
      if (!imageData) {
        return res.status(500).json({ error: "Không nhận được ảnh từ AI." });
      }

      const base64Data = imageData.b64_json;
      if (base64Data) {
        const fileName = `meaningl_edit_${Date.now()}.png`;
        const filePath = path.join(uploadsDir, fileName);
        const buffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(filePath, buffer);

        res.json({
          b64_json: base64Data,
          download: `/uploads/${fileName}`,
        });
      } else {
        res.json({
          url: imageData.url,
        });
      }
    } catch (error) {
      console.error("Error editing image:", error);
      res.status(500).json({ error: "Không thể chỉnh sửa ảnh. Vui lòng thử lại." });
    }
  });
}

