"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Image as ImageIcon, Search, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

const categories = [
  "GRAB & GO — Sandwiches + Wraps",
  "CRAVE — Better Burgers",
  "POWER UP — Salad & Protein Bowls",
  "FRESH BOWLS — Fruit + Yogurt",
  "SIP FRESH — Juices + Coolers",
  "OFFICE COMBOS",
  "GEN Z COMBOS",
  "HEALTHY COMBOS",
  "BEVERAGES- MOCKTAILS & FRAPPE"
];

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    
    // Auto-refresh every 2 minutes (120000 ms)
    const intervalId = setInterval(() => {
      fetchProducts();
    }, 120000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "website");
    
    const res = await fetch("https://api.cloudinary.com/v1_1/zozwqdaz/image/upload", {
      method: "POST",
      body: data,
    });
    
    if (!res.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }
    
    const fileInfo = await res.json();
    return fileInfo.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !actualPrice || !offerPrice || !category) {
      alert("Please fill all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      await addDoc(collection(db, "products"), {
        name,
        actualPrice: Number(actualPrice),
        offerPrice: Number(offerPrice),
        category,
        description,
        image: imageUrl,
        status: "Active",
        createdAt: serverTimestamp()
      });

      // Reset form
      setName("");
      setActualPrice("");
      setOfferPrice("");
      setCategory("");
      setDescription("");
      setImageFile(null);
      setImagePreview("");
      setIsSheetOpen(false);
      
      // Refresh list
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Make sure Cloudinary preset is set to Unsigned.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = (currentStatus || 'Active') === "Unavailable" ? "Active" : "Unavailable";
    try {
      await updateDoc(doc(db, "products", id), { status: newStatus });
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Menu Management</h1>
          <p className="text-sm text-zinc-500">Manage your products, prices, and categories.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchProducts} 
            disabled={isFetching}
            className="hidden sm:flex"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          <SheetContent className="sm:max-w-xl w-full flex flex-col h-full bg-white dark:bg-zinc-950 p-0">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Add New Menu Item</SheetTitle>
                <SheetDescription>
                  Fill in the details below to add a new product to your platform.
                </SheetDescription>
              </SheetHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-menu-form" className="space-y-6" onSubmit={handleSubmit}>
                
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl h-56 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors relative overflow-hidden group"
                  >
                    {imagePreview ? (
                      <>
                        <Image src={imagePreview} alt="Preview" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-semibold flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" /> Change Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                          <ImageIcon className="h-7 w-7" />
                        </div>
                        <p className="text-base font-semibold text-zinc-900 dark:text-white">Click to upload product image</p>
                        <p className="text-sm text-zinc-500 mt-1">SVG, PNG, JPG or GIF</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" placeholder="e.g., Avocado Salad Bowl" required value={name} onChange={e => setName(e.target.value)} className="h-12" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="actualPrice">Actual Price (₹)</Label>
                    <Input id="actualPrice" type="number" placeholder="0.00" required value={actualPrice} onChange={e => setActualPrice(e.target.value)} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                    <Input id="offerPrice" type="number" placeholder="0.00" required value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required value={category} onValueChange={(val) => setCategory(val || "")}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat, idx) => (
                        <SelectItem key={idx} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Briefly describe the ingredients and taste..." 
                    className="resize-none h-28"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1 h-12 text-md font-semibold" onClick={() => setIsSheetOpen(false)}>
                  Cancel
                </Button>
                <Button form="add-menu-form" type="submit" className="flex-1 h-12 text-md font-semibold bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input placeholder="Search menu items..." className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-none" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px] bg-zinc-50 dark:bg-zinc-950 border-none">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat, idx) => (
              <SelectItem key={idx} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
        {isFetching ? (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-zinc-500 font-medium">Loading products...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <ImageIcon className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium text-lg">No menu items found</p>
            <p className="text-zinc-400 text-sm mt-1">Click "Add New Item" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-100 relative shrink-0">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-zinc-200 text-zinc-400"><ImageIcon className="h-5 w-5" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 dark:text-white">₹{item.offerPrice}</span>
                        <span className="text-xs text-zinc-400 line-through">₹{item.actualPrice}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (item.status || 'Active') === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-500 hover:text-primary"
                          onClick={() => toggleStatus(item.id, item.status)}
                          title={(item.status || 'Active') === 'Active' ? "Mark Unavailable" : "Mark Active"}
                        >
                          {(item.status || 'Active') === 'Active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500" onClick={() => handleDelete(item.id)}>
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
