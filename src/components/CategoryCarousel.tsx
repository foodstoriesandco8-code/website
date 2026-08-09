"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const CATEGORIES = [
  { name: "GRAB & GO", image: "/categories/cat_sandwiches.jpg", desc: "Sandwiches + Wraps" },
  { name: "CRAVE", image: "/categories/cat_burgers.jpg", desc: "Better Burgers" },
  { name: "POWER UP", image: "/categories/cat_salads.jpg", desc: "Salad & Protein Bowls" },
  { name: "FRESH BOWLS", image: "/categories/cat_fruits.jpg", desc: "Fruit + Yogurt" },
  { name: "SIP FRESH", image: "/categories/cat_juices.jpg", desc: "Juices + Coolers" },
  { name: "OFFICE COMBOS", image: "/categories/cat_office.jpg", desc: "Professional Lunch" },
  { name: "GEN Z COMBOS", image: "/categories/cat_genz.jpg", desc: "Trendy Meals" },
  { name: "HEALTHY COMBOS", image: "/categories/cat_healthy.jpg", desc: "Diet & Nutrition" },
  { name: "BEVERAGES", image: "/categories/cat_mocktails.jpg", desc: "Mocktails & Frappe" }
];

export default function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const scrollToCategory = (name: string, desc: string) => {
    const fullCategoryName = `${name} — ${desc}`;
    const targetId = fullCategoryName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const element = document.getElementById(targetId);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo(0, y);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Order our best food options
        </h2>
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full bg-zinc-100 border-none hover:bg-zinc-200 text-zinc-600" onClick={() => scroll("left")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-zinc-100 border-none hover:bg-zinc-200 text-zinc-600" onClick={() => scroll("right")}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat, idx) => (
          <div 
            key={idx} 
            onClick={() => scrollToCategory(cat.name, cat.desc)}
            className="flex flex-col items-center gap-4 min-w-[120px] sm:min-w-[140px] snap-start cursor-pointer group"
          >
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-white shadow-sm ring-1 ring-zinc-200 group-hover:shadow-md group-hover:ring-zinc-300 transition-all duration-300">
              {/* Using CSS mix-blend-multiply so the solid white background of the generated images blends if needed, but since container is white it's fine */}
              <Image 
                src={cat.image} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110 mix-blend-multiply" 
                sizes="(max-width: 640px) 112px, 128px"
              />
            </div>
            <div className="text-center">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 hidden sm:block">
                {cat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
