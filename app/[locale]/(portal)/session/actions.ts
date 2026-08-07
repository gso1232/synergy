"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign out, from anywhere in the portal.
 *
 * A server action so the cleared auth cookies are actually written onto the
 * response — `signOut()` revokes the refresh token server-side and removes the
 * cookies. After it, every guarded route redirects to /login, and the browser
 * Back button cannot restore a page because all of them are dynamically
 * rendered and re-guarded on every request.
 *
 * It lives here rather than in admin/actions.ts because /pending and /welcome
 * need it too, and neither should have to import a module whose every other
 * export is admin-gated.
 */
export async function signOut(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}
