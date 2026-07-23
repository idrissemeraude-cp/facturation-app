import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SettingsPageClient from "./SettingsPageClient";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile();

  return <SettingsPageClient initialProfile={profile} />;
}
