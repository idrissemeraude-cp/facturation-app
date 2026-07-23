"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { Printer, Mail, Plus, Trash2, ArrowLeft, Share2, MessageCircle, Download, Save, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { createInvoice } from "@/app/actions/invoices";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type InvoiceItem = {
  id: number;
  description: string;
  quantity: number;
  price: number;
};

interface NewInvoicePageClientProps {
  clients: Client[];
  suggestedNumber: string;
}

export default function NewInvoicePageClient({ clients, suggestedNumber }: NewInvoicePageClientProps) {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });
    }, container);
    return () => ctx.revert();
  }, []);

  const [invoiceNumber, setInvoiceNumber] = useState(suggestedNumber);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: "", quantity: 1, price: 0 }
  ]);

  // Infos émetteur depuis localStorage
  const [issuer, setIssuer] = useState({ companyName: "", email: "", phone: "", address: "" });
  useEffect(() => {
    const saved = localStorage.getItem("invoiceIssuerSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setIssuer({ companyName: parsed.companyName || "", email: parsed.email || "", phone: parsed.phone || "", address: parsed.address || "" });
    }
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handlePrint = () => window.print();

  const handleSave = () => {
    setSaveError(null);
    if (!selectedClientId) {
      setSaveError("Veuillez sélectionner un client.");
      return;
    }
    if (items.some(i => !i.description)) {
      setSaveError("Veuillez remplir la description de chaque ligne.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("client_id", selectedClientId);
      formData.set("invoice_number", invoiceNumber);
      formData.set("issue_date", issueDate);
      formData.set("due_date", dueDate);
      formData.set("notes", notes);

      const itemsFormatted = items.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.price,
        total_price: i.quantity * i.price,
      }));
      formData.set("items", JSON.stringify(itemsFormatted));

      const result = await createInvoice(formData);
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push("/invoices");
        }, 1200);
      }
    });
  };

  const handleWhatsApp = () => {
    const client = selectedClient?.name || "le client";
    const message = `Bonjour ${client}, veuillez trouver ci-joint votre facture ${invoiceNumber} d'un montant de ${total.toLocaleString()} FCFA. Merci.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    setIsShareOpen(false);
  };

  const handleEmail = () => {
    const client = selectedClient?.name || "le client";
    const subject = `Facture ${invoiceNumber}`;
    const body = `Bonjour ${client},%0A%0AJe vous transmets la facture ${invoiceNumber} d'un montant de ${total.toLocaleString()} FCFA.%0A%0ACordialement`;
    window.open(`mailto:${selectedClient?.email || ""}?subject=${subject}&body=${body}`);
    setIsShareOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12" ref={container}>
      {/* Top Action Bar */}
      <div className="gsap-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link href="/invoices" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux factures</span>
        </Link>
        <div className="flex items-center gap-3 relative">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>

          {/* Share dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Partager
              <ChevronDown className="w-3 h-3" />
            </button>
            {isShareOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button onClick={handleEmail} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400" /> Envoyer par E-mail
                </button>
                <button onClick={handleWhatsApp} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-100">
                  <MessageCircle className="w-4 h-4 text-green-500" /> Partager via WhatsApp
                </button>
                <button onClick={() => { setIsShareOpen(false); handlePrint(); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-100">
                  <Download className="w-4 h-4 text-blue-500" /> Enregistrer en PDF
                </button>
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isPending || saveSuccess}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all shadow-sm shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isPending ? "Sauvegarde..." : saveSuccess ? "Sauvegardée !" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {saveError && (
        <div className="gsap-reveal bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 print:hidden">
          <span>⚠️</span> {saveError}
        </div>
      )}

      {/* The Invoice Sheet */}
      <div className="gsap-reveal bg-white shadow-xl shadow-slate-200/50 rounded-xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="p-10 md:p-16">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-widest uppercase">Facture</h1>
          </div>

          {/* Numéro + Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-4 bg-slate-50 rounded-xl print:bg-transparent print:p-0">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">N° Facture</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white print:border-transparent print:bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Date d'émission</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white print:border-transparent print:bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Date d'échéance</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white print:border-transparent print:bg-transparent"
              />
            </div>
          </div>

          {/* Émetteur & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Émetteur */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Émetteur</h2>
              <input
                type="text"
                placeholder="Nom de l'entreprise"
                value={issuer.companyName}
                onChange={(e) => setIssuer(prev => ({ ...prev, companyName: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-900 font-medium"
              />
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={issuer.email}
                onChange={(e) => setIssuer(prev => ({ ...prev, email: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={issuer.phone}
                onChange={(e) => setIssuer(prev => ({ ...prev, phone: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <input
                type="text"
                placeholder="Adresse"
                value={issuer.address}
                onChange={(e) => setIssuer(prev => ({ ...prev, address: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
            </div>

            {/* Facturé à — Sélecteur client */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Facturé à</h2>
              
              {/* Select Client */}
              <div className="print:hidden">
                <label className="block text-xs font-medium text-slate-500 mb-1">Sélectionner un client</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">-- Choisir un client --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              {/* Display selected client info */}
              {selectedClient ? (
                <div className="space-y-1 text-slate-700 mt-2">
                  <div className="font-bold text-slate-900">{selectedClient.name}</div>
                  {selectedClient.email && <div className="text-slate-600 text-sm">{selectedClient.email}</div>}
                  {selectedClient.phone && <div className="text-slate-600 text-sm">{selectedClient.phone}</div>}
                  {selectedClient.address && <div className="text-slate-600 text-sm">{selectedClient.address}</div>}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic print:hidden">Les informations du client apparaîtront ici.</p>
              )}
            </div>
          </div>

          <hr className="border-slate-200 my-8" />

          {/* Items */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Détail des prestations</h2>

            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-2 text-right">PU (FCFA)</div>
              <div className="col-span-2 text-right">Montant</div>
            </div>

            <div className="space-y-2 mt-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center group">
                  <div className="col-span-6 relative">
                    <input
                      type="text"
                      placeholder="Nom de la prestation"
                      className="w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="col-span-2 text-center">
                    <input
                      type="number"
                      min="1"
                      className="w-full text-center border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <input
                      type="number"
                      min="0"
                      className="w-full text-right border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right font-medium text-slate-900 py-2">
                    {(item.quantity * item.price).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-600 transition-colors print:hidden"
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>

          {/* Totaux */}
          <div className="flex justify-end pt-8">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Sous-total HT</span>
                <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">TVA (18%)</span>
                <span>{tax.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-xl font-bold text-slate-900">
                <span>Grand Total TTC</span>
                <span>{total.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-10 pt-8 border-t border-slate-200 print:hidden">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes / Conditions de paiement</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex: Paiement par virement bancaire sous 30 jours. Merci de votre confiance."
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          {notes && (
            <div className="mt-10 pt-8 border-t border-slate-200 hidden print:block">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-slate-600">{notes}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
