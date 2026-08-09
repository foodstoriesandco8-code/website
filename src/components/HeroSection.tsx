"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          poster="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop"
        >
          {/* Using a reliable food prep video placeholder */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-preparing-a-healthy-salad-with-vegetables-49866-large.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl animate-in slide-in-from-bottom-8 fade-in duration-1000">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            <span className="block text-primary">EAT FRESH.</span>
            <span className="block">LIVE BETTER.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-200 sm:text-2xl">
            Healthy meals made fresh every day. Fuel your body with the best ingredients nature has to offer.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              href="/cart" 
              className="group flex items-center justify-center h-14 w-full sm:w-auto rounded-full bg-primary px-8 text-lg font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105"
            >
              Order Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <a 
              href="#explore" 
              className="flex items-center justify-center h-14 w-full sm:w-auto rounded-full border-2 border-white bg-black/20 px-8 text-lg font-semibold text-white transition-all hover:bg-white hover:text-black"
            >
              Explore Menu
            </a>
          </div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-white"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-300">
            Scroll
          </span>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
