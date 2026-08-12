"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Receipt, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore/lite";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [user, setUser] = useState<{name: string, phone: string} | null>(null);
  
  // Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({ flatNo: "", address: "", pincode: "", contactNumber: "", deliveryNotes: "" });
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  
  // Schedule State
  const [orderType, setOrderType] = useState<"ASAP" | "SCHEDULED">("ASAP");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  
  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const phone = localStorage.getItem('userPhone');
    const name = localStorage.getItem('userName');
    if (phone) {
      setUser({ name: name || 'User', phone });
    }
  }, []);

  const handleLoginSuccess = (userData: {name: string, phone: string}) => {
    localStorage.setItem('userPhone', userData.phone);
    if (userData.name) localStorage.setItem('userName', userData.name);
    setUser(userData);
    setIsLoginOpen(false);
    // Seamlessly continue checkout if there are items in the cart
    if (items.length > 0) {
      continueCheckout(userData);
    }
  };

  const deliveryFee = 40;
  const gst = Math.round(totalPrice * 0.05); // 5% GST
  const grandTotal = totalPrice + deliveryFee + gst;

  const continueCheckout = async (currentUser: {name: string, phone: string}) => {
    if (items.length === 0) return;

    setIsFetchingAddress(true);
    try {
      const q = query(collection(db, "users"), where("phone", "==", currentUser.phone));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setDeliveryAddress({
          flatNo: userData.flatNo || "",
          address: userData.address || "",
          pincode: userData.pincode || "",
          contactNumber: userData.phone || currentUser.phone || "",
          deliveryNotes: ""
        });
      } else {
        setDeliveryAddress({
          flatNo: "",
          address: "",
          pincode: "",
          contactNumber: currentUser.phone || "",
          deliveryNotes: ""
        });
      }
    } catch (e) {
      console.error("Failed to fetch address", e);
      setDeliveryAddress({
        flatNo: "",
        address: "",
        pincode: "",
        contactNumber: currentUser.phone || "",
        deliveryNotes: ""
      });
    } finally {
      setIsFetchingAddress(false);
      setAddressModalOpen(true);
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    continueCheckout(user);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.address?.trim() || !deliveryAddress.pincode?.trim() || !deliveryAddress.contactNumber?.trim()) {
      alert("Please provide a valid delivery address, pincode, and contact number.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: user?.name || "Guest",
        customerPhone: user?.phone || "",
        deliveryAddress: deliveryAddress,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        billDetails: {
          subtotal: totalPrice,
          deliveryFee,
          gst,
          grandTotal
        },
        orderType: orderType,
        scheduledTime: orderType === "SCHEDULED" ? `${scheduledDate} ${scheduledTime}` : null,
        status: "Pending",
        createdAt: serverTimestamp()
      });
      
      setAddressModalOpen(false);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
          <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mb-2">
            Your delicious healthy meal is being prepared and will be out for delivery soon.
          </p>
          <p className="text-lg font-bold text-primary max-w-md mb-8">
            Kindly wait, our team will contact you shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Link href="/">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 font-bold text-lg w-full sm:w-auto border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                Return to Home
              </Button>
            </Link>
            <Link href="/orders">
              <Button size="lg" className="rounded-full px-8 h-14 font-bold text-lg w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                Track Order
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24 relative">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-zinc-600 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Link>
        
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-8">Secure Checkout</h1>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-zinc-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/#explore">
              <Button size="lg" className="rounded-full px-8 font-bold h-14 text-lg">
                Explore Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Items */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                  Order Summary
                </h2>
                
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.cartId || item.id} className="flex gap-4 sm:gap-6 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">No Img</div>
                        )}
                      </div>
                      
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-2">{item.name}</h3>
                            {item.addOns && item.addOns.length > 0 && (
                              <p className="text-xs text-zinc-500 mt-1">
                                + {item.addOns.map(a => a.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-lg">₹{item.price * item.quantity}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex h-10 items-center justify-between rounded-lg bg-zinc-100 dark:bg-zinc-800 px-1 w-24">
                            <button onClick={() => updateQuantity(item.cartId || item.id, item.quantity - 1)} className="flex h-full w-8 items-center justify-center font-bold text-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">-</button>
                            <span className="font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartId || item.id, item.quantity + 1)} className="flex h-full w-8 items-center justify-center font-bold text-lg text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">+</button>
                          </div>
                          
                          <button onClick={() => removeFromCart(item.cartId || item.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-2">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Bill & Action */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 sticky top-32">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center">
                  <Receipt className="mr-3 h-5 w-5 text-primary" />
                  Bill Details
                </h2>
                
                <div className="space-y-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span className="text-zinc-900 dark:text-white">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee (Standard)</span>
                    <span className="text-zinc-900 dark:text-white">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (5% GST)</span>
                    <span className="text-zinc-900 dark:text-white">₹{gst}</span>
                  </div>
                  
                  <div className="border-t border-dashed border-zinc-200 dark:border-zinc-700 my-4 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">To Pay</span>
                    <span className="text-2xl font-black text-primary">₹{grandTotal}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full h-14 mt-6 rounded-xl font-bold text-lg shadow-xl"
                  onClick={handleCheckoutClick}
                  disabled={isFetchingAddress}
                >
                  {isFetchingAddress ? "Fetching Address..." : `PLACE ORDER • ₹${grandTotal}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Confirmation Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">Confirm Delivery Address</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 block mb-3">Order Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="orderType" value="ASAP" checked={orderType === "ASAP"} onChange={() => setOrderType("ASAP")} className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Order Now (ASAP)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="orderType" value="SCHEDULED" checked={orderType === "SCHEDULED"} onChange={() => setOrderType("SCHEDULED")} className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Schedule for Later</span>
                  </label>
                </div>
                
                {orderType === "SCHEDULED" && (
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-zinc-500 block mb-1">Date</label>
                      <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:border-primary text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-zinc-500 block mb-1">Time</label>
                      <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:border-primary text-sm" />
                    </div>
                  </div>
                )}
              </div>
            
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Flat / Room No. / Building Name</label>
                <input 
                  type="text" 
                  value={deliveryAddress.flatNo} 
                  onChange={e => setDeliveryAddress({...deliveryAddress, flatNo: e.target.value})}
                  className="w-full mt-1.5 p-3.5 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-primary transition-colors font-medium"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Street / Locality / Full Address</label>
                <textarea 
                  value={deliveryAddress.address} 
                  onChange={e => setDeliveryAddress({...deliveryAddress, address: e.target.value})}
                  className="w-full mt-1.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-primary transition-colors resize-none font-medium"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Pincode</label>
                <input 
                  type="text" 
                  value={deliveryAddress.pincode} 
                  onChange={e => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                  className="w-full mt-1.5 p-3.5 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-primary transition-colors font-medium"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Number</label>
                <input 
                  type="tel" 
                  value={deliveryAddress.contactNumber} 
                  onChange={e => setDeliveryAddress({...deliveryAddress, contactNumber: e.target.value})}
                  className="w-full mt-1.5 p-3.5 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-primary transition-colors font-medium"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Delivery Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Leave at the door"
                  value={deliveryAddress.deliveryNotes} 
                  onChange={e => setDeliveryAddress({...deliveryAddress, deliveryNotes: e.target.value})}
                  className="w-full mt-1.5 p-3.5 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-primary transition-colors font-medium"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              <Button className="w-full h-14 font-bold text-lg rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                {isPlacingOrder ? "Confirming..." : `Confirm • ₹${grandTotal}`}
              </Button>
              <Button variant="ghost" className="w-full h-12 font-bold rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white" onClick={() => setAddressModalOpen(false)}>
                Back to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
    </main>
  );
}
