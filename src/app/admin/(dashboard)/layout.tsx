"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout } from "@/app/actions/auth";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  MapPin,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Menu Items", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CalendarDays },
  { name: "Vending Machines", href: "/admin/locations", icon: MapPin },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden flex items-center justify-center">
              <Image src="/logo.png" alt="Food Stories Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
              {sidebarLinks.find(l => l.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-700">
              <div className="text-right hidden md:block flex items-center h-full justify-center">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Admin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border-2 border-white dark:border-zinc-700 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://ui-avatars.com/api/?name=Admin&background=2E7D32&color=fff" alt="Admin Avatar" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
