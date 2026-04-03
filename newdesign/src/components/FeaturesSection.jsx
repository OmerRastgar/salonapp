import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, CreditCard, Star } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Reviews',
    description: 'All reviews come from real customers who have booked through our platform.'
  },
  {
    icon: Clock,
    title: '24/7 Booking',
    description: 'Book appointments anytime, anywhere. No phone calls needed.'
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Your payment information is encrypted and protected at all times.'
  },
  {
    icon: Star,
    title: 'Best Prices',
    description: 'Get exclusive deals and offers from top-rated businesses.'
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4">
            Why book with us
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join millions of satisfied customers who trust us for their self-care needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}