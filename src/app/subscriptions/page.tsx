"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore/lite";
import Navbar from "@/components/Navbar";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveSubscriptions = async () => {
      try {
        const q = query(collection(db, "subscriptions"), where("status", "==", "Active"));
        const querySnapshot = await getDocs(q);
        const subData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubscriptions(subData);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveSubscriptions();
  }, []);

  const handleSubscribe = (planName: string) => {
    const phoneNumber = "919986698096";
    const message = encodeURIComponent(`Hi! I am interested in subscribing to the ${planName}.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6">
            Healthy Habits, Delivered.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Choose a subscription plan that fits your lifestyle. Get fresh, chef-prepared meals delivered directly to your door on a regular schedule.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CalendarDays className="h-16 w-16 mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="text-xl font-bold text-zinc-900 dark:text-white">No active plans found</p>
            <p className="mt-2 text-zinc-500">We are currently crafting new subscription plans. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {subscriptions.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-primary/50 transition-all flex flex-col relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4">
                     <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                       {sub.duration}
                     </span>
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 pr-16">
                    {sub.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₹{sub.cost}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">/ {sub.duration}</span>
                  </div>
                  
                  <div className="flex-1 mb-8">
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full h-14 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-md shadow-primary/20"
                    onClick={() => handleSubscribe(sub.name)}
                  >
                    Subscribe Now
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
