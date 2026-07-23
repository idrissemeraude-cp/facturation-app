"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 pl-14 md:pl-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
          iziFacture <span className="text-xs font-normal text-slate-400">SaaS</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Link>
      </div>
    </header>
  );
}
