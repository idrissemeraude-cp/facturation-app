import { createClient } from "@/utils/supabase/server";
import InvoiceList from "./InvoiceList";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch invoices for the current user
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      issue_date,
      due_date,
      total_amount,
      status,
      clients ( name )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
  }

  // Map the response to the expected type
  const formattedInvoices = (invoices || []).map((invoice) => ({
    id: invoice.id,
    number: invoice.invoice_number,
    client: (invoice.clients as unknown as { name?: string } | null)?.name || "Client inconnu",
    issueDate: invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('fr-FR') : '—',
    dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—',
    amount: invoice.total_amount,
    status: invoice.status,
  }));

  return <InvoiceList initialInvoices={formattedInvoices} />;
}
