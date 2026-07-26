"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";

const messageUrl = (path: string, message: string, success = false) =>
  `${path}?${success ? "success" : "error"}=${encodeURIComponent(message)}`;

export async function login(formData: FormData) {
  try {
    supabaseConfig();
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (error) redirect(messageUrl("/login", "Email atau kata sandi tidak sesuai."));
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    redirect(messageUrl("/login", error instanceof Error ? error.message : "Gagal masuk."));
  }
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  try {
    supabaseConfig();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (name.length < 2) redirect(messageUrl("/register", "Nama minimal 2 karakter."));
    if (password.length < 8) redirect(messageUrl("/register", "Kata sandi minimal 8 karakter."));
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });
    if (error) redirect(messageUrl("/register", error.message));
    if (data.session) redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    redirect(messageUrl("/register", error instanceof Error ? error.message : "Gagal mendaftar."));
  }
  redirect(messageUrl("/login", "Cek email untuk mengaktifkan akunmu.", true));
}

export async function forgotPassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      String(formData.get("email") ?? ""),
      { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/profile` },
    );
    if (error) redirect(messageUrl("/forgot-password", error.message));
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    redirect(messageUrl("/forgot-password", error instanceof Error ? error.message : "Permintaan gagal."));
  }
  redirect(messageUrl("/forgot-password", "Tautan pemulihan sudah dikirim jika email terdaftar.", true));
}
