"use client";

import React, { useState, useRef, useEffect } from "react";
import { Printer, Mail, Plus, Trash2, ArrowLeft, Share2, MessageCircle, Download } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

export default function NewInvoicePage() {
  const container = useRef<HTMLDivElement>(null);

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

  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, price: 0 }
  ]);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [issuer, setIssuer] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("invoiceIssuerSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setIssuer({
        companyName: parsed.companyName || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        address: parsed.address || ""
      });
    }
  }, []);

  const handleIssuerChange = (field: string, value: string) => {
    setIssuer(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12" ref={container}>
      {/* Top Action Bar - Hidden during print */}
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
          <div className="relative">
            <button 
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>

            {isShareOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button 
                  onClick={() => setIsShareOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-400" /> Envoyer par E-mail
                </button>
                <button 
                  onClick={() => setIsShareOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-100"
                >
                  <MessageCircle className="w-4 h-4 text-green-500" /> Partager via WhatsApp
                </button>
                <button 
                  onClick={() => { setIsShareOpen(false); handlePrint(); }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-100"
                >
                  <Download className="w-4 h-4 text-blue-500" /> Enregistrer en PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The White Sheet */}
      <div className="gsap-reveal bg-white shadow-xl shadow-slate-200/50 rounded-xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="p-10 md:p-16">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black text-slate-900 tracking-widest uppercase">Facture</h1>
          </div>

          {/* Emetteur & Facturé à */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Emetteur */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Émetteur</h2>
              <input 
                type="text" 
                placeholder="Nom de l'entreprise"
                value={issuer.companyName}
                onChange={(e) => handleIssuerChange('companyName', e.target.value)}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-900 font-medium"
              />
              <input 
                type="email" 
                placeholder="Adresse e-mail"
                value={issuer.email}
                onChange={(e) => handleIssuerChange('email', e.target.value)}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <input 
                type="tel" 
                placeholder="Numéro de téléphone"
                value={issuer.phone}
                onChange={(e) => handleIssuerChange('phone', e.target.value)}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <input 
                type="text" 
                placeholder="Localisation"
                value={issuer.address}
                onChange={(e) => handleIssuerChange('address', e.target.value)}
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <div className="pt-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date d'émission</label>
                <input 
                  type="date"
                  className="block w-full border border-slate-200 rounded focus:border-slate-400 focus:outline-none bg-transparent px-3 py-1.5 text-slate-700"
                />
              </div>
            </div>

            {/* Facturé à */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Facturé à</h2>
              <input 
                type="text" 
                placeholder="Nom du client"
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-900 font-medium"
              />
              <input 
                type="email" 
                placeholder="Adresse e-mail"
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <input 
                type="tel" 
                placeholder="Numéro de téléphone"
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <input 
                type="text" 
                placeholder="Localisation"
                className="block w-full border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent transition-colors py-1 text-slate-600"
              />
              <div className="pt-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date d'échéance</label>
                <input 
                  type="date"
                  className="block w-full border border-slate-200 rounded focus:border-slate-400 focus:outline-none bg-transparent px-3 py-1.5 text-slate-700"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200 my-8" />

          {/* Détail des prestations */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Détail des prestations</h2>
            
            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-2 text-right">PU</div>
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
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                      title="Supprimer la ligne"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="col-span-2 text-center">
                    <input 
                      type="number" 
                      min="1"
                      className="w-full text-center border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <input 
                      type="number" 
                      min="0"
                      className="w-full text-right border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none bg-transparent py-2 text-slate-800"
                      value={item.price || ''}
                      onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right font-medium text-slate-900 py-2">
                    {(item.quantity * item.price).toLocaleString()}
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
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">TVA (18%)</span>
                <span>{tax.toLocaleString()} FCFA</span>
              </div>
              <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xl font-bold text-slate-900">
                <span>Grand Total</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
