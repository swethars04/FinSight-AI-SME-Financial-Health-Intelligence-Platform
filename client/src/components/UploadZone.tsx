import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, AlertCircle, Loader2 } from "lucide-react";
import { useUploadFile } from "@/hooks/use-files";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const { mutate: uploadFile, isPending } = useUploadFile();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    uploadFile(formData, {
      onError: (err) => setError(err.message),
    });
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isPending
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-out cursor-pointer text-center",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          isPending && "opacity-60 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              {isPending ? "Uploading..." : isDragActive ? "Drop file here" : "Upload Financial Document"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Drag & drop CSV, Excel or PDF files here, or click to browse.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
