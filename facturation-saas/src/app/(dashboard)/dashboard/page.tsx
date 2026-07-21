import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      issue_date,
      total_amount,
      status,
      clients ( name )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dashboard data:", error);
  }

  const safeInvoices = invoices || [];

  let totalAmount = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let pendingCount = 0;

  safeInvoices.forEach(inv => {
    const amount = Number(inv.total_amount) || 0;
    totalAmount += amount;
    
    if (inv.status === 'paid') {
      totalPaid += amount;
    } else if (inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'pending') {
      totalPending += amount;
      pendingCount++;
    }
  });

  const recentInvoices = safeInvoices.slice(0, 4).map(inv => ({
    id: inv.id,
    number: inv.invoice_number,
    client: inv.clients?.name || "Inconnu",
    total: Number(inv.total_amount) || 0,
    status: inv.status,
    issueDate: new Date(inv.issue_date).toLocaleDateString('fr-FR'),
  }));

  // Fausse donnée mensuelle pour la démo, on pourrait grouper par mois avec JS
  const monthlyData = [
    { name: 'Jan', total: 4000 },
    { name: 'Fév', total: 3000 },
    { name: 'Mar', total: 2000 },
    { name: 'Avr', total: 2780 },
    { name: 'Mai', total: 1890 },
    { name: 'Juin', total: 2390 },
    { name: 'Juil', total: Math.round(totalAmount / 1000) }, // Exemple d'injection réelle
  ];

  return (
    <DashboardClient 
      totalInvoices={safeInvoices.length}
      totalAmount={totalAmount}
      totalPaid={totalPaid}
      totalPending={totalPending}
      pendingCount={pendingCount}
      recentInvoices={recentInvoices}
      monthlyData={monthlyData}
    />
  );
}
