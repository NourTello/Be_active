import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { SportSection } from '@/components/sport/SportSection';
import { FoodSection } from '@/components/food/FoodSection';

type Tab = 'sport' | 'food';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('sport');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden -z-10">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Background"
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8 relative z-10">
        
        {/* Custom Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full inline-flex shadow-lg shadow-black/5 border border-white">
            <button
              onClick={() => setActiveTab('sport')}
              className={`relative px-8 py-3 rounded-full text-sm font-bold transition-colors ${
                activeTab === 'sport' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeTab === 'sport' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                🏃‍♂️ Activity & Sport
              </span>
            </button>
            <button
              onClick={() => setActiveTab('food')}
              className={`relative px-8 py-3 rounded-full text-sm font-bold transition-colors ${
                activeTab === 'food' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeTab === 'food' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                🥗 Nutrition & Diet
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'sport' ? <SportSection /> : <FoodSection />}
        </motion.div>

      </main>
    </div>
  );
}
