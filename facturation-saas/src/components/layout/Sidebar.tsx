import Link from "next/link";
import { LayoutDashboard, FileText, Users, Settings, Mail, Phone, HelpCircle } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Paramètres", icon: Settings },
  { href: "/help", label: "Support et Aide", icon: HelpCircle },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar text-slate-300 h-screen hidden md:flex flex-col border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
            i
          </div>
          <span className="text-white font-bold text-xl tracking-tight">iziFacture</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
            ZC
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium text-white truncate">Zeina Cheikh</div>
            <div className="text-xs text-slate-400 truncate">Administrateur</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
