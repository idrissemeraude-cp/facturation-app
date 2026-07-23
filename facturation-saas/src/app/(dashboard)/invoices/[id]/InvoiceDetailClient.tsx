"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, Download, Printer, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { updateInvoiceStatus } from "@/app/actions/invoices";
import { useRouter } from "next/navigation";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type InvoiceData = {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
};

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Payée", color: "bg-green-100 text-green-700" },
  sent: { label: "Envoyée", color: "bg-orange-100 text-orange-700" },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  overdue: { label: "En retard", color: "bg-red-100 text-red-700" },
  draft: { label: "Brouillon", color: "bg-slate-100 text-slate-700" },
  cancelled: { label: "Annulée", color: "bg-gray-100 text-gray-500" },
};

const statusOptions = ["draft", "pending", "sent", "paid", "overdue", "cancelled"];

export default function InvoiceDetailClient({ invoice }: { invoice: InvoiceData }) {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(invoice.status);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  // Issuer from localStorage
  const [issuer, setIssuer] = useState({ companyName: "iziFacture", email: "", phone: "", address: "", taxNumber: "" });
  useEffect(() => {
    const saved = localStorage.getItem("invoiceIssuerSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setIssuer({ companyName: parsed.companyName || "iziFacture", email: parsed.email || "", phone: parsed.phone || "", address: parsed.address || "", taxNumber: parsed.taxNumber || "" });
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-reveal", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
    }, container);
    return () => ctx.revert();
  }, []);

  const handleStatusChange = (newStatus: string) => {
    setIsStatusOpen(false);
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoice.id, newStatus);
      if (result.success) {
        setCurrentStatus(newStatus);
        setStatusSuccess(true);
        setTimeout(() => setStatusSuccess(false), 2000);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const conf = statusConfig[currentStatus] || statusConfig.draft;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12" ref={container}>
      {/* Header & Actions */}
      <div className="gsap-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{invoice.number}</h1>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${conf.color}`}>
                {conf.label}
              </span>
              {statusSuccess && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Statut mis à jour
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-1">Client : {invoice.client.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            title="Imprimer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Changer le statut
              <ChevronDown className="w-4 h-4" />
            </button>
            {isStatusOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {statusOptions.map((s) => {
                  const sc = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center justify-between transition-colors ${s === currentStatus ? "bg-slate-50" : ""}`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                      {s === currentStatus && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="gsap-reveal bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 md:p-12">

          {/* Company + Invoice header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-200 pb-8">
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-2xl mb-4">i</div>
              <h2 className="text-lg font-bold text-slate-900">{issuer.companyName}</h2>
              <div className="text-slate-500 text-sm mt-1 space-y-0.5">
                {issuer.address && <p>{issuer.address}</p>}
                {issuer.email && <p>{issuer.email}</p>}
                {issuer.phone && <p>{issuer.phone}</p>}
                {issuer.taxNumber && <p>NINEA : {issuer.taxNumber}</p>}
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-4">Facture</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="font-medium text-slate-500">N° Facture :</div>
                <div className="font-bold text-slate-900">{invoice.number}</div>
                <div className="font-medium text-slate-500">Date :</div>
                <div className="text-slate-900">{invoice.issueDate}</div>
                <div className="font-medium text-slate-500">Échéance :</div>
                <div className="text-slate-900">{invoice.dueDate}</div>
                <div className="font-medium text-slate-500">Statut :</div>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${conf.color}`}>{conf.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="py-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Facturé à</h3>
            <h2 className="text-lg font-bold text-slate-900">{invoice.client.name}</h2>
            <div className="text-slate-500 text-sm mt-1 space-y-0.5">
              {invoice.client.address && <p>{invoice.client.address}</p>}
              {invoice.client.email && <p>{invoice.client.email}</p>}
              {invoice.client.phone && <p>{invoice.client.phone}</p>}
            </div>
          </div>

          {/* Items table */}
          <div className="mt-4">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 font-medium">Description</th>
                  <th className="py-3 font-medium text-center">Qté</th>
                  <th className="py-3 font-medium text-right">Prix Unitaire</th>
                  <th className="py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 text-slate-900">{item.description}</td>
                    <td className="py-4 text-slate-900 text-center">{item.quantity}</td>
                    <td className="py-4 text-slate-900 text-right">{item.unit_price.toLocaleString("fr-FR")} FCFA</td>
                    <td className="py-4 text-slate-900 font-medium text-right">{item.total_price.toLocaleString("fr-FR")} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-8">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Sous-total HT</span>
                <span>{invoice.subtotal.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>TVA (18%)</span>
                <span>{invoice.taxAmount.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-slate-900 pt-3 border-t-2 border-slate-900">
                <span>Total TTC</span>
                <span>{invoice.totalAmount.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer facture */}
          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
            Facture générée par iziFacture — Merci de votre confiance.
          </div>

        </div>
      </div>
    </div>
  );
}
