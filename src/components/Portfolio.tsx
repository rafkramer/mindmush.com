import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const launches = [
  {
    id: '01',
    name: 'Skibidi War',
    type: 'Mobile Game',
    metric: '3M+ downloads',
    description: 'Official collaboration with the creators of the Skibidi Toilet saga. 60M+ social media views and 3M downloads in the first two weeks.',
    status: 'live',
  },
  {
    id: '02',
    name: 'Debloat AI',
    type: 'Consumer App',
    metric: 'Acquired',
    description: 'Beauty consumer application profitably scaled with paid ads and influencer marketing. Sold to AppStack for a revenue multiple.',
    status: 'exited',
  },
  {
    id: '03',
    name: 'DaGame',
    type: 'Mobile Game',
    metric: '#1 App Store',
    description: 'Based on the DaBaby car head meme. Played by at least 25% of American high schoolers in 2021, including DaBaby himself.',
    status: 'live',
  },
  {
    id: '04',
    name: 'Stealth Projects',
    type: 'Various',
    metric: 'In Progress',
    description: 'Multiple ventures currently in development. We partner with exceptional founders and teams to bring ideas to market.',
    status: 'building',
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
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-1"
          >
            {launches.map((launch) => (
              <button
                key={launch.id}
                onClick={() => setActiveId(launch.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
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
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-10 min-h-[320px] flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-xs font-mono text-white/30 uppercase tracking-wider">
                      {activeLaunch.type}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mt-1">
                      {activeLaunch.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}>
                    {activeLaunch.metric}
                  </span>
                </div>

                {/* Description */}
                <p className="text-base md:text-lg text-white/50 leading-relaxed flex-1">
                  {activeLaunch.description}
                </p>

                {/* Status */}
                <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  <span className="text-xs text-white/40 capitalize">{activeLaunch.status}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
