"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCart();
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <>
      {totalItems > 0 && (
        <div
          className="fixed bottom-28 md:bottom-6 left-0 right-0 z-[9999] mx-auto max-w-md px-4 sm:px-0"
        >
          <Link href="/cart">
            <div className="flex h-16 w-full items-center justify-between rounded-xl bg-primary px-6 py-3 text-white shadow-2xl transition-transform hover:scale-[1.02] active:scale-95">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
                <span className="text-lg font-bold">₹{totalPrice}</span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                View Cart
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  );
}
