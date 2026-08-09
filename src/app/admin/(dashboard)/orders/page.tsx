"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ShoppingBag, ChevronDown, CheckCircle2, Clock, Truck, ChefHat, Trash2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: { toMillis: () => Date.now() } } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const executeClearAll = async () => {
    setIsClearModalOpen(false);
    setLoading(true);
    try {
      const q = query(collection(db, "orders"));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(document => 
        deleteDoc(doc(db, "orders", document.id))
      );
      
      await Promise.all(deletePromises);
      setOrders([]);
    } catch (error) {
      console.error("Error deleting orders:", error);
      alert("Failed to delete all orders");
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Orders Manager</h1>
          <p className="text-zinc-500">View and manage all customer orders</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsClearModalOpen(true)} variant="outline" className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={() => {
            setLoading(true);
            fetchOrders();
          }} variant="outline" className="h-10" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Orders
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center">
          <ShoppingBag className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Orders Yet</h2>
          <p className="text-zinc-500">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Order Meta */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Order ID</p>
                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white uppercase">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Date</p>
                    <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                      {order.createdAt ? order.createdAt.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : "Just now"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Total Amount</p>
                    <p className="font-bold text-primary text-lg">₹{order.billDetails?.grandTotal}</p>
                  </div>
                </div>

                {/* Status Updater */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  
                  <div className="relative group">
                    <Button variant="outline" size="sm" className="h-9 gap-2" disabled={updatingId === order.id}>
                      {updatingId === order.id ? "Updating..." : "Change Status"} <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-1">
                      {["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-50/50 dark:bg-zinc-950/50">
                
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Customer Details</h3>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-medium text-zinc-500 w-24 inline-block">Name:</span> <span className="font-semibold text-zinc-900 dark:text-white">{order.customerName}</span></p>
                    <p><span className="font-medium text-zinc-500 w-24 inline-block">Phone:</span> <span className="font-semibold text-zinc-900 dark:text-white">{order.customerPhone}</span></p>
                    
                    {order.deliveryAddress && (
                      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="font-medium text-zinc-500 mb-1">Delivery Address:</p>
                        <p className="font-medium text-zinc-900 dark:text-white leading-relaxed">
                          {order.deliveryAddress.flatNo}, {order.deliveryAddress.address} <br/>
                          Pincode: {order.deliveryAddress.pincode}
                        </p>
                        {order.deliveryAddress.contactNumber && (
                          <p className="mt-2"><span className="font-medium text-zinc-500">Contact:</span> <span className="font-semibold text-zinc-900 dark:text-white">{order.deliveryAddress.contactNumber}</span></p>
                        )}
                        {order.deliveryAddress.deliveryNotes && (
                          <p className="mt-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-2 rounded-lg border border-orange-100 dark:border-orange-900/50">
                            <span className="font-bold">Note:</span> {order.deliveryAddress.deliveryNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Order Items</h3>
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
                  
                  <div className="mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>
                      <span>₹{order.billDetails?.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Delivery</span>
                      <span>₹{order.billDetails?.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Taxes</span>
                      <span>₹{order.billDetails?.gst}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete All Orders?</h2>
            <p className="text-zinc-500 text-sm mb-6">
              This action cannot be undone. This will permanently delete all order history from the database.
            </p>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" className="flex-1 font-semibold rounded-xl h-12" onClick={() => setIsClearModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl h-12 shadow-lg shadow-red-600/20" onClick={executeClearAll}>
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
