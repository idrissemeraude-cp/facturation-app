"use client";

import React, { useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import gsap from "gsap";

type DashboardProps = {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  pendingCount: number;
  recentInvoices: any[];
  monthlyData: any[];
};

const statusConfig = {
  paid: { label: 'Payée', color: 'bg-green-100 text-green-700' },
  sent: { label: 'Envoyée', color: 'bg-orange-100 text-orange-700' },
  overdue: { label: 'En retard', color: 'bg-red-100 text-red-700' },
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700' },
};

export default function DashboardClient({
  totalInvoices,
  totalAmount,
  totalPaid,
  totalPending,
  pendingCount,
  recentInvoices,
  monthlyData
}: DashboardProps) {
  const container = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-6" ref={container}>
      <div className="gsap-reveal flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bonjour 👋</h1>
          <p className="text-slate-500 mt-1">Voici un résumé de votre facturation ce mois-ci.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500">Total Factures</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalInvoices}</div>
          <p className="text-sm text-slate-500 mt-1"><span className="text-green-600 font-medium">+12%</span> ce mois</p>
        </div>

        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500">Montant Facturé</h3>
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalAmount.toLocaleString()} <span className="text-sm font-medium text-slate-500">FCFA</span></div>
          <p className="text-sm text-slate-500 mt-1"><span className="text-green-600 font-medium">+8%</span> ce mois</p>
        </div>

        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500">Montant Payé</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPaid.toLocaleString()} <span className="text-sm font-medium text-slate-500">FCFA</span></div>
          <p className="text-sm text-slate-500 mt-1">71% de recouvrement</p>
        </div>

        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-500">En attente</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPending.toLocaleString()} <span className="text-sm font-medium text-slate-500">FCFA</span></div>
          <p className="text-sm text-slate-500 mt-1">{pendingCount} factures en attente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="gsap-reveal lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-6 text-slate-900">Revenus annuels (FCFA)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="gsap-reveal p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Factures récentes</h3>
            <button className="text-sm text-primary font-medium hover:underline">Voir tout</button>
          </div>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => {
              const conf = statusConfig[invoice.status as keyof typeof statusConfig];
              return (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-medium text-slate-900">{invoice.client}</div>
                    <div className="text-xs text-slate-500">{invoice.number} • {invoice.issueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-900">{invoice.total?.toLocaleString()} FCFA</div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${conf.color}`}>
                      {conf.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
