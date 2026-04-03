import React from 'react';
import { Music, Code, Palette, Boxes, Film, FileText } from 'lucide-react';

export const CreatorEcosystem: React.FC = () => {
  const creators = [
    {
      icon: Music,
      label: 'Musicians',
      gradient: 'from-pink-500 to-rose-500',
      description: 'Protect tracks, albums, beats'
    },
    {
      icon: Palette,
      label: 'Artists',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Secure digital art, designs'
    },
    {
      icon: Film,
      label: 'Filmmakers',
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Register videos, films, content'
    },
    {
      icon: Code,
      label: 'Developers',
      gradient: 'from-green-500 to-emerald-500',
      description: 'Verify code, software, apps'
    },
    {
      icon: Boxes,
      label: 'NFT Creators',
      gradient: 'from-orange-500 to-yellow-500',
      description: 'Link blockchain assets'
    },
    {
      icon: FileText,
      label: 'Writers',
      gradient: 'from-cyan-500 to-blue-500',
      description: 'Timestamp manuscripts, scripts'
    }
  ];

  return (
    <div className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            One System. All Creators.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            DCCS unifies digital ownership across every creative medium. Join the global network of protected creators.
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
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${creator.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-500`}
                  />

                  <div className="relative flex flex-col items-center text-center space-y-4">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${creator.gradient} p-0.5 group-hover:scale-110 transition-transform duration-500`}
                    >
                      <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-1">
                        {creator.label}
                      </h3>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                        {creator.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl" />

          <div className="relative grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  100%
                </span>
              </div>
              <p className="text-gray-400 font-medium">Free Forever</p>
              <p className="text-sm text-gray-500 mt-1">Phase 1: Unlimited uploads</p>
            </div>

            <div>
              <div className="text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Global
                </span>
              </div>
              <p className="text-gray-400 font-medium">Worldwide Recognition</p>
              <p className="text-sm text-gray-500 mt-1">Universal verification system</p>
            </div>

            <div>
              <div className="text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  Forever
                </span>
              </div>
              <p className="text-gray-400 font-medium">Permanent Registry</p>
              <p className="text-sm text-gray-500 mt-1">Immutable ownership proof</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
