import { createClient } from "@/utils/supabase/server";
import ClientList from "./ClientList";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch clients for the current user
  const { data: clients, error } = await supabase
    .from("clients")
    .select(`
      id,
      name,
      email,
      phone,
      address,
      invoices:invoices(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
  }

  // Map the response to the expected type
  const formattedClients = (clients || []).map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    invoicesCount: client.invoices?.[0]?.count || 0,
  }));

  return <ClientList initialClients={formattedClients} />;
}
