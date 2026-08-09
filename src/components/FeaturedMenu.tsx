"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search, SlidersHorizontal, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore/lite";

import { useCart } from "@/context/CartContext";

const CATEGORIES = [
  "GRAB & GO — Sandwiches + Wraps",
  "CRAVE — Better Burgers",
  "POWER UP — Salad & Protein Bowls",
  "FRESH BOWLS — Fruit + Yogurt",
  "SIP FRESH — Juices + Coolers",
  "OFFICE COMBOS",
  "GEN Z COMBOS",
  "HEALTHY COMBOS",
  "BEVERAGES- MOCKTAILS & FRAPPE"
];
import { getProductsAction } from "@/app/actions/products";

export default function FeaturedMenu({ initialProducts = [] }: { initialProducts?: any[] }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { items, addToCart, updateQuantity } = useCart();

  // No client-side fetch needed, using initialProducts

  const displayedProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section id="explore" className="pt-16 pb-48 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col items-center justify-between gap-8 mb-16 md:flex-row">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Explore Menu
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Fresh, healthy, and delicious options for every craving.
          </p>
        </div>
        
        {/* Filters and Search (Desktop) */}
        <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 outline-none transition-colors focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Product Grid Grouped by Category */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
          <Search className="h-16 w-16 mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xl font-medium">No items found</p>
          <p className="mt-2 text-sm">Please check back later!</p>
        </div>
      ) : (
        <div className="space-y-16">
          {CATEGORIES.map(category => {
            const categoryProducts = displayedProducts.filter(p => p.category === category);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category} className="scroll-mt-32" id={category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  {category}
                </h3>
                
                <div 
                  className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200 transition-all md:hover:shadow-xl md:hover:scale-[1.02] dark:bg-zinc-900 dark:ring-zinc-800"
                    >
                        {/* Product Image */}
                        <div className={`relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${product.status === 'Unavailable' ? 'grayscale opacity-70' : ''}`}>
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-zinc-100 text-zinc-300">No Image</div>
                          )}
                          
                          {/* Badges */}
                          <div className="absolute left-4 top-4 flex flex-col gap-2">
                            {product.status === 'Unavailable' ? (
                              <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-white shadow-sm">
                                SOLD OUT
                              </span>
                            ) : product.offerPrice < product.actualPrice ? (
                              <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                                {Math.round(((product.actualPrice - product.offerPrice) / product.actualPrice) * 100)}% OFF
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-1 flex-col p-6">
                          <h4 className="text-xl font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 flex-1">
                            {product.description || "Fresh and healthy meal made just for you."}
                          </p>
                          
                          {/* Price and Add */}
                          <div className="mt-6 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                ₹{product.offerPrice}
                              </span>
                              {product.actualPrice > product.offerPrice && (
                                <span className="text-sm font-medium text-zinc-400 line-through">
                                  ₹{product.actualPrice}
                                </span>
                              )}
                            </div>
                            
                            {(() => {
                              if (product.status === 'Unavailable') {
                                return (
                                  <button 
                                    disabled
                                    className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold px-6 shadow-none cursor-not-allowed"
                                  >
                                    Unavailable
                                  </button>
                                );
                              }
                              
                              const cartItem = items.find(item => item.id === product.id);
                              return cartItem ? (
                                <div className="flex h-12 items-center justify-between rounded-xl bg-primary/10 px-2 text-primary ring-1 ring-primary/30 w-28 overflow-hidden transition-all touch-manipulation">
                                  <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="flex h-full w-8 items-center justify-center font-bold text-xl md:hover:bg-primary/20 active:bg-primary/30 transition-colors cursor-pointer">-</button>
                                  <span className="font-bold text-zinc-900 dark:text-white">{cartItem.quantity}</span>
                                  <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="flex h-full w-8 items-center justify-center font-bold text-xl md:hover:bg-primary/20 active:bg-primary/30 transition-colors cursor-pointer">+</button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addToCart({ id: product.id, name: product.name, price: product.offerPrice, image: product.image || "" })}
                                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary border-2 border-primary md:hover:bg-primary md:hover:text-white active:bg-primary active:text-white font-extrabold px-8 shadow-sm transition-all cursor-pointer touch-manipulation"
                                >
                                  ADD
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
