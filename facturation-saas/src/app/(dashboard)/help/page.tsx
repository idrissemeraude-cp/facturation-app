"use client";

import React, { useEffect, useRef } from "react";
import { Mail, Phone, LifeBuoy, BookOpen, MessageCircle } from "lucide-react";
import gsap from "gsap";

export default function HelpPage() {
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
    <div className="space-y-6 max-w-5xl mx-auto" ref={container}>
      <div className="gsap-reveal">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support et Aide</h1>
        <p className="text-slate-500 mt-1">Besoin d'aide ? Notre équipe est là pour vous accompagner.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Card */}
        <div className="gsap-reveal bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Contactez-nous</h2>
          <p className="text-slate-500 mb-8">
            Pour toute question concernant votre facturation ou l'utilisation de la plateforme, 
            n'hésitez pas à nous joindre directement via ces coordonnées.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary-600 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Adresse e-mail</div>
                <div className="text-slate-500">gansoreemeraude@gmail.com</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary-600 transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Téléphone</div>
                <div className="text-slate-500">60 55 77 77</div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Card */}
        <div className="gsap-reveal bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ressources utiles</h2>
          <p className="text-slate-500 mb-8">
            Consultez nos guides et la foire aux questions pour tirer le meilleur parti de votre compte.
          </p>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900">Guide de démarrage</span>
              </div>
              <span className="text-slate-400 text-sm">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors text-left group">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900">Foire aux questions (FAQ)</span>
              </div>
              <span className="text-slate-400 text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
