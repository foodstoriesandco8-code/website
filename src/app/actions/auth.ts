"use server";

import { cookies } from "next/headers";

export async function adminLogin(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const isValidAdmin1 = email === "flyggoagency@gmail.com" && password === "Flyggo@8";
  const isValidAdmin2 = email === "admin@foodstories.in" && password === "Foodstories@8";

  // Hardcoded credentials as requested by the user
  if (isValidAdmin1 || isValidAdmin2) {
    // Set a secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    
    return { success: true };
  }

  return { success: false, error: "Invalid email or password." };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}
