import React from 'react';
import { Star } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

function TeamCard({ member, colorClass }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold ${colorClass} group-hover:ring-2 group-hover:ring-primary/40 transition-all`}>
        {member.avatar}
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold">{member.rating}</span>
        </div>
        <p className="text-sm font-medium text-foreground leading-tight">{member.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
      </div>
    </div>
  );
}

export default function VenueTeam({ team }) {
  return (
    <section id="team">
      <h2 className="text-2xl font-display font-semibold text-foreground mb-6">Team</h2>
      <div className="flex gap-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {team.map((member, i) => (
          <div key={member.id} className="flex-shrink-0">
            <TeamCard member={member} colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
          </div>
        ))}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <button className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 transition-colors text-xs font-medium">
            See all
          </button>
        </div>
      </div>
    </section>
  );
}