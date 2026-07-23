"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, HelpCircle, LogOut, X, Menu } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
  { href: "/help", label: "Support et Aide", icon: HelpCircle },
];

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "??";

  const displayEmail = userEmail || "utilisateur@email.com";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
            i
          </div>
          <span className="text-white font-bold text-xl tracking-tight">iziFacture</span>
        </div>
        <button 
          onClick={() => setIsOpenMobile(false)} 
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpenMobile(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-sm font-medium text-white truncate">{displayEmail}</div>
            <div className="text-xs text-slate-400">Compte actif</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Fixed Header Trigger */}
      <button 
        onClick={() => setIsOpenMobile(true)}
        className="md:hidden fixed top-3 left-4 z-40 p-2 bg-slate-900 text-white rounded-lg border border-slate-800 shadow-md"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)} 
          className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-slate-300 border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${isOpenMobile ? "translate-x-0" : "-translate-x-full"}`}>
        {navContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-sidebar text-slate-300 h-screen hidden md:flex flex-col border-r border-slate-800 shrink-0">
        {navContent}
      </aside>
    </>
  );
}
