"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Search, Plus, Filter, FileEdit, Trash2, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { deleteInvoice } from "@/app/actions/invoices";

type Invoice = {
  id: string;
  number: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Payée", color: "bg-green-100 text-green-700" },
  sent: { label: "Envoyée", color: "bg-orange-100 text-orange-700" },
  overdue: { label: "En retard", color: "bg-red-100 text-red-700" },
  draft: { label: "Brouillon", color: "bg-slate-100 text-slate-700" },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Annulée", color: "bg-gray-100 text-gray-500" },
};

export default function InvoiceList({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-reveal", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, container);
    return () => ctx.revert();
  }, []);

  const tabs = [
    { id: "all", label: "Toutes" },
    { id: "draft", label: "Brouillons" },
    { id: "sent", label: "Envoyées" },
    { id: "pending", label: "En attente" },
    { id: "paid", label: "Payées" },
    { id: "overdue", label: "En retard" },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchTab = activeTab === "all" || inv.status === activeTab;
    const matchSearch =
      !search ||
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleDelete = (id: string, number: string) => {
    if (!confirm(`Supprimer la facture ${number} ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteInvoice(id);
      if (result.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      } else {
        alert(result.error || "Erreur lors de la suppression.");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6" ref={container}>
      <div className="gsap-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Factures</h1>
          <p className="text-slate-500 mt-1">Gérez vos factures et suivez vos paiements.</p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
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
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {tab.id !== "all" && (
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                  {invoices.filter(i => i.status === tab.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par client ou N°..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="text-sm text-slate-500 shrink-0">
            {filteredInvoices.length} facture(s) trouvée(s)
          </div>
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
                const conf = statusConfig[invoice.status] || statusConfig.draft;
                const isDeleting = deletingId === invoice.id;
                return (
                  <tr
                    key={invoice.id}
                    className={`hover:bg-slate-50 transition-colors group ${isDeleting ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.number}</td>
                    <td className="px-6 py-4 text-slate-700">{invoice.client}</td>
                    <td className="px-6 py-4 text-slate-500">{invoice.issueDate}</td>
                    <td className="px-6 py-4 text-slate-500">{invoice.dueDate}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium text-right">
                      {Number(invoice.amount).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${conf.color}`}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-1.5 text-slate-400 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                          title="Modifier le statut"
                        >
                          <FileEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id, invoice.number)}
                          disabled={isDeleting}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileEdit className="w-6 h-6" />
                      </div>
                      <div className="font-medium text-slate-600">Aucune facture trouvée</div>
                      <p className="text-sm">
                        {search ? "Essayez un autre terme de recherche." : "Créez votre première facture."}
                      </p>
                      {!search && (
                        <Link href="/invoices/new" className="text-sm text-primary font-medium hover:underline">
                          + Nouvelle facture
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <div>
            {filteredInvoices.length} résultat(s) · Total :{" "}
            <span className="font-semibold text-slate-900">
              {filteredInvoices.reduce((a, i) => a + Number(i.amount), 0).toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
