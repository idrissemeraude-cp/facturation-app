import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NewInvoiceClient from "./NewInvoiceClient";

export default async function NewInvoicePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Charger les clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, phone, address")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // Générer le prochain numéro de facture
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const seq = String((count ?? 0) + 1).padStart(3, "0");
  const suggestedNumber = `FAC-${year}-${seq}`;

  return (
    <NewInvoiceClient
      clients={clients || []}
      suggestedNumber={suggestedNumber}
    />
  );
}
