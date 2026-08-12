"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Leaf, Drumstick, Sun, Moon, Calendar, CheckCircle2 } from "lucide-react";

const SUBSCRIPTION_PLANS = [
  { id: "7-days", name: "7 Days Starter", duration: 7, pricePerMeal: 250, popular: false },
  { id: "15-days", name: "15 Days Half-Month", duration: 15, pricePerMeal: 220, popular: true },
  { id: "30-days", name: "30 Days Transformation", duration: 30, pricePerMeal: 200, popular: false },
];

export default function SubscriptionsPage() {
  const { user, isAuthLoaded } = useAuth();
  const router = useRouter();
  
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]);
  const [dietaryType, setDietaryType] = useState<"Veg" | "Non-Veg">("Veg");
  const [mealType, setMealType] = useState<"Lunch" | "Dinner">("Lunch");
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Non-Veg add-on cost
  const dietAddon = dietaryType === "Non-Veg" ? 50 : 0;
  
  const totalAmount = selectedPlan.duration * (selectedPlan.pricePerMeal + dietAddon);

  const handleSubscribe = async () => {
    if (!isAuthLoaded) return;
    
    if (!user) {
      alert("Please log in to subscribe to a meal plan.");
      // In a real app, open login modal or redirect to login page
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create subscription in Firebase
      await addDoc(collection(db, "subscriptions"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.name || "Customer",
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        duration: selectedPlan.duration,
        dietaryPreference: dietaryType,
        mealType: mealType,
        totalAmount: totalAmount,
        status: "Active",
        startDate: serverTimestamp(),
      });
      
      alert("Subscription Activated Successfully!");
      router.push("/profile");
      
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4">
            Healthy Meals on Auto-Pilot
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Choose a plan, set your preferences, and let us take care of your daily nutrition without the hassle of ordering every day.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-zinc-200 dark:border-zinc-800">
          
          {/* STEP 1: Choose Duration */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">1</span> 
              Choose Your Plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan.id === plan.id 
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                      : "border-zinc-200 dark:border-zinc-800 hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm mb-4">₹{plan.pricePerMeal} / meal</p>
                  
                  {selectedPlan.id === plan.id && (
                    <div className="absolute top-4 right-4 text-primary">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* STEP 2: Preferences */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">2</span> 
              Set Preferences
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Dietary Type */}
              <div>
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Dietary Type</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setDietaryType("Veg")}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold transition-all ${
                      dietaryType === "Veg" ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/20" : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Leaf className="w-5 h-5" /> Veg
                  </button>
                  <button 
                    onClick={() => setDietaryType("Non-Veg")}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold transition-all ${
                      dietaryType === "Non-Veg" ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20" : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Drumstick className="w-5 h-5" /> Non-Veg <span className="text-xs font-normal">(+₹50/meal)</span>
                  </button>
                </div>
              </div>

              {/* Meal Type */}
              <div>
                <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Meal Time</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setMealType("Lunch")}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold transition-all ${
                      mealType === "Lunch" ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Sun className="w-5 h-5" /> Lunch
                  </button>
                  <button 
                    onClick={() => setMealType("Dinner")}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold transition-all ${
                      mealType === "Dinner" ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Moon className="w-5 h-5" /> Dinner
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 3: Summary & Checkout */}
          <section className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 sm:p-8 border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-lg">
                <span className="text-zinc-600 dark:text-zinc-400">Selected Plan</span>
                <span className="font-semibold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-zinc-600 dark:text-zinc-400">Total Meals</span>
                <span className="font-semibold">{selectedPlan.duration} Meals</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-zinc-600 dark:text-zinc-400">Base Price (₹{selectedPlan.pricePerMeal} × {selectedPlan.duration})</span>
                <span className="font-semibold">₹{selectedPlan.pricePerMeal * selectedPlan.duration}</span>
              </div>
              {dietaryType === "Non-Veg" && (
                <div className="flex justify-between items-center text-lg">
                  <span className="text-zinc-600 dark:text-zinc-400">Non-Veg Add-on (₹50 × {selectedPlan.duration})</span>
                  <span className="font-semibold">₹{50 * selectedPlan.duration}</span>
                </div>
              )}
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 flex justify-between items-center text-2xl font-bold">
                <span className="text-zinc-900 dark:text-white">Total Amount</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-16 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Subscribe Now • ₹${totalAmount}`}
            </Button>
            <p className="text-center text-sm text-zinc-500 mt-4">
              By subscribing, you agree to our Terms of Service. You can pause or manage your subscription anytime from your Profile.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
