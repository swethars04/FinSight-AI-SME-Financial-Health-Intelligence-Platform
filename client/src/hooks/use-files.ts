import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { FinancialRecord, AnalysisResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch list of files
export function useFiles() {
  return useQuery({
    queryKey: [api.files.list.path],
    queryFn: async () => {
      const res = await fetch(api.files.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch files");
      return api.files.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch single file with analysis
export function useFile(id: number) {
  return useQuery({
    queryKey: [api.files.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.files.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch file");
      return api.files.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Upload file
export function useUploadFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.files.upload.path, {
        method: api.files.upload.method,
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Upload failed");
      }
      return api.files.upload.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      toast({
        title: "File Uploaded",
        description: "Your financial document has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete file
export function useDeleteFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.files.delete.path, { id });
      const res = await fetch(url, { 
        method: api.files.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete file");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      toast({
        title: "File Deleted",
        description: "The document has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch analysis for a file
export function useAnalysis(fileId: number) {
  return useQuery({
    queryKey: [api.analysis.get.path, fileId],
    queryFn: async () => {
      const url = buildUrl(api.analysis.get.path, { id: fileId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch analysis");
      return api.analysis.get.responses[200].parse(await res.json());
    },
    enabled: !!fileId,
  });
}

// Trigger analysis
export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fileId: number) => {
      const url = buildUrl(api.analysis.create.path, { id: fileId });
      const res = await fetch(url, { 
        method: api.analysis.create.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to start analysis");
      return await res.json();
    },
    onSuccess: (_, fileId) => {
      // Invalidate both file list (for status update) and specific analysis
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analysis.get.path, fileId] });
      toast({
        title: "Analysis Started",
        description: "AI is processing your document. This may take a moment.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
