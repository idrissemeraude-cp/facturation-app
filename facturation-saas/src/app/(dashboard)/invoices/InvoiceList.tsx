"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, MoreHorizontal, FileEdit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

type Invoice = {
  id: string;
  number: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
};

const statusConfig = {
  paid: { label: 'Payée', color: 'bg-green-100 text-green-700' },
  sent: { label: 'Envoyée', color: 'bg-orange-100 text-orange-700' },
  overdue: { label: 'En retard', color: 'bg-red-100 text-red-700' },
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700' },
};

export default function InvoiceList({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-reveal", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, container);
    return () => ctx.revert();
  }, []);

  const [activeTab, setActiveTab] = useState<string>('all');
  
  const tabs = [
    { id: 'all', label: 'Toutes les factures' },
    { id: 'draft', label: 'Brouillons' },
    { id: 'sent', label: 'Envoyées' },
    { id: 'paid', label: 'Payées' },
    { id: 'overdue', label: 'En retard' },
  ];

  const filteredInvoices = invoices.filter(inv => activeTab === 'all' || inv.status === activeTab);

  return (
    <div className="space-y-6" ref={container}>
      <div className="gsap-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Factures</h1>
          <p className="text-slate-500 mt-1">Gérez vos factures et suivez vos paiements.</p>
        </div>
        <Link href="/invoices/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Link>
      </div>

      <div className="gsap-reveal bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par client ou N°..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">N° Facture</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Échéance</th>
                <th className="px-6 py-4 font-medium text-right">Montant (FCFA)</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map((invoice) => {
                const conf = statusConfig[invoice.status as keyof typeof statusConfig];
                return (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.number}</td>
                    <td className="px-6 py-4 text-slate-700">{invoice.client}</td>
                    <td className="px-6 py-4 text-slate-500">{invoice.issueDate}</td>
                    <td className="px-6 py-4 text-slate-500">{invoice.dueDate}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium text-right">{invoice.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${conf.color}`}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="Modifier">
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Aucune facture trouvée pour ce statut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination basique */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <div>Affichage de {filteredInvoices.length} facture(s)</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
