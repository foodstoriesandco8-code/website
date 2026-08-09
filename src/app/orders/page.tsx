"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { ShoppingBag, ArrowLeft, Clock, CheckCircle2, Truck, ChefHat, LogOut, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{name: string, phone: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    const name = localStorage.getItem('userName');
    
    if (phone) {
      setUser({ name: name || 'User', phone });
      fetchMyOrders(phone);
    } else {
      setLoading(false);
      // Not logged in
    }
  }, []);

  const fetchMyOrders = async (phone: string) => {
    try {
      const q = query(
        collection(db, "orders"), 
        where("customerPhone", "==", phone)
      );
      const querySnapshot = await getDocs(q);
      
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      
      let ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out orders delivered more than an hour ago
      ordersData = ordersData.filter((order: any) => {
        if (order.status !== "Delivered") return true;
        const updateTime = order.updatedAt?.toMillis() || order.createdAt?.toMillis() || now;
        return (now - updateTime) <= ONE_HOUR;
      });
      
      // Sort in JavaScript to avoid Firestore composite index requirement
      ordersData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userName');
      setUser(null);
      router.push("/");
      // force reload to update navbar state
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Preparing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Out for Delivery": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Delivered": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Pending": return <Clock className="w-4 h-4 mr-1" />;
      case "Preparing": return <ChefHat className="w-4 h-4 mr-1" />;
      case "Out for Delivery": return <Truck className="w-4 h-4 mr-1" />;
      case "Delivered": return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "Cancelled": return <XCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-zinc-600 hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">My Orders</h1>
            {user && <p className="text-zinc-500 mt-1">Logged in as {user.name} ({user.phone})</p>}
          </div>
          
          {user && (
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !user ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center shadow-sm border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Please Login</h2>
            <p className="text-zinc-500">You need to log in to view your orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">No orders yet</h2>
            <p className="text-zinc-500 mb-8">Looks like you haven't placed any orders with us yet.</p>
            <Link href="/#explore">
              <Button size="lg" className="rounded-full px-8 font-bold h-14 text-lg">
                Explore Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border mb-3 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <p className="text-sm font-medium text-zinc-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="font-semibold text-zinc-900 dark:text-white mt-1">
                      {order.createdAt ? order.createdAt.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : "Just now"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-zinc-500">Total Amount</p>
                    <p className="font-bold text-primary text-2xl">₹{order.billDetails?.grandTotal}</p>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Items Ordered</h3>
                  <div className="space-y-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center h-6 w-6 rounded bg-zinc-200 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-xs">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-white">{item.name}</span>
                        </div>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
