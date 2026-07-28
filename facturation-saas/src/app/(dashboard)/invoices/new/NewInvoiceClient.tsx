"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { Printer, Mail, Plus, Trash2, ArrowLeft, Share2, MessageCircle, Download, Save, Loader2, CheckCircle2, ChevronDown, UserPlus, X, Send } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { createInvoice } from "@/app/actions/invoices";
import { addClient } from "@/app/actions/clients";
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

export default function NewInvoicePageClient({ clients: initialClients, suggestedNumber }: NewInvoicePageClientProps) {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals & States
  const [clientsList, setClientsList] = useState<Client[]>(initialClients);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);

  // New Client Form state
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

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

  const selectedClient = clientsList.find(c => c.id === selectedClientId);

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

  // Create Quick Client
  const handleQuickAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      setClientError("Le nom du client est obligatoire.");
      return;
    }
    setClientError(null);
    setIsCreatingClient(true);

    const formData = new FormData();
    formData.set("name", newClientName);
    formData.set("email", newClientEmail);
    formData.set("phone", newClientPhone);
    formData.set("address", newClientAddress);

    const res = await addClient(formData);
    setIsCreatingClient(false);

    if (res.error) {
      setClientError(res.error);
    } else if (res.client) {
      const newC: Client = {
        id: res.client.id,
        name: res.client.name,
        email: res.client.email,
        phone: res.client.phone,
        address: res.client.address,
      };
      setClientsList([newC, ...clientsList]);
      setSelectedClientId(newC.id);
      setIsNewClientModalOpen(false);
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      setNewClientAddress("");
    }
  };

  // Save Invoice Action
  const handleSaveInvoice = (andShare = false) => {
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
        if (result.invoiceId) {
          setCreatedInvoiceId(result.invoiceId);
        }
        if (andShare) {
          setIsShareModalOpen(true);
        } else {
          setTimeout(() => {
            router.push("/invoices");
          }, 1200);
        }
      }
    });
  };

  const handleWhatsApp = () => {
    const clientName = selectedClient?.name || "Cher client";
    const msg = `Bonjour ${clientName},\nVoici votre facture ${invoiceNumber} d'un montant de ${total.toLocaleString("fr-FR")} FCFA.\nMerci pour votre confiance.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleEmail = () => {
    const clientName = selectedClient?.name || "Cher client";
    const subject = `Facture ${invoiceNumber} - ${issuer.companyName || "iziFacture"}`;
    const body = `Bonjour ${clientName},\n\nVeuillez trouver ci-joint votre facture N° ${invoiceNumber} d'un montant de ${total.toLocaleString("fr-FR")} FCFA.\n\nCordialement,\n${issuer.companyName}`;
    window.open(`mailto:${selectedClient?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12" ref={container}>
      {/* Top Action Bar */}
      <div className="gsap-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link href="/invoices" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux factures</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {/* Imprimer / PDF */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimer / PDF
          </button>

          {/* Partager */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
            Partager
          </button>

          {/* Créer et Envoyer */}
          <button
            onClick={() => handleSaveInvoice(true)}
            disabled={isPending || saveSuccess}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Créer & Envoyer
          </button>
        </div>
      </div>

      {/* Error message */}
      {saveError && (
        <div className="gsap-reveal bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 print:hidden font-medium">
          <span>⚠️</span> {saveError}
        </div>
      )}

      {/* The Invoice Sheet */}
      <div className="gsap-reveal bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="p-8 md:p-14">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-widest uppercase">Facture</h1>
          </div>

          {/* Numéro + Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-4 bg-slate-50 rounded-xl print:bg-transparent print:p-0 border border-slate-100">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            {/* Émetteur */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Émetteur</h2>
              <input
                type="text"
                placeholder="Nom de l'entreprise"
                value={issuer.companyName}
                onChange={(e) => setIssuer(prev => ({ ...prev, companyName: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-900 font-bold text-lg"
              />
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={issuer.email}
                onChange={(e) => setIssuer(prev => ({ ...prev, email: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600 text-sm"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={issuer.phone}
                onChange={(e) => setIssuer(prev => ({ ...prev, phone: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600 text-sm"
              />
              <input
                type="text"
                placeholder="Adresse"
                value={issuer.address}
                onChange={(e) => setIssuer(prev => ({ ...prev, address: e.target.value }))}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600 text-sm"
              />
            </div>

            {/* Facturé à — Sélecteur + Bouton Nouveau Client */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facturé à</h2>
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(true)}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 print:hidden"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Nouveau client
                </button>
              </div>

              {/* Select Client */}
              <div className="print:hidden">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
                >
                  <option value="">-- Choisir ou ajouter un client --</option>
                  {clientsList.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              {/* Display selected client info */}
              {selectedClient ? (
                <div className="space-y-1 text-slate-700 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 text-base">{selectedClient.name}</div>
                  {selectedClient.email && <div className="text-slate-600 text-sm">{selectedClient.email}</div>}
                  {selectedClient.phone && <div className="text-slate-600 text-sm">{selectedClient.phone}</div>}
                  {selectedClient.address && <div className="text-slate-600 text-sm">{selectedClient.address}</div>}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm italic print:hidden text-center">
                  Aucun client sélectionné. Choisissez ou créez un client ci-dessus.
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-200 my-8" />

          {/* Items */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Détail des prestations</h2>

            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                      className="w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800 font-medium"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="col-span-2 text-center">
                    <input
                      type="number"
                      min="1"
                      className="w-full text-center border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800 font-medium"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <input
                      type="number"
                      min="0"
                      className="w-full text-right border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800 font-medium"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold text-slate-900 py-2">
                    {(item.quantity * item.price).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors print:hidden"
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>

          {/* Totaux */}
          <div className="flex justify-end pt-8">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex items-center justify-between text-slate-600 text-sm">
                <span className="font-medium">Sous-total HT</span>
                <span className="font-mono">{subtotal.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 text-sm">
                <span className="font-medium">TVA (18%)</span>
                <span className="font-mono">{tax.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-xl font-extrabold text-slate-900">
                <span>Grand Total TTC</span>
                <span className="text-primary-600 font-display">{total.toLocaleString("fr-FR")} FCFA</span>
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
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* MODAL 1: Partager & Envoyer (WhatsApp, Gmail, PDF) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button onClick={() => setIsShareModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1">
              <X className="w-6 h-6" />
            </button>

            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-glow">
              <Send className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold font-display text-slate-900 text-center mb-1">Envoyer la facture</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Choisissez votre canal d'envoi préféré :
            </p>

            <div className="space-y-3">
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">WhatsApp</div>
                    <div className="text-xs text-slate-500">Envoyer directement au client</div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-green-600 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Gmail / Email Button */}
              <button
                onClick={handleEmail}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">E-mail / Gmail</div>
                    <div className="text-xs text-slate-500">Ouvrir votre messagerie</div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-blue-600 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Print / PDF Button */}
              <button
                onClick={() => { setIsShareModalOpen(false); handlePrint(); }}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Imprimer / Télécharger PDF</div>
                    <div className="text-xs text-slate-500">Générer le fichier document</div>
                  </div>
                </div>
                <Download className="w-5 h-5 text-slate-600 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Ajouter un Nouveau Client */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button onClick={() => setIsNewClientModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1">
              <X className="w-6 h-6" />
            </button>

            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-glow">
              <UserPlus className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold font-display text-slate-900 text-center mb-1">Nouveau Client</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Ajoutez rapidement les coordonnées du client</p>

            {clientError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 text-center font-medium">
                {clientError}
              </div>
            )}

            <form onSubmit={handleQuickAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nom complet / Entreprise *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Société ABC"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  placeholder="client@exemple.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Téléphone</label>
                <input
                  type="tel"
                  placeholder="+226 XX XX XX XX"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Adresse</label>
                <input
                  type="text"
                  placeholder="Ouagadougou, Burkina Faso"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingClient}
                className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-6"
              >
                {isCreatingClient ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer & Sélectionner"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
