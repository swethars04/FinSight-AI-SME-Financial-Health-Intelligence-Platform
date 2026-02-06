import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Shield, BarChart3 } from "lucide-react";

export default function Auth() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Column - Hero */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-2xl">
              S
            </div>
            <span className="text-2xl font-bold font-display">FinHealth AI</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <h1 className="text-5xl font-bold font-display leading-tight">
            Master your business finances with AI
          </h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Upload your financial documents and get instant, actionable insights. 
            Identify risks, spot opportunities, and visualize your growth trajectory.
          </p>
          
          <div className="space-y-4 pt-4">
            {[
              "Instant financial health scoring",
              "Automated risk detection",
              "Growth opportunity analysis",
              "Exportable executive reports"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm opacity-60">
          © 2025 SME FinHealth AI. All rights reserved.
        </div>
      </div>

      {/* Right Column - Login */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2 lg:text-left">
            <h2 className="text-3xl font-bold font-display text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">
              Sign in to access your dashboard and reports.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-xl border border-border space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/5 text-primary border border-primary/10">
                <Shield className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">Secure</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/5 text-secondary border border-secondary/10">
                <BarChart3 className="w-8 h-8 mb-2" />
                <span className="text-xs font-semibold">Smart</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleLogin} 
                className="w-full h-12 text-base font-semibold btn-primary"
              >
                Log In with Replit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                By logging in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
