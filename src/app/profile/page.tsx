"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore/lite";
import { Package, Clock, MapPin, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch Orders
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const ordersSnap = await getDocs(ordersQuery);
        const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);

        // Fetch Subscriptions
        const subsQuery = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );
        const subsSnap = await getDocs(subsQuery);
        const subsData = subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubscriptions(subsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Profile Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={48} />}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {user.name || "Customer"}
            </h1>
            <p className="text-zinc-500">{user.email || user.phone}</p>
          </div>
          <Button variant="outline" onClick={logout} className="rounded-full">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "subscriptions" 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Clock className="h-5 w-5" /> My Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "orders" 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Package className="h-5 w-5" /> Order History
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "addresses" 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <MapPin className="h-5 w-5" /> Saved Addresses
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[400px]">
                
                {/* SUBSCRIPTIONS TAB */}
                {activeTab === "subscriptions" && (
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Active Meal Plans</h2>
                    {subscriptions.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                        <p className="font-semibold text-lg">No active subscriptions</p>
                        <p className="mt-2 text-sm">Subscribe to a meal plan to save time and eat healthy every day.</p>
                        <Button className="mt-6 rounded-full bg-primary" onClick={() => window.location.href = '/subscriptions'}>
                          View Subscription Plans
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {subscriptions.map(sub => (
                          <div key={sub.id} className="border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <div className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                                {sub.status || "Active"}
                              </div>
                              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{sub.planName}</h3>
                              <p className="text-sm text-zinc-500">
                                {sub.duration} Days • {sub.mealType} • {sub.dietaryPreference}
                              </p>
                              <p className="text-sm font-medium mt-1">Started: {new Date(sub.startDate?.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-xl font-bold text-primary">₹{sub.totalAmount}</p>
                              <Button variant="outline" size="sm" className="mt-2 rounded-full">
                                Manage
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Order History</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                        <p className="font-semibold text-lg">No orders yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map(order => (
                          <div key={order.id} className="border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-bold text-zinc-900 dark:text-white">Order #{order.id.substring(0, 8)}</span>
                              <span className="text-primary font-bold">₹{order.total}</span>
                            </div>
                            <div className="text-sm text-zinc-500 mb-4 flex justify-between">
                              <span>{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                              <span className="font-semibold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">{order.status || 'Processing'}</span>
                            </div>
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {order.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(", ")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ADDRESSES TAB */}
                {activeTab === "addresses" && (
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Saved Addresses</h2>
                    <div className="text-center py-12 text-zinc-500">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                      <p className="font-semibold text-lg">Manage delivery locations</p>
                      <Button className="mt-6 rounded-full bg-primary text-white">Add New Address</Button>
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
