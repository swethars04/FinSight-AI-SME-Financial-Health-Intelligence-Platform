import { z } from 'zod';
import { insertFinancialRecordSchema, financialRecords, analysisResults } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  files: {
    upload: {
      method: 'POST' as const,
      path: '/api/files',
      // Input is FormData (not strictly typed here but handled in backend)
      responses: {
        201: z.custom<typeof financialRecords.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/files',
      responses: {
        200: z.array(z.custom<typeof financialRecords.$inferSelect & { analysis?: typeof analysisResults.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/files/:id',
      responses: {
        200: z.custom<typeof financialRecords.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/files/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  analysis: {
    create: {
      method: 'POST' as const,
      path: '/api/files/:id/analyze',
      responses: {
        202: z.object({ message: z.string() }), // Accepted for processing
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/files/:id/analysis',
      responses: {
        200: z.custom<typeof analysisResults.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type FileResponse = z.infer<typeof api.files.upload.responses[201]>;
export type FileListResponse = z.infer<typeof api.files.list.responses[200]>;
export type AnalysisResponse = z.infer<typeof api.analysis.get.responses[200]>;
