import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  if (error) console.error("Error fetching dashboard data:", error);

  const safeInvoices = invoices || [];

  let totalAmount = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let pendingCount = 0;

  safeInvoices.forEach((inv) => {
    const amount = Number(inv.total_amount) || 0;
    totalAmount += amount;
    if (inv.status === "paid") {
      totalPaid += amount;
    } else if (["sent", "overdue", "pending"].includes(inv.status)) {
      totalPending += amount;
      pendingCount++;
    }
  });

  const recentInvoices = safeInvoices.slice(0, 5).map((inv) => ({
    id: inv.id,
    number: inv.invoice_number,
    client: (inv.clients as { name?: string } | null)?.name || "Inconnu",
    total: Number(inv.total_amount) || 0,
    status: inv.status,
    issueDate: inv.issue_date
      ? new Date(inv.issue_date).toLocaleDateString("fr-FR")
      : "—",
  }));

  // Données mensuelles réelles — 12 derniers mois
  const now = new Date();
  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  // Initialiser les 12 derniers mois à 0
  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = 0;
  }

  // Agréger les factures par mois
  safeInvoices.forEach((inv) => {
    if (!inv.issue_date) return;
    const d = new Date(inv.issue_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyMap) {
      monthlyMap[key] += Number(inv.total_amount) || 0;
    }
  });

  const monthlyData = Object.entries(monthlyMap).map(([key, total]) => {
    const [year, month] = key.split("-");
    return {
      name: monthLabels[parseInt(month) - 1],
      total: Math.round(total),
    };
  });

  // Taux de recouvrement
  const recoveryRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  return (
    <DashboardClient
      userEmail={user.email}
      totalInvoices={safeInvoices.length}
      totalAmount={totalAmount}
      totalPaid={totalPaid}
      totalPending={totalPending}
      pendingCount={pendingCount}
      recoveryRate={recoveryRate}
      recentInvoices={recentInvoices}
      monthlyData={monthlyData}
    />
  );
}
