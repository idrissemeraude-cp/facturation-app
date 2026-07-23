import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import InvoiceDetailClient from "./InvoiceDetailClient";

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Charger la facture avec ses items et son client
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      issue_date,
      due_date,
      subtotal,
      tax_amount,
      total_amount,
      notes,
      clients ( name, email, phone, address ),
      invoice_items ( id, description, quantity, unit_price, total_price )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) {
    notFound();
  }

  // Charger les paramètres entreprise si disponibles via DB (fallback vers un objet vide)
  // (Les paramètres sont en localStorage côté client, on passe null ici)

  // Supabase infère les relations comme tableau — double cast via unknown
  const clientData = (invoice.clients as unknown) as { name: string; email: string | null; phone: string | null; address: string | null } | null;

  const invoiceData = {
    id: invoice.id,
    number: invoice.invoice_number,
    status: invoice.status,
    issueDate: invoice.issue_date
      ? new Date(invoice.issue_date).toLocaleDateString("fr-FR")
      : "—",
    dueDate: invoice.due_date
      ? new Date(invoice.due_date).toLocaleDateString("fr-FR")
      : "—",
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.tax_amount),
    totalAmount: Number(invoice.total_amount),
    notes: invoice.notes || "",
    client: {
      name: clientData?.name || "Client inconnu",
      email: clientData?.email || "",
      phone: clientData?.phone || "",
      address: clientData?.address || "",
    },
    items: (invoice.invoice_items || []).map((item: { id: string; description: string; quantity: number; unit_price: number; total_price: number }) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
    })),
  };

  return <InvoiceDetailClient invoice={invoiceData} />;
}
