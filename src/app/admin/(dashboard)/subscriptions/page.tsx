"use client";

import { useState, useEffect } from "react";
import { Plus, CalendarDays, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsFetching(true);
    try {
      const querySnapshot = await getDocs(collection(db, "subscriptions"));
      const subData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscriptions(subData);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost || !duration) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, "subscriptions"), {
        name,
        description,
        cost: Number(cost),
        duration,
        status: "Active",
        createdAt: serverTimestamp()
      });

      setName("");
      setDescription("");
      setCost("");
      setDuration("");
      setIsSheetOpen(false);
      fetchSubscriptions();
    } catch (error) {
      console.error("Error adding subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      try {
        await deleteDoc(doc(db, "subscriptions", id));
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      } catch (error) {
        console.error("Error deleting subscription:", error);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = (currentStatus || 'Active') === "Inactive" ? "Active" : "Inactive";
    try {
      await updateDoc(doc(db, "subscriptions", id), { status: newStatus });
      setSubscriptions(subscriptions.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Subscriptions</h1>
          <p className="text-sm text-zinc-500">Manage recurring subscription plans.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-md rounded-full px-6 h-12" type="button">
              <Plus className="mr-2 h-4 w-4" /> Add Plan
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl w-full flex flex-col h-full bg-white dark:bg-zinc-950 p-0">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Add Subscription Plan</SheetTitle>
                <SheetDescription>Create a new recurring plan for your customers.</SheetDescription>
              </SheetHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-subscription-form" className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input id="name" placeholder="e.g., Weekly Power Salad Plan" required value={name} onChange={e => setName(e.target.value)} className="h-12" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost (₹)</Label>
                    <Input id="cost" type="number" placeholder="0.00" required value={cost} onChange={e => setCost(e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" placeholder="e.g., 1 Week, 1 Month" required value={duration} onChange={e => setDuration(e.target.value)} className="h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what is included in this plan..." 
                    className="resize-none h-28"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1 h-12 text-md font-semibold" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                <Button form="add-subscription-form" type="submit" className="flex-1 h-12 text-md font-semibold bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Create Plan"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
        {isFetching ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-zinc-500 font-medium">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <CalendarDays className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium text-lg">No subscription plans found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Plan Name</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cost</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-semibold text-zinc-900 dark:text-white">{sub.name}</td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs truncate" title={sub.description}>{sub.description || "-"}</td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">{sub.duration}</td>
                    <td className="p-4 font-semibold text-zinc-900 dark:text-white">₹{sub.cost}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (sub.status || 'Active') === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {sub.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-primary"
                          onClick={() => toggleStatus(sub.id, sub.status)}
                          title={(sub.status || 'Active') === 'Active' ? "Mark Inactive" : "Mark Active"}
                        >
                          {(sub.status || 'Active') === 'Active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500" onClick={() => handleDelete(sub.id)}>
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
