"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addClient(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  
  const fullAddress = city ? `${address}, ${city}` : address;

  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        user_id: user.id,
        name,
        email,
        phone,
        address: fullAddress,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding client:", error);
    return { error: "Erreur lors de l'ajout du client" };
  }

  revalidatePath("/clients");
  return { success: true, client: data };
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const { data, error } = await supabase
    .from("clients")
    .update({ name, email, phone, address })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client:", error);
    return { error: "Erreur lors de la modification du client." };
  }

  revalidatePath("/clients");
  return { success: true, client: data };
}

export async function deleteClient(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erreur lors de la suppression." };
  revalidatePath("/clients");
  return { success: true };
}
