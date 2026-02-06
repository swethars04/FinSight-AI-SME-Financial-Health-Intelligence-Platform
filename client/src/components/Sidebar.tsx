import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, PieChart, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/reports", label: "Reports", icon: PieChart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen border-r border-border bg-card hidden md:flex flex-col fixed left-0 top-0 z-20 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-display">FinHealth AI</h1>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div 
                  className="sidebar-link cursor-pointer" 
                  data-active={isActive}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {link.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
