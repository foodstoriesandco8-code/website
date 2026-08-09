"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore/lite";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Image from "next/image";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string, phone: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [step, setStep] = useState<"phone" | "details">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    setIsSecure(window.isSecureContext);
  }, []);

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const q = query(collection(db, "users"), where("phone", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // User exists -> Log them in
        const userData = querySnapshot.docs[0].data();
        onSuccess({ name: userData.name || "", phone: userData.phone });
      } else {
        // User doesn't exist -> Proceed to registration details
        setStep("details");
      }
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            if (data.address && data.address.postcode) {
              setPincode(data.address.postcode);
            }
          } else {
            setAddress(`${latitude}, ${longitude}`); // fallback
          }
        } catch (err) {
          console.error("Geocoding error", err);
          setError("Failed to fetch address from location.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn(err);
        setError("Location access denied. Note: Phones block location on local networks (requires HTTPS). Please type manually for now.");
        setLoading(false);
      }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !pincode.trim()) {
      setError("Please fill in all required fields (Name, Address, Pincode)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await addDoc(collection(db, "users"), {
        phone: phoneNumber,
        name,
        flatNo,
        address,
        pincode,
        createdAt: serverTimestamp()
      });
      onSuccess({ name, phone: phoneNumber });
    } catch (err: any) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep("phone");
      setPhoneNumber("");
      setName("");
      setFlatNo("");
      setAddress("");
      setPincode("");
      setError("");
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-[400px] p-0 flex flex-col bg-white dark:bg-zinc-950">
        
        {/* Header section with Swiggy-like design */}
        <div className="flex flex-col p-8 pb-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {step === "phone" ? "Login" : "Welcome"}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {step === "phone" 
                  ? "or create an account" 
                  : "Let's set up your profile"
                }
              </p>
            </div>
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
              <Image 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop"
                alt="Food Graphic"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="h-0.5 w-12 bg-black dark:bg-white mb-6"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

          {step === "phone" ? (
            <form onSubmit={handleCheckPhone} className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center rounded-none border-b border-zinc-300 focus-within:border-black dark:border-zinc-700 dark:focus-within:border-white transition-colors">
                  <span className="text-zinc-500 pr-3 font-medium">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={15}
                    required
                    className="h-14 w-full bg-transparent outline-none placeholder:text-zinc-400 font-medium text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-none bg-primary text-lg font-bold text-white hover:bg-primary/90" disabled={loading}>
                {loading ? "CHECKING..." : "CONTINUE"}
              </Button>
              <p className="text-xs text-zinc-500">
                By clicking on Continue, I accept the <a href="#" className="text-zinc-900 dark:text-zinc-300 underline">Terms & Conditions</a> & <a href="#" className="text-zinc-900 dark:text-zinc-300 underline">Privacy Policy</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center rounded-none border-b border-zinc-300 focus-within:border-black dark:border-zinc-700 dark:focus-within:border-white transition-colors">
                  <input
                    id="name"
                    type="text"
                    placeholder="Your Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-14 w-full bg-transparent outline-none placeholder:text-zinc-400 font-medium text-zinc-900 dark:text-white"
                  />
                </div>

                {isSecure && (
                  <div className="pt-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleGetLocation} 
                      disabled={loading}
                      className="w-full h-12 border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-2 font-semibold"
                    >
                      <MapPin className="h-5 w-5" />
                      {loading ? "Locating..." : "Track Live Location"}
                    </Button>
                  </div>
                )}

                <div className="flex items-center rounded-none border-b border-zinc-300 focus-within:border-black dark:border-zinc-700 dark:focus-within:border-white transition-colors">
                  <input
                    id="flatNo"
                    type="text"
                    placeholder="Flat / Room No. / Building Name"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    className="h-14 w-full bg-transparent outline-none placeholder:text-zinc-400 font-medium text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex items-start rounded-none border-b border-zinc-300 focus-within:border-black dark:border-zinc-700 dark:focus-within:border-white transition-colors mt-2">
                  <textarea
                    id="address"
                    placeholder="Street / Locality / Delivery Address *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={3}
                    className="py-3 w-full bg-transparent outline-none placeholder:text-zinc-400 font-medium text-zinc-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center rounded-none border-b border-zinc-300 focus-within:border-black dark:border-zinc-700 dark:focus-within:border-white transition-colors">
                  <input
                    id="pincode"
                    type="text"
                    placeholder="Pincode *"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="h-14 w-full bg-transparent outline-none placeholder:text-zinc-400 font-medium text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-none bg-primary text-lg font-bold text-white hover:bg-primary/90 mt-6" disabled={loading}>
                {loading ? "SAVING..." : "COMPLETE PROFILE"}
              </Button>
              
              <button 
                type="button" 
                className="flex items-center text-sm font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors mt-4" 
                onClick={() => setStep("phone")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Go back
              </button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
