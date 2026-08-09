import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryCarousel from "@/components/CategoryCarousel";
import FeaturedMenu from "@/components/FeaturedMenu";

import { getProductsAction } from "@/app/actions/products";

export default async function Home() {
  const productsResponse = await getProductsAction();
  const products = productsResponse.success && productsResponse.data ? productsResponse.data : [];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      <HeroSection />
      <CategoryCarousel />
      <FeaturedMenu initialProducts={products} />
    </main>
  );
}
