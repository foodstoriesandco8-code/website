"use server";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getProductsAction() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
      };
    });
    return { success: true, data: productsData };
  } catch (error) {
    console.error("Server action error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}
