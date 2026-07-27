"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { error: "Votre email n'est pas encore confirmé. Vérifiez votre boîte mail et cliquez sur le lien de confirmation." };
    }
    return { error: "Email ou mot de passe incorrect. Vérifiez vos identifiants." };
  }

  revalidatePath("/", "layout");
  redirect("/invoices");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    console.error("SUPABASE SIGNUP ERROR:", error.message, error.status, error.code);
    if (
      error.message.includes("already registered") ||
      error.message.includes("User already registered")
    ) {
      return {
        error: "Cet email est déjà inscrit. Essayez de vous connecter via le bouton en bas.",
      };
    }
    if (
      error.message.includes("is invalid") ||
      error.message.includes("invalid")
    ) {
      return {
        error: "Adresse email non reconnue ou invalide par Supabase. Vérifiez qu'il n'y a pas d'espace avant/après.",
      };
    }
    if (
      error.message.includes("rate limit") ||
      error.message.includes("over_email_send_rate_limit") ||
      error.status === 429
    ) {
      return {
        error: "Trop de tentatives d'inscription. Attendez 1 heure ou désactivez la confirmation d'email dans votre dashboard Supabase (Authentication > Providers > Email > Confirm email = OFF).",
      };
    }
    return { error: `Erreur: ${error.message}` };
  }

  // Email confirmation required — session is null until the user clicks the link
  if (signUpData.user && !signUpData.session) {
    return {
      success: true,
      message:
        "✅ Compte créé ! Un email de confirmation a été envoyé à " +
        email +
        ". Cliquez sur le lien dans l'email pour activer votre compte, puis connectez-vous.",
    };
  }

  // Auto-confirm is enabled — user is immediately logged in
  revalidatePath("/", "layout");
  redirect("/invoices");
}

export async function sendMagicLink(formData: FormData) {
  const supabase = createClient();
  const email = (formData.get("email") as string || "").trim().toLowerCase();

  if (!email) {
    return { error: "Veuillez saisir votre adresse email." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    console.error("SUPABASE MAGIC LINK ERROR:", error.message);
    if (error.message.includes("Signups not allowed") || error.message.includes("not found")) {
      return { error: "Aucun compte trouvé avec cet email. Veuillez d'abord créer un compte." };
    }
    return { error: `Erreur d'envoi: ${error.message}` };
  }

  return {
    success: true,
    message: `📧 Un email d'authentification a été envoyé à ${email}. Cliquez sur le lien dans votre boîte mail ou saisissez le code reçu pour vous connecter.`,
    emailSent: email,
  };
}

export async function verifyOtp(formData: FormData) {
  const supabase = createClient();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const token = (formData.get("code") as string || "").trim();

  if (!email || !token) {
    return { error: "Veuillez saisir votre email et le code de vérification." };
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: "Code de vérification invalide ou expiré. Vérifiez votre email et réessayez." };
  }

  revalidatePath("/", "layout");
  redirect("/invoices");
}

