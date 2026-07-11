import React from 'react';
import { Music, Code, Palette, Film, FileText, Mic } from 'lucide-react';

export const CreatorEcosystem: React.FC = () => {
  const creators = [
    {
      icon: Music,
      label: 'Producers',
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Beats, samples, instrumentals'
    },
    {
      icon: Mic,
      label: 'Recording Acts',
      gradient: 'from-cyan-500 to-teal-500',
      description: 'Vocals, albums, EPs, masters'
    },
    {
      icon: Palette,
      label: 'Visual Artists',
      gradient: 'from-teal-500 to-emerald-500',
      description: 'Digital art, designs, covers'
    },
    {
      icon: Film,
      label: 'Filmmakers',
      gradient: 'from-emerald-500 to-blue-500',
      description: 'Videos, films, content'
    },
    {
      icon: Code,
      label: 'Developers',
      gradient: 'from-blue-500 to-indigo-500',
      description: 'Code, software, apps'
    },
    {
      icon: FileText,
      label: 'Writers',
      gradient: 'from-indigo-500 to-blue-400',
      description: 'Scripts, lyrics, manuscripts'
    }
  ];

  return (
    <div className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3">Who DCCS is for</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Indie First. Always.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built for independent creators who have no label, no legal team, and no time — but need real ownership protection.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {creators.map((creator, index) => {
            const Icon = creator.icon;
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${creator.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-500`} />
                  <div className="relative flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${creator.gradient} p-0.5 group-hover:scale-110 transition-transform duration-500`}>
                      <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{creator.label}</h3>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{creator.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative bg-gradient-to-br from-blue-500/10 via-cyan-500/8 to-blue-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
          <div className="relative grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Free</span>
              </div>
              <p className="text-gray-400 font-medium">For Independent Creators</p>
              <p className="text-sm text-gray-500 mt-1">Unlimited uploads, no hidden fees</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">80%</span>
              </div>
              <p className="text-gray-400 font-medium">Goes to You</p>
              <p className="text-sm text-gray-500 mt-1">On every marketplace license sale</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">Yours</span>
              </div>
              <p className="text-gray-400 font-medium">Permanent Registry</p>
              <p className="text-sm text-gray-500 mt-1">Ownership proof that never expires</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
