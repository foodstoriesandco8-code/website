import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore/lite";

const CATEGORIES = [
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

const generateDummyProducts = () => {
  const products: any[] = [];
  
  CATEGORIES.forEach((category) => {
    for (let i = 1; i <= 5; i++) {
      const isVeg = Math.random() > 0.4; // 60% chance veg
      products.push({
        name: `${category.split(' — ')[0] || category} Item ${i}`,
        actualPrice: 300 + Math.floor(Math.random() * 200),
        offerPrice: 200 + Math.floor(Math.random() * 150),
        category: category,
        dietaryType: isVeg ? "Veg" : "Non-Veg",
        description: `This is a delicious dummy product for ${category}. Freshly made with high quality ingredients.`,
        image: "",
        status: "Active",
        createdAt: serverTimestamp()
      });
    }
  });
  
  return products;
};

export async function GET() {
  try {
    const products = generateDummyProducts();
    const productsRef = collection(db, "products");
    
    const promises = products.map(product => addDoc(productsRef, product));
    await Promise.all(promises);
    
    return NextResponse.json({ success: true, message: `Successfully added ${products.length} dummy products.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
