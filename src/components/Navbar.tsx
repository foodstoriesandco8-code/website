"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, User, Search, MapPin, X } from "lucide-react";
import { Button } from "./ui/button";
import LoginModal from "./LoginModal";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  const isHome = pathname === "/";
  const effectiveIsScrolled = isScrolled || !isHome;

  const { user, login, logout } = useAuth();
  const { totalItems } = useCart();

  const handleLoginSuccess = (userData: {name: string, phone: string}) => {
    login(userData);
    setIsLoginOpen(false);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          effectiveIsScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-black/80 translate-y-0"
            : "bg-transparent translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-14 w-14 flex items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-2 ring-white/50">
              <Image src="/logo.png" alt="Food Stories & Co Logo" fill className="object-cover p-0.5" priority />
            </div>
            <span
              className={`text-2xl font-extrabold tracking-tight hidden sm:block ${
                effectiveIsScrolled ? "text-zinc-900 dark:text-white" : "text-white"
              }`}
            >
              The Food Stories <span className="text-primary font-medium text-xl">& Co.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { name: "Home", path: "/" },
              { name: "Our Story", path: "/our-story" },
              { name: "Subscriptions", path: "/subscriptions" },
              { name: "Vending Machines", path: "/locations" }
            ].map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-semibold transition-colors hover:text-primary ${
                  effectiveIsScrolled ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-200"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">

            
            {user ? (
              <>

                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className={`hidden sm:flex rounded-full gap-2 font-semibold ${
                      effectiveIsScrolled ? "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800" : "text-white hover:bg-white/20"
                    }`}
                  >
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </div>
                    <span>{user.name ? user.name.split(' ')[0] : "User"}</span>
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLoginOpen(true)}
                className={`hidden sm:flex rounded-full ${
                  effectiveIsScrolled ? "text-zinc-900 dark:text-white" : "text-white hover:text-white hover:bg-white/20"
                }`}
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            <Link href="/cart">
              <Button
                variant="default"
                className="rounded-full bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Cart ({totalItems})</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden rounded-full ${
                effectiveIsScrolled ? "text-zinc-900 dark:text-white" : "text-white hover:text-white hover:bg-white/20"
              }`}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-zinc-950 z-[70] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Menu
                </span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
                <nav className="flex flex-col gap-4">
                  {[
                    { name: "Home", path: "/" },
                    { name: "Our Story", path: "/our-story" },
                    { name: "Subscriptions", path: "/subscriptions" },
                    { name: "Vending Machines", path: "/locations" }
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-semibold text-zinc-900 dark:text-white p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-6 border-t border-zinc-100 dark:border-zinc-900">
                {!user ? (
                  <Button 
                    className="w-full h-14 rounded-full text-lg font-semibold"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }}
                  >
                    <User className="mr-2 h-5 w-5" /> Sign In
                  </Button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User />}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{user.name || "User"}</p>
                        <p className="text-sm text-zinc-500">{user.phone}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
    </>
  );
}
