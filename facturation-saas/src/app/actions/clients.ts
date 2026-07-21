"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addClient(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  // Note: 'city' is combined with address or added as extra if your DB supports it.
  // In the current SQL schema, there is no 'city' column, so we'll append it to address.
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

export async function deleteClient(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { error: "Erreur lors de la suppression." };
  revalidatePath("/clients");
  return { success: true };
}
