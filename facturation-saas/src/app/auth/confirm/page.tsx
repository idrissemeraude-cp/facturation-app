import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { token_hash?: string; type?: string; next?: string };
}) {
  const { token_hash, type, next } = searchParams;

  if (token_hash && type) {
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });

    if (!error) {
      // Confirmation successful → redirect to dashboard
      redirect(next ?? "/invoices");
    }
  }

  // If error or missing params → redirect to login with error
  redirect("/login?error=confirmation_failed");
}
