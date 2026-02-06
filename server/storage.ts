import { db } from "./db";
import { 
  financialRecords, analysisResults,
  type FinancialRecord, type InsertFinancialRecord,
  type AnalysisResult, type InsertAnalysisResult,
  type FinancialRecordWithAnalysis
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Financial Records
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  getFinancialRecords(userId: string): Promise<FinancialRecordWithAnalysis[]>;
  getFinancialRecord(id: number): Promise<FinancialRecord | undefined>;
  updateFinancialRecordStatus(id: number, status: string): Promise<FinancialRecord>;
  
  // Analysis Results
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResult(recordId: number): Promise<AnalysisResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    const [newRecord] = await db.insert(financialRecords).values(record).returning();
    return newRecord;
  }

  async getFinancialRecords(userId: string): Promise<FinancialRecordWithAnalysis[]> {
    const records = await db.select()
      .from(financialRecords)
      .where(eq(financialRecords.userId, userId))
      .orderBy(desc(financialRecords.uploadDate));
      
    // Fetch analysis for each record
    const results = await Promise.all(records.map(async (record) => {
      const analysis = await this.getAnalysisResult(record.id);
      return { ...record, analysis };
    }));
    
    return results;
  }

  async getFinancialRecord(id: number): Promise<FinancialRecord | undefined> {
    const [record] = await db.select().from(financialRecords).where(eq(financialRecords.id, id));
    return record;
  }

  async updateFinancialRecordStatus(id: number, status: string): Promise<FinancialRecord> {
    const [updated] = await db.update(financialRecords)
      .set({ status })
      .where(eq(financialRecords.id, id))
      .returning();
    return updated;
  }

  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const [newResult] = await db.insert(analysisResults).values(result).returning();
    return newResult;
  }

  async getAnalysisResult(recordId: number): Promise<AnalysisResult | undefined> {
    const [result] = await db.select()
      .from(analysisResults)
      .where(eq(analysisResults.recordId, recordId))
      .orderBy(desc(analysisResults.createdAt))
      .limit(1);
    return result;
  }
}

export const storage = new DatabaseStorage();
