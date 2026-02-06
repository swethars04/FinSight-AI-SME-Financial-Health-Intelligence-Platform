import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Export auth models so they are included in migrations
export * from "./models/auth";
export * from "./models/chat"; // Export chat models if we want to use chat features

// === TABLE DEFINITIONS ===

export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth.users.id
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // 'csv', 'xlsx', 'pdf'
  uploadDate: timestamp("upload_date").defaultNow(),
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'error'
  content: text("content"), // Raw extracted text or stringified JSON
  fileUrl: text("file_url"), // URL if stored in object storage (optional for now, can store locally)
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  recordId: integer("record_id").notNull().references(() => financialRecords.id),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Structured Metrics
  metrics: jsonb("metrics").$type<{
    revenue?: number;
    expenses?: number;
    netProfit?: number;
    cashFlow?: number;
    assets?: number;
    liabilities?: number;
  }>(),
  
  healthScore: integer("health_score"), // 0-100
  
  // AI Insights
  risks: jsonb("risks").$type<string[]>(),
  opportunities: jsonb("opportunities").$type<string[]>(),
  recommendations: jsonb("recommendations").$type<string[]>(),
  
  // Full Narrative
  aiNarrative: text("ai_narrative"),
});

// === RELATIONS ===

export const financialRecordsRelations = relations(financialRecords, ({ one, many }) => ({
  analysis: one(analysisResults, {
    fields: [financialRecords.id],
    references: [analysisResults.recordId],
  }),
}));

export const analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  record: one(financialRecords, {
    fields: [analysisResults.recordId],
    references: [financialRecords.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertFinancialRecordSchema = createInsertSchema(financialRecords).omit({ 
  id: true, 
  uploadDate: true 
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;

// Request types
export type CreateFinancialRecordRequest = InsertFinancialRecord;
export type UpdateFinancialRecordRequest = Partial<InsertFinancialRecord>;

// Response types
export type FinancialRecordWithAnalysis = FinancialRecord & { analysis?: AnalysisResult };

// WebSocket Events
export const WS_EVENTS = {
  ANALYSIS_COMPLETE: 'analysis-complete',
  ANALYSIS_ERROR: 'analysis-error',
} as const;
