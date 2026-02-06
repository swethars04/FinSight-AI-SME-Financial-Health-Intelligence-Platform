import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFiles } from "@/hooks/use-files";
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: files, isLoading } = useFiles();

  // Mock data for charts if no analysis exists
  const chartData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 34000 },
    { month: "Mar", revenue: 48000, expenses: 31000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 41000 },
  ];

  // Calculate stats from latest analyzed file or use defaults
  const latestAnalyzed = files?.find(f => f.analysis?.metrics);
  const metrics = latestAnalyzed?.analysis?.metrics;

  const stats = [
    {
      label: "Total Revenue",
      value: metrics?.revenue ? `$${metrics.revenue.toLocaleString()}` : "$0",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Expenses",
      value: metrics?.expenses ? `$${metrics.expenses.toLocaleString()}` : "$0",
      change: "-2.4%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Net Profit",
      value: metrics?.netProfit ? `$${metrics.netProfit.toLocaleString()}` : "$0",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Health Score",
      value: latestAnalyzed?.analysis?.healthScore ? `${latestAnalyzed.analysis.healthScore}/100` : "--",
      change: "Stable",
      trend: "neutral",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <DashboardLayout title="Financial Overview" description="Welcome back to your financial health dashboard.">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={item}>
              <Card className="hover:shadow-lg transition-all duration-300 border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    {stat.trend === "up" ? (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {stat.change}
                      </span>
                    ) : stat.trend === "down" ? (
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> {stat.change}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                    {isLoading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground font-display">{stat.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="h-full border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                      <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Insights */}
          <motion.div variants={item}>
            <Card className="h-full border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestAnalyzed?.analysis?.risks?.slice(0, 2).map((risk, i) => (
                    <div key={`risk-${i}`} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-200">{risk}</p>
                    </div>
                  ))}
                  {latestAnalyzed?.analysis?.opportunities?.slice(0, 2).map((opp, i) => (
                    <div key={`opp-${i}`} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30 flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800 dark:text-green-200">{opp}</p>
                    </div>
                  ))}
                  
                  {!latestAnalyzed && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No analysis data available yet.</p>
                      <p className="text-sm mt-1">Upload a document to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
