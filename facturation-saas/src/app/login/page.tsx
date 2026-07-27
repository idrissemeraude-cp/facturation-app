"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { gsap } from "gsap";
import { LogIn, UserPlus, Mail, Lock, ArrowRight, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { login, signup, sendMagicLink, verifyOtp } from "./actions";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"magic_link" | "password">("magic_link");
  const [otpSentEmail, setOtpSentEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const magneticBtnRef = useRef<HTMLButtonElement>(null);

  // Initial Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Form Switch Animation
  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: isLogin ? -20 : 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [isLogin, loginMethod, otpSentEmail]);

  // Magnetic Button Effect
  useEffect(() => {
    const btn = magneticBtnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [loginMethod, otpSentEmail]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (!isLogin) {
        // Signup Flow
        const res = await signup(formData);
        if (res?.error) {
          setError(res.error);
          gsap.fromTo(formRef.current, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        } else if (res && 'success' in res && res.success && res.message) {
          setSuccessMessage(res.message as string);
          setIsLogin(true);
        }
      } else if (otpSentEmail) {
        // Verify OTP Code
        formData.append("email", otpSentEmail);
        const res = await verifyOtp(formData);
        if (res?.error) {
          setError(res.error);
        }
      } else if (loginMethod === "magic_link") {
        // Send Magic Link / OTP Email Authentication
        const res = await sendMagicLink(formData);
        if (res?.error) {
          setError(res.error);
          gsap.fromTo(formRef.current, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        } else if (res?.success && res.message) {
          setSuccessMessage(res.message);
          if (res.emailSent) {
            setOtpSentEmail(res.emailSent);
          }
        }
      } else {
        // Standard Password Login
        const res = await login(formData);
        if (res?.error) {
          setError(res.error);
          gsap.fromTo(formRef.current, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 noise-bg overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-800/50 rounded-full blur-[100px] pointer-events-none" />

      <div ref={containerRef} className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8 reveal">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 font-display">
            {isLogin ? "Bienvenue" : "Créer un compte"}
          </h1>
          <p className="text-slate-400 text-sm">
            {isLogin
              ? "Connectez-vous avec vérification email sécurisée."
              : "Rejoignez-nous et simplifiez votre facturation."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 shadow-2xl reveal">
          {/* Method Selector for Login */}
          {isLogin && !otpSentEmail && (
            <div className="flex bg-slate-950/60 p-1 rounded-xl mb-6 border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => { setLoginMethod("magic_link"); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === "magic_link"
                    ? "bg-primary-500 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Vérification Email
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod("password"); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMethod === "password"
                    ? "bg-slate-800 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Mot de passe
              </button>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-primary-500/10 border border-primary-500/30 text-primary-300 p-4 rounded-xl text-sm text-center leading-relaxed flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Email d'authentification envoyé</div>
                  {successMessage}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* If OTP code sent, show OTP input */}
              {otpSentEmail ? (
                <div className="space-y-3">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 text-center">
                    Saisissez le code à 6 chiffres envoyé à <span className="font-semibold text-primary-400">{otpSentEmail}</span> :
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Code de vérification (OTP)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="code"
                        required
                        maxLength={6}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-center tracking-[0.5em] text-lg font-mono text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtpSentEmail(null); setSuccessMessage(null); setError(null); }}
                    className="text-xs text-slate-400 hover:text-white transition-colors underline block text-center mx-auto"
                  >
                    Renvoyer un email / Changer d'email
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Adresse Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                        placeholder="vous@exemple.com"
                      />
                    </div>
                  </div>

                  {(!isLogin || loginMethod === "password") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-medium text-slate-300">Mot de passe</label>
                        {isLogin && (
                          <a href="#" className="text-xs text-primary-500 hover:text-primary-400 transition-colors">
                            Oublié ?
                          </a>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          required
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              ref={magneticBtnRef}
              disabled={isPending}
              type="submit"
              className="w-full relative group overflow-hidden bg-primary-500 hover:bg-primary-600 text-white rounded-xl py-3.5 px-4 font-medium transition-colors shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  {otpSentEmail
                    ? "Valider le code & Se connecter"
                    : isLogin
                    ? loginMethod === "magic_link"
                      ? "Envoyer l'email d'authentification"
                      : "Se connecter"
                    : "Créer un compte"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setOtpSentEmail(null);
                setIsLogin(!isLogin);
              }}
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto group"
            >
              {isLogin ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Pas encore de compte ? S'inscrire
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Déjà un compte ? Se connecter
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
