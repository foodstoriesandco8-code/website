"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Leaf, Heart, Sprout } from "lucide-react";

export default function OurStoryPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2000&auto=format&fit=crop"
            alt="Fresh ingredients on a table"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 flex h-full items-center justify-center text-center px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl"
          >
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
              Our <span className="text-primary">Story</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-300">
              Redefining fast food. Because eating healthy shouldn't mean compromising on taste or time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Origin */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-6">
              It Started With a Simple Question
            </h2>
            <div className="space-y-6 text-lg text-zinc-600 dark:text-zinc-400">
              <p>
                In 2024, we looked around and noticed a glaring problem: finding food that was fast, affordable, and genuinely good for you was nearly impossible. You either had to spend hours prepping meals, or settle for highly processed options on the go.
              </p>
              <p>
                We believed there had to be a better way. <strong className="text-zinc-900 dark:text-white font-semibold">Food Stories & Co</strong> was born out of a desire to create a space where honest, nutrient-dense food is easily accessible.
              </p>
              <p>
                We partner directly with local farmers to bring you ingredients at their peak freshness. No hidden sugars, no artificial preservatives. Just real food, crafted with love.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop"
              alt="Chef preparing healthy food"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-primary/5 dark:bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              The principles that guide every meal we make.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Leaf,
                title: "100% Real Food",
                desc: "We never use artificial colors, flavors, or preservatives. If it's not found in nature, it's not in our kitchen."
              },
              {
                icon: Heart,
                title: "Crafted with Care",
                desc: "Every bowl, wrap, and smoothie is made to order by our dedicated team, ensuring maximum flavor and nutrition."
              },
              {
                icon: Sprout,
                title: "Sustainable Sourcing",
                desc: "We prioritize eco-friendly packaging and partner with farmers who practice sustainable agriculture."
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 text-center hover:shadow-xl transition-shadow"
              >
                <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{value.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
