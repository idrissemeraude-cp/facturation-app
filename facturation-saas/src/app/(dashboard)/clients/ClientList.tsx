"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin, X, Loader2, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { addClient, updateClient, deleteClient } from "@/app/actions/clients";

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
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isPendingAdd, startTransitionAdd] = useTransition();
  const [isPendingEdit, startTransitionEdit] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-reveal", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
    }, container);
    return () => ctx.revert();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredClients = clients.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransitionAdd(async () => {
      const res = await addClient(formData);
      if (res.success && res.client) {
        setClients([{ ...res.client, invoicesCount: 0 }, ...clients]);
        setIsModalOpen(false);
        formRef.current?.reset();
        showToast("Client créé avec succès !");
      } else {
        alert(res.error || "Erreur lors de l'ajout");
      }
    });
  };

  const handleEditClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClient) return;
    const formData = new FormData(e.currentTarget);
    startTransitionEdit(async () => {
      const res = await updateClient(editingClient.id, formData);
      if (res.success && res.client) {
        setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...res.client } : c));
        setEditingClient(null);
        showToast("Client modifié avec succès !");
      } else {
        alert(res.error || "Erreur lors de la modification");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer le client "${name}" ? Ses factures associées seront également supprimées.`)) return;
    setDeletingId(id);
    startTransitionDelete(async () => {
      const res = await deleteClient(id);
      if (res.success) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        showToast("Client supprimé.");
      } else {
        alert(res.error || "Erreur lors de la suppression.");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6" ref={container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

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
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, tél..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900"
            />
          </div>
          <div className="text-sm text-slate-500 shrink-0">{filteredClients.length} client(s)</div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-200">
          {filteredClients.map((client) => {
            const initials = client.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
            const isDeleting = deletingId === client.id;
            return (
              <div
                key={client.id}
                className={`p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group ${isDeleting ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-center md:text-right">
                    <div className="text-2xl font-bold text-slate-900">{client.invoicesCount ?? 0}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Factures</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingClient(client)}
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" 
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id, client.name)}
                      disabled={isDeleting}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div className="font-medium text-slate-600">
                  {search ? "Aucun client ne correspond à la recherche." : "Aucun client pour le moment."}
                </div>
                {!search && (
                  <button onClick={() => setIsModalOpen(true)} className="text-sm text-primary font-medium hover:underline">
                    + Ajouter votre premier client
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 text-sm text-slate-500 bg-slate-50/50">
          {clients.length} client(s) au total
        </div>
      </div>

      {/* Modal Nouveau Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Nouveau Client</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du client / Entreprise *</label>
                <input required type="text" name="name" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: TechAfrica SARL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail *</label>
                <input required type="email" name="email" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="contact@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone *</label>
                <input required type="tel" name="phone" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="+221 77 000 00 00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <input type="text" name="address" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: Plateau" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input type="text" name="city" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" placeholder="Ex: Dakar" />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isPendingAdd} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isPendingAdd} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 shadow-sm transition-colors flex items-center gap-2">
                  {isPendingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier Client */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Modifier Client</h2>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={editFormRef} onSubmit={handleEditClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du client / Entreprise *</label>
                <input required type="text" name="name" defaultValue={editingClient.name} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail</label>
                <input type="email" name="email" defaultValue={editingClient.email || ""} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input type="tel" name="phone" defaultValue={editingClient.phone || ""} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse complète</label>
                <input type="text" name="address" defaultValue={editingClient.address || ""} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900" />
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingClient(null)} disabled={isPendingEdit} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isPendingEdit} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 shadow-sm transition-colors flex items-center gap-2">
                  {isPendingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
