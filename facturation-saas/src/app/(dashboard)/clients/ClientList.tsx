"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, MapPin, X, Loader2 } from "lucide-react";
import gsap from "gsap";
import { addClient, deleteClient } from "@/app/actions/clients";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  invoicesCount?: number;
};

export default function ClientList({ initialClients }: { initialClients: Client[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // On recréé state local s'il n'y a pas formData mais on passe par formData pour addClient
  const formRef = useRef<HTMLFormElement>(null);

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await addClient(formData);
      if (res.success && res.client) {
        setClients([res.client, ...clients]);
        setIsModalOpen(false);
      } else {
        alert(res.error || "Erreur lors de l'ajout");
      }
    });
  };

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
      <div className="gsap-reveal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-slate-500 mt-1">Gérez votre carnet d'adresses client.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      <div className="gsap-reveal bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Clients Grid / List */}
        <div className="divide-y divide-slate-200">
          {clients.map((client) => {
            const initials = client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={client.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {client.phone}
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {client.address}, {client.city}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-center md:text-right">
                    <div className="text-2xl font-bold text-slate-900">{client.invoicesCount}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Factures</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Modifier">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pagination basique */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <div>Affichage de {clients.length} client(s)</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>Suivant</button>
          </div>
        </div>
      </div>

      {/* Modal Nouveau Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Nouveau Client</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form ref={formRef} onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du client / Entreprise</label>
                <input required type="text" name="name" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: TechAfrica" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail</label>
                <input required type="email" name="email" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: contact@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input required type="tel" name="phone" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: +221 77 000 00 00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <input required type="text" name="address" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: Plateau" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input required type="text" name="city" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: Dakar" />
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isPending} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 shadow-sm transition-colors flex items-center gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
