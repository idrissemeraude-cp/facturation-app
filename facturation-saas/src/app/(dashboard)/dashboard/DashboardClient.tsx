"use client";

import React, { useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

type DashboardProps = {
  userEmail?: string;
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  pendingCount: number;
  recoveryRate: number;
  recentInvoices: {
    id: string;
    number: string;
    client: string;
    total: number;
    status: string;
    issueDate: string;
  }[];
  monthlyData: { name: string; total: number }[];
};

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Payée", color: "bg-green-100 text-green-700" },
  sent: { label: "Envoyée", color: "bg-orange-100 text-orange-700" },
  overdue: { label: "En retard", color: "bg-red-100 text-red-700" },
  draft: { label: "Brouillon", color: "bg-slate-100 text-slate-700" },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Annulée", color: "bg-gray-100 text-gray-500" },
};

export default function DashboardClient({
  userEmail,
  totalInvoices,
  totalAmount,
  totalPaid,
  totalPending,
  pendingCount,
  recoveryRate,
  recentInvoices,
  monthlyData,
}: DashboardProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-reveal", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
    }, container);
    return () => ctx.revert();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const displayName = userEmail ? userEmail.split("@")[0] : "";

  return (
    <div className="space-y-6" ref={container}>
      {/* Welcome */}
      <div className="gsap-reveal flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting()}{displayName ? `, ${displayName}` : ""} 👋
          </h1>
          <p className="text-slate-500 mt-1">Voici un résumé de votre facturation.</p>
        </div>
        <Link
          href="/invoices/new"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm text-sm"
        >
          + Nouvelle facture
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500 text-sm">Total Factures</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalInvoices}</div>
          <p className="text-sm text-slate-500 mt-1">factures créées</p>
        </div>

        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500 text-sm">Montant Facturé</h3>
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalAmount.toLocaleString("fr-FR")}{" "}
            <span className="text-sm font-medium text-slate-500">FCFA</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">volume total</p>
        </div>

        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500 text-sm">Montant Encaissé</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalPaid.toLocaleString("fr-FR")}{" "}
            <span className="text-sm font-medium text-slate-500">FCFA</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            <span className={`font-semibold ${recoveryRate >= 70 ? "text-green-600" : "text-orange-600"}`}>
              {recoveryRate}%
            </span>{" "}
            de recouvrement
          </p>
        </div>

        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500 text-sm">En attente</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalPending.toLocaleString("fr-FR")}{" "}
            <span className="text-sm font-medium text-slate-500">FCFA</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{pendingCount} facture(s) en attente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="gsap-reveal lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Revenus — 12 derniers mois (FCFA)</h3>
          </div>
          <div className="h-64">
            {monthlyData.some(d => d.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={-10} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${Number(value ?? 0).toLocaleString("fr-FR")} FCFA`, "Revenus"] as any}
                  />
                  <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <TrendingUp className="w-10 h-10" />
                <p className="text-sm">Les données apparaîtront quand vous créez des factures.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Factures récentes</h3>
            <Link href="/invoices" className="text-sm text-primary font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => {
                const conf = statusConfig[invoice.status] || statusConfig.draft;
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-slate-900 group-hover:text-primary transition-colors">{invoice.client}</div>
                      <div className="text-xs text-slate-500">{invoice.number} · {invoice.issueDate}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="font-medium text-slate-900 text-sm">{invoice.total.toLocaleString("fr-FR")} FCFA</div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${conf.color}`}>
                        {conf.label}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Aucune facture pour l'instant.
                <br />
                <Link href="/invoices/new" className="text-primary font-medium hover:underline mt-2 inline-block">
                  Créer votre première facture →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
