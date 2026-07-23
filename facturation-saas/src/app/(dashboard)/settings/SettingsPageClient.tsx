"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { Upload, Building2, Mail, Phone, MapPin, FileDigit, Save, CheckCircle2, Loader2 } from "lucide-react";
import gsap from "gsap";
import { updateProfile } from "@/app/actions/profile";

interface SettingsPageProps {
  initialProfile?: {
    company_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    tax_number: string | null;
    logo_url: string | null;
  } | null;
}

export default function SettingsPageClient({ initialProfile }: SettingsPageProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    companyName: initialProfile?.company_name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    address: initialProfile?.address || "",
    taxNumber: initialProfile?.tax_number || ""
  });

  const [isSaved, setIsSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialProfile?.logo_url || null);

  useEffect(() => {
    // Priority: initialProfile > localStorage > default
    if (!initialProfile?.company_name) {
      const saved = localStorage.getItem("invoiceIssuerSettings");
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    }
    if (!initialProfile?.logo_url) {
      const savedLogo = localStorage.getItem("invoiceIssuerLogo");
      if (savedLogo) {
        setLogoPreview(savedLogo);
      }
    }
    
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
  }, [initialProfile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        localStorage.setItem("invoiceIssuerLogo", result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSave = () => {
    // Save to localStorage for quick client access
    localStorage.setItem("invoiceIssuerSettings", JSON.stringify(formData));

    // Save to Supabase Server
    startTransition(async () => {
      const data = new FormData();
      data.set("companyName", formData.companyName);
      data.set("email", formData.email);
      data.set("phone", formData.phone);
      data.set("address", formData.address);
      data.set("taxNumber", formData.taxNumber);
      if (logoPreview) data.set("logoUrl", logoPreview);

      const res = await updateProfile(data);
      if (res.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        alert(res.error || "Erreur de sauvegarde");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" ref={container}>
      <div className="gsap-reveal">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Paramètres de l'entreprise</h1>
        <p className="text-slate-500 mt-1">Configurez les informations qui apparaîtront sur vos factures.</p>
      </div>

      <div className="gsap-reveal bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <form className="p-6 md:p-8 space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          
          {/* Section Logo */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Logo de l'entreprise</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  Importer un logo
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
                <p className="text-xs text-slate-500 mt-2">Format recommandé: PNG, JPG (Max 2MB).<br/>Sera affiché en haut de vos factures.</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section Informations */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-6">Informations légales (Émetteur)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Nom de l'entreprise</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Nom de votre entreprise"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@entreprise.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+221 XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Adresse complète</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Adresse de l'entreprise"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Numéro d'Identification Fiscale (NINEA, RCCM, etc.)</label>
                <div className="relative">
                  <FileDigit className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    placeholder="NINEA / RCCM"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
            {isSaved && (
              <span className="save-feedback flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Paramètres enregistrés en base
              </span>
            )}
            <button 
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/30 disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isPending ? "Enregistrement..." : "Sauvegarder les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
