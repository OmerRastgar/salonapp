import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles, Hand, Heart, Flower2, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 1, name: 'Hair Salon', icon: Scissors, color: 'bg-pink-100' },
  { id: 2, name: 'Nail Salon', icon: Hand, color: 'bg-purple-100' },
  { id: 3, name: 'Skin Care', icon: Sparkles, color: 'bg-amber-100' },
  { id: 4, name: 'Massage', icon: Heart, color: 'bg-rose-100' },
  { id: 5, name: 'Spa', icon: Flower2, color: 'bg-teal-100' },
  { id: 6, name: 'Fitness', icon: Dumbbell, color: 'bg-blue-100' },
];

export default function CategorySection() {
  const navigate = useNavigate();
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4">
            Explore by category
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Find the perfect treatment for your wellness journey
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                onClick={() => navigate(`/search?category-name=${encodeURIComponent(category.name)}`)}
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{category.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}