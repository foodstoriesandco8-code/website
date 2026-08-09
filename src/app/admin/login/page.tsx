"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import Image from "next/image";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);

    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-zinc-100 dark:border-zinc-800">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative h-16 w-16 mb-4">
            <Image src="/logo.png" alt="Food Stories Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Portal</h1>
          <p className="text-sm text-zinc-500 mt-2">Sign in to manage Food Stories & Co.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder=""
                required
                className="pl-10 h-12"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder=""
                required
                className="pl-10 h-12"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-md font-bold" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
