"use client";

import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { Employee, SimpleDirectusService } from '@/lib/directus-simple';
import { motion } from 'motion/react';
import Image from 'next/image';

interface VenueTeamProps {
  team: Employee[];
  onRate?: (employee: Employee) => void;
}

export default function VenueTeam({ team, onRate }: VenueTeamProps) {
  if (!team || team.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-left">
          Our Professionals
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, idx) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="group relative cursor-pointer"
          >
            <div className="flex flex-col items-start p-6 rounded-3xl border border-border/50 bg-white hover:border-primary/30 hover:shadow-xl transition-all duration-300">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={member.photo ? SimpleDirectusService.getAssetUrl(member.photo)! : [
                    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
                  ][idx % 6]}
                  alt={member.name}
                  fill
                  unoptimized={true}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {member.name}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mb-3">{member.bio || 'Professional Stylist'}</p>
              
              <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-border/30">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-bold text-foreground">{member.rating ? Number(member.rating).toFixed(1) : '5.0'}</span>
                </div>
                <button 
                  onClick={() => onRate?.(member)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Rate
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
