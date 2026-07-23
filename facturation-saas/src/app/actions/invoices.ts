"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Génère un numéro de facture unique : FAC-YYYY-NNN
async function generateInvoiceNumber(supabase: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const seq = String((count ?? 0) + 1).padStart(3, "0");
  return `FAC-${year}-${seq}`;
}

export async function createInvoice(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé" };
  }

  const clientId = formData.get("client_id") as string;
  const invoiceNumber = formData.get("invoice_number") as string;
  const issueDate = formData.get("issue_date") as string;
  const dueDate = formData.get("due_date") as string;
  const notes = formData.get("notes") as string;

  const itemsRaw = formData.get("items") as string;
  const items: { description: string; quantity: number; unit_price: number; total_price: number }[] = JSON.parse(itemsRaw || "[]");

  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
  const taxAmount = subtotal * 0.18;
  const totalAmount = subtotal + taxAmount;

  const finalNumber = invoiceNumber || await generateInvoiceNumber(supabase, user.id);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert([{
      user_id: user.id,
      client_id: clientId,
      invoice_number: finalNumber,
      status: "draft",
      issue_date: issueDate || new Date().toISOString().split("T")[0],
      due_date: dueDate || null,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: notes || null,
    }])
    .select()
    .single();

  if (invoiceError || !invoice) {
    console.error("Error creating invoice:", invoiceError);
    return { error: "Erreur lors de la création de la facture." };
  }

  if (items.length > 0) {
    const invoiceItems = items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return { error: "Erreur lors de l'enregistrement des lignes." };
    }
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true, invoiceId: invoice.id };
}

export async function updateInvoice(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const clientId = formData.get("client_id") as string;
  const issueDate = formData.get("issue_date") as string;
  const dueDate = formData.get("due_date") as string;
  const notes = formData.get("notes") as string;
  const status = formData.get("status") as string;

  const itemsRaw = formData.get("items") as string;
  const items: { description: string; quantity: number; unit_price: number; total_price: number }[] = JSON.parse(itemsRaw || "[]");

  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
  const taxAmount = subtotal * 0.18;
  const totalAmount = subtotal + taxAmount;

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      client_id: clientId,
      issue_date: issueDate || null,
      due_date: dueDate || null,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: notes || null,
      ...(status ? { status } : {}),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error updating invoice:", updateError);
    return { error: "Erreur lors de la modification de la facture." };
  }

  // Remplacer les lignes de facture
  await supabase.from("invoice_items").delete().eq("invoice_id", id);

  if (items.length > 0) {
    const invoiceItems = items.map(item => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));
    await supabase.from("invoice_items").insert(invoiceItems);
  }

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteInvoice(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting invoice:", error);
    return { error: "Erreur lors de la suppression." };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const validStatuses = ["draft", "pending", "sent", "paid", "overdue", "cancelled"];
  if (!validStatuses.includes(status)) {
    return { error: "Statut invalide." };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating invoice status:", error);
    return { error: "Erreur lors de la mise à jour du statut." };
  }

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}
