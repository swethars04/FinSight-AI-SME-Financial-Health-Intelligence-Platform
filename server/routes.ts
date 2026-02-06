import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { openai } from "./replit_integrations/audio/client"; // Reusing the openai client from audio integration (it's the same client setup)

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // === File Upload ===
  app.post(api.files.upload.path, upload.single('file'), async (req, res) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id || (req.user as any).claims?.sub; // Handle Replit Auth user structure

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const content = req.file.buffer.toString('utf-8'); // Assume text-based for now (CSV, JSON)
      // TODO: Add PDF parsing logic here if needed using 'pdf-parse'
      
      const record = await storage.createFinancialRecord({
        userId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        content: content,
        status: "pending"
      });
      
      res.status(201).json(record);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // === List Files ===
  app.get(api.files.list.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = (req.user as any).id || (req.user as any).claims?.sub;

    const records = await storage.getFinancialRecords(userId);
    res.json(records);
  });

  // === Get Analysis ===
  app.get(api.analysis.get.path, async (req, res) => {
    const recordId = parseInt(req.params.id);
    const analysis = await storage.getAnalysisResult(recordId);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }
    res.json(analysis);
  });

  // === Trigger Analysis ===
  app.post(api.analysis.create.path, async (req, res) => {
    const recordId = parseInt(req.params.id);
    const record = await storage.getFinancialRecord(recordId);
    
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Start async processing
    // In a real app, this should be a background job. For now, we'll do it "fire and forget" style 
    // but keep it simple.
    
    // Update status to processing
    await storage.updateFinancialRecordStatus(recordId, "processing");
    
    res.status(202).json({ message: "Analysis started" });

    // Perform Analysis
    (async () => {
      try {
        const prompt = `
          Analyze the following financial data for an SME.
          Provide a JSON response with the following structure:
          {
            "metrics": {
              "revenue": number,
              "expenses": number,
              "netProfit": number,
              "cashFlow": number,
              "assets": number,
              "liabilities": number
            },
            "healthScore": number (0-100),
            "risks": ["string", "string"],
            "opportunities": ["string", "string"],
            "recommendations": ["string", "string"],
            "aiNarrative": "markdown string"
          }

          Data:
          ${record.content?.substring(0, 10000)} // Truncate if too long
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });

        const resultText = response.choices[0]?.message?.content || "{}";
        const resultJson = JSON.parse(resultText);

        await storage.createAnalysisResult({
          recordId,
          metrics: resultJson.metrics,
          healthScore: resultJson.healthScore,
          risks: resultJson.risks,
          opportunities: resultJson.opportunities,
          recommendations: resultJson.recommendations,
          aiNarrative: resultJson.aiNarrative
        });

        await storage.updateFinancialRecordStatus(recordId, "completed");

      } catch (error) {
        console.error("Analysis failed:", error);
        await storage.updateFinancialRecordStatus(recordId, "error");
      }
    })();
  });

  return httpServer;
}
