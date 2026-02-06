import { DashboardLayout } from "@/components/DashboardLayout";
import { useFiles } from "@/hooks/use-files";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Share2, AlertTriangle, Lightbulb, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function Reports() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const fileId = searchParams.get("fileId");
  const { data: files } = useFiles();

  const selectedFile = files?.find(f => f.id === Number(fileId)) || files?.[0];
  const analysis = selectedFile?.analysis;

  // Function to handle file selection change
  const handleFileChange = (id: string) => {
    setLocation(`/reports?fileId=${id}`);
  };

  const radarData = [
    { subject: 'Liquidity', A: 80, fullMark: 100 },
    { subject: 'Profitability', A: analysis?.healthScore || 65, fullMark: 100 },
    { subject: 'Solvency', A: 70, fullMark: 100 },
    { subject: 'Efficiency', A: 90, fullMark: 100 },
    { subject: 'Growth', A: 55, fullMark: 100 },
  ];

  const barData = [
    { name: 'Revenue', amount: analysis?.metrics?.revenue || 0 },
    { name: 'Expenses', amount: analysis?.metrics?.expenses || 0 },
    { name: 'Profit', amount: analysis?.metrics?.netProfit || 0 },
  ];

  if (!files?.length) {
    return (
      <DashboardLayout title="Financial Reports">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-muted p-6 rounded-full mb-4">
            <TrendingUp className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Reports Available</h2>
          <p className="text-muted-foreground mb-6">Upload and analyze a document to generate your first report.</p>
          <Button onClick={() => setLocation("/documents")}>Go to Documents</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Financial Reports" 
      description="Deep dive into your financial health and AI-generated insights."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Report Selector */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Viewing Report For:</span>
            <Select 
              value={selectedFile?.id.toString()} 
              onValueChange={handleFileChange}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {files.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.fileName} {f.analysis ? "(Analyzed)" : "(Pending)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {analysis && (
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-muted-foreground">Health Score:</span>
               <span className="text-lg font-bold text-primary">{analysis.healthScore}/100</span>
            </div>
          )}
        </div>

        {!analysis ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">Select an analyzed document to view reports.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-6"
          >
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-100 dark:border-blue-900/30">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-2">${analysis.metrics?.revenue?.toLocaleString() || 0}</h3>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-100 dark:border-red-900/30">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</p>
                  <h3 className="text-2xl font-bold mt-2">${analysis.metrics?.expenses?.toLocaleString() || 0}</h3>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900/30">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Net Profit</p>
                  <h3 className="text-2xl font-bold mt-2">${analysis.metrics?.netProfit?.toLocaleString() || 0}</h3>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-100 dark:border-purple-900/30">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Cash Flow</p>
                  <h3 className="text-2xl font-bold mt-2">${analysis.metrics?.cashFlow?.toLocaleString() || 0}</h3>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Dimensions</CardTitle>
                  <CardDescription>Multi-dimensional analysis of your business health.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Business"
                          dataKey="A"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.4}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))'
                          }} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Breakdown</CardTitle>
                  <CardDescription>Comparison of key financial metrics.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))'
                          }}
                        />
                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <CardTitle>Risk Assessment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.risks?.map((risk, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <span className="text-muted-foreground">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-500" />
                    <CardTitle>Growth Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.opportunities?.map((opp, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <span className="text-muted-foreground">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{analysis.aiNarrative}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
