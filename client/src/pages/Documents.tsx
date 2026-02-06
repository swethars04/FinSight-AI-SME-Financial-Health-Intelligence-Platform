import { DashboardLayout } from "@/components/DashboardLayout";
import { UploadZone } from "@/components/UploadZone";
import { useFiles, useDeleteFile, useCreateAnalysis } from "@/hooks/use-files";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  FileText, Trash2, BarChart2, Loader2, CheckCircle, Clock 
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export default function Documents() {
  const { data: files, isLoading } = useFiles();
  const { mutate: deleteFile } = useDeleteFile();
  const { mutate: analyzeFile, isPending: isAnalyzing } = useCreateAnalysis();

  return (
    <DashboardLayout 
      title="Documents" 
      description="Manage your financial records and trigger AI analysis."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Upload New Record</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone />
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>File History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : files?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files?.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              {file.fileName}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.uploadDate && format(new Date(file.uploadDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {file.analysis ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle className="w-3.5 h-3.5" /> Analyzed
                              </div>
                            ) : file.status === "processing" ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                <Clock className="w-3.5 h-3.5" /> Pending
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              {file.analysis ? (
                                <Link href={`/reports?fileId=${file.id}`}>
                                  <Button size="sm" variant="outline" className="h-8">
                                    <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                                    View Report
                                  </Button>
                                </Link>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="h-8 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-none border-0"
                                  onClick={() => analyzeFile(file.id)}
                                  disabled={isAnalyzing}
                                >
                                  {isAnalyzing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                  ) : (
                                    <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                                  )}
                                  Analyze
                                </Button>
                              )}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete file?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{file.fileName}" and any associated analysis.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => deleteFile(file.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
