"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const companyName = formData.get("companyName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const taxNumber = formData.get("taxNumber") as string;
  const logoUrl = formData.get("logoUrl") as string;

  const profileData = {
    id: user.id,
    company_name: companyName,
    email: email,
    phone: phone,
    address: address,
    tax_number: taxNumber,
    logo_url: logoUrl || null,
  };

  const { error } = await supabase
    .from("user_profiles")
    .upsert(profileData);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Erreur lors de la sauvegarde des paramètres." };
  }

  revalidatePath("/settings");
  revalidatePath("/invoices/new");
  return { success: true };
}
