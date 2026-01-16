import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const launches = [
  {
    id: '01',
    name: 'Skibidi War',
    type: 'Mobile Game',
    metric: '3M+ downloads',
    icon: '🚽',
    description: 'Official collaboration with the creators of the Skibidi Toilet saga. Launched to 60M+ social media impressions and 3M downloads in the first two weeks. Featured on the App Store front page and covered by major gaming publications.',
    link: 'https://apps.apple.com',
    linkLabel: 'App Store',
    status: 'live',
  },
  {
    id: '02',
    name: 'Debloat AI',
    type: 'Consumer App',
    metric: 'Acquired',
    icon: '✨',
    description: 'AI-powered beauty and wellness application that helped users track and optimize their health goals. Profitably scaled through strategic paid acquisition and influencer partnerships before being acquired by AppStack for a revenue multiple.',
    link: null,
    linkLabel: null,
    status: 'exited',
  },
  {
    id: '03',
    name: 'DaGame',
    type: 'Mobile Game',
    metric: '#1 App Store',
    icon: '🚗',
    description: 'The viral DaBaby car head meme transformed into an endless runner. Hit #1 on the US App Store, played by an estimated 20% of American high schoolers in 2021. Even DaBaby himself played it—and posted about it to his millions of followers.',
    link: 'https://apps.apple.com',
    linkLabel: 'App Store',
    status: 'live',
  },
  {
    id: '04',
    name: 'Obama Run',
    type: 'Mobile Game',
    metric: 'Viral Fame',
    icon: '🏃',
    description: 'The infamous presidential runner that became a meme in its own right. Played live by IShowSpeed, KSI, and other major creators. Spawned countless fan edits, TikToks, and a dedicated cult following that persists years after launch.',
    link: 'https://apps.apple.com',
    linkLabel: 'App Store',
    status: 'live',
  },
  {
    id: '05',
    name: 'FaceKit 3D',
    type: 'Consumer App',
    metric: '1M+ scans',
    icon: '📸',
    description: 'Revolutionary facial analysis app leveraging Apple\'s TrueDepth camera for 3D attractiveness scoring. Pioneered a new marketing channel by partnering with a network of 50+ AI-generated influencers, driving organic virality across Instagram and TikTok.',
    link: 'https://apps.apple.com',
    linkLabel: 'App Store',
    status: 'live',
  },
  {
    id: '06',
    name: 'Amanda AI',
    type: 'Consumer App',
    metric: 'Acquired',
    icon: '💬',
    description: 'AI relationship coach that helped users navigate difficult conversations and interpersonal conflicts. Rode the wave of conversational AI to rapid growth, then was acquired by ParkmanLabs to be integrated into their mental wellness platform.',
    link: null,
    linkLabel: null,
    status: 'exited',
  },
];

export default function Portfolio() {
  const [activeId, setActiveId] = useState('01');
  const activeLaunch = launches.find(l => l.id === activeId) || launches[0];

  const statusColors = {
    live: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    exited: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    building: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400 animate-pulse' },
  };

  const status = statusColors[activeLaunch.status as keyof typeof statusColors];

  return (
    <section id="portfolio" className="snap-section px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            Notable Launches
          </h2>
        </motion.div>

        {/* Portfolio Grid */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between h-[400px]"
          >
            {launches.map((launch) => (
              <button
                key={launch.id}
                onClick={() => setActiveId(launch.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-200 flex-1 ${
                  activeId === launch.id
                    ? 'bg-white/5'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <span className={`font-mono text-xs transition-colors ${
                  activeId === launch.id ? 'text-cyan-400' : 'text-white/20'
                }`}>
                  {launch.id}
                </span>
                <span className={`text-sm transition-colors ${
                  activeId === launch.id ? 'text-white' : 'text-white/50'
                }`}>
                  {launch.name}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Detail Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10 md:p-12 flex flex-col w-full h-[400px]"
              >
                {/* Top row - Type and Metric */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono text-cyan-400/60 uppercase tracking-widest">
                    {activeLaunch.type}
                  </span>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}>
                    {activeLaunch.metric}
                  </span>
                </div>

                {/* Icon and Title */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] flex items-center justify-center text-3xl shadow-lg">
                    {activeLaunch.icon}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-semibold text-white">
                    {activeLaunch.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-base md:text-lg text-white/50 leading-relaxed flex-1">
                  {activeLaunch.description}
                </p>

                {/* Footer */}
                {activeLaunch.link && (
                  <div className="mt-auto pt-8">
                    <a
                      href={activeLaunch.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-sm text-white/40 hover:text-cyan-400 transition-colors"
                    >
                      View on {activeLaunch.linkLabel}
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
