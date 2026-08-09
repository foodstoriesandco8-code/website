"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore/lite";
import Link from "next/link";

export default function AdminDashboard() {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<{name: string, count: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Convert JS Date to Firestore Timestamp
        const startOfToday = Timestamp.fromDate(today);

        const q = query(
          collection(db, "orders"), 
          where("createdAt", ">=", startOfToday)
        );
        
        const querySnapshot = await getDocs(q);
        
        let revenue = 0;
        let orderCount = 0;
        const ordersList: any[] = [];
        const itemsMap: Record<string, number> = {};

        querySnapshot.forEach((doc) => {
          const order = doc.data();
          ordersList.push(order);
          
          if (order.status !== "Cancelled") {
            revenue += (order.billDetails?.grandTotal || 0);
            
            // Tally up items
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                itemsMap[item.name] = (itemsMap[item.name] || 0) + (item.quantity || 1);
              });
            }
          }
          orderCount++;
        });

        // Sort orders by time (newest first) assuming createdAt exists
        ordersList.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });

        // Calculate top selling items
        const sortedItems = Object.entries(itemsMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // top 5

        setTodayRevenue(revenue);
        setTodayOrders(orderCount);
        setRecentOrders(ordersList.slice(0, 5)); // show max 5 recent orders
        setTopSelling(sortedItems);
      } catch (error) {
        console.error("Error fetching today's stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayStats();
  }, []);

  const kpiData = [
    { 
      title: "Today's Revenue", 
      value: isLoading ? "..." : `₹${todayRevenue.toFixed(2)}`, 
      trend: "Today", 
      isPositive: true,
      icon: DollarSign 
    },
    { 
      title: "Today's Orders", 
      value: isLoading ? "..." : todayOrders.toString(), 
      trend: "Today", 
      isPositive: true,
      icon: ShoppingBag 
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-zinc-400">
                <ArrowUpRight className="h-4 w-4" />
                {kpi.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Orders</h2>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
               <ClipboardList className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
               <p className="text-lg font-medium text-zinc-900 dark:text-white">No Orders Yet</p>
               <p className="text-sm">When customers place orders, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900 dark:text-white">{order.customerName}</p>
                        <p className="text-xs text-zinc-500">{order.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                          order.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                        ₹{order.billDetails?.grandTotal?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Popular Items / Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Top Selling Items</h2>
            {topSelling.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500">
                 <TrendingUp className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                 <p className="text-sm font-medium">Not enough data to determine top selling items.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topSelling.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white line-clamp-1">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.count} sold today</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
