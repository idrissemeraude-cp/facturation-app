"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeft, Download, Printer, Send, Edit, FileText } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
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

  // Données fictives pour la démo
  const invoice = {
    number: "FAC-2024-001",
    status: "paid",
    issueDate: "01/10/2024",
    dueDate: "15/10/2024",
    client: {
      name: "TechAfrica Studio",
      email: "contact@techafrica.com",
      address: "Plateau, Dakar, Sénégal",
      taxId: "SN-DKR-12345"
    },
    company: {
      name: "iziFacture",
      email: "contact@izifacture.com",
      address: "Almadies, Dakar, Sénégal",
      taxId: "SN-DKR-67890"
    },
    items: [
      { id: 1, description: "Création de site vitrine", quantity: 1, price: 300000 },
      { id: 2, description: "Hébergement annuel", quantity: 1, price: 50000 },
      { id: 3, description: "Maintenance mensuelle", quantity: 3, price: 25000 }
    ],
    notes: "Merci pour votre confiance. Paiement reçu le 10/10/2024."
  };

  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12" ref={container}>
      {/* Header & Actions */}
      <div className="gsap-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{invoice.number}</h1>
              <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Payée
              </span>
            </div>
            <p className="text-slate-500 mt-1">Client: {invoice.client.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Imprimer">
            <Printer className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
            <Send className="w-4 h-4" />
            Envoyer
          </button>
        </div>
      </div>

      {/* Invoice Document Preview */}
      <div className="gsap-reveal bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-none print:m-0">
        <div className="p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-200 pb-8">
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-2xl mb-4">
                i
              </div>
              <h2 className="text-lg font-bold text-slate-900">{invoice.company.name}</h2>
              <div className="text-slate-500 text-sm mt-1 space-y-0.5">
                <p>{invoice.company.address}</p>
                <p>{invoice.company.email}</p>
                <p>NINEA: {invoice.company.taxId}</p>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-4">Facture</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="font-medium text-slate-500">N° Facture :</div>
                <div className="font-bold text-slate-900">{invoice.number}</div>
                
                <div className="font-medium text-slate-500">Date :</div>
                <div className="text-slate-900">{invoice.issueDate}</div>
                
                <div className="font-medium text-slate-500">Échéance :</div>
                <div className="text-slate-900">{invoice.dueDate}</div>
              </div>
            </div>
          </div>

          <div className="py-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Facturé à</h3>
            <h2 className="text-lg font-bold text-slate-900">{invoice.client.name}</h2>
            <div className="text-slate-500 text-sm mt-1 space-y-0.5">
              <p>{invoice.client.address}</p>
              <p>{invoice.client.email}</p>
              <p>NINEA: {invoice.client.taxId}</p>
            </div>
          </div>

          <div className="mt-4">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 font-medium">Description</th>
                  <th className="py-3 font-medium text-center">Quantité</th>
                  <th className="py-3 font-medium text-right">Prix Unitaire</th>
                  <th className="py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 text-slate-900">{item.description}</td>
                    <td className="py-4 text-slate-900 text-center">{item.quantity}</td>
                    <td className="py-4 text-slate-900 text-right">{item.price.toLocaleString()}</td>
                    <td className="py-4 text-slate-900 font-medium text-right">{(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-8">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>TVA (18%)</span>
                <span>{tax.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total TTC</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
