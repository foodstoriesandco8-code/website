"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore/lite";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsFetching(true);
    try {
      const querySnapshot = await getDocs(collection(db, "locations"));
      const locData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocations(locData);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, "locations"), {
        name,
        address,
        status: "Active",
        createdAt: serverTimestamp()
      });

      setName("");
      setAddress("");
      setIsSheetOpen(false);
      fetchLocations();
    } catch (error) {
      console.error("Error adding location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vending machine location?")) {
      try {
        await deleteDoc(doc(db, "locations", id));
        setLocations(locations.filter(loc => loc.id !== id));
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = (currentStatus || 'Active') === "Inactive" ? "Active" : "Inactive";
    try {
      await updateDoc(doc(db, "locations", id), { status: newStatus });
      setLocations(locations.map(loc => loc.id === id ? { ...loc, status: newStatus } : loc));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Vending Machines</h1>
          <p className="text-sm text-zinc-500">Manage your active physical locations.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm"
            onClick={() => setIsSheetOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Location
          </Button>
          <SheetContent className="sm:max-w-xl w-full flex flex-col h-full bg-white dark:bg-zinc-950 p-0">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Add Vending Machine</SheetTitle>
                <SheetDescription>Deploy a new physical location.</SheetDescription>
              </SheetHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-location-form" className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input id="name" placeholder="e.g., Tech Park Alpha, Tower B" required value={name} onChange={e => setName(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input id="address" placeholder="e.g., 123 Innovation Drive, Silicon Valley" required value={address} onChange={e => setAddress(e.target.value)} className="h-12" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1 h-12 text-md font-semibold" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                <Button form="add-location-form" type="submit" className="flex-1 h-12 text-md font-semibold bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Deploy"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
        {isFetching ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-zinc-500 font-medium">Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <MapPin className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium text-lg">No vending machines found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location Name</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Address</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-semibold text-zinc-900 dark:text-white">{loc.name}</td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs truncate">{loc.address}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (loc.status || 'Active') === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {loc.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-primary"
                          onClick={() => toggleStatus(loc.id, loc.status)}
                          title={(loc.status || 'Active') === 'Active' ? "Mark Inactive" : "Mark Active"}
                        >
                          {(loc.status || 'Active') === 'Active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500" onClick={() => handleDelete(loc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
