"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveLocations = async () => {
      try {
        const q = query(collection(db, "locations"), where("status", "==", "Active"));
        const querySnapshot = await getDocs(q);
        const locData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLocations(locData);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveLocations();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6">
            Find Our Vending Machines
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Grab a fresh salad or fruit bowl on the go! Find an active smart vending machine near your office or IT park.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Search className="h-16 w-16 mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="text-xl font-bold text-zinc-900 dark:text-white">No active machines found</p>
            <p className="mt-2 text-zinc-500">We're expanding fast! Check back later for new locations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {locations.map((loc, index) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-primary/30 transition-all group"
                >
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <MapPin className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                    {loc.name}
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                    {loc.address}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Active & Stocked
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
