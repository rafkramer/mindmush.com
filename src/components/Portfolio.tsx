import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const launches = [
  {
    id: '01',
    name: 'Debloat AI',
    type: 'Consumer App',
    metric: 'Acquired',
    icon: '/icons/debloat_ai_icon.png',
    description: <>AI-powered face scanning app that helped users reduce puffiness and water retention. Marketed profitably through strategic paid ads and influencer partnerships before being acquired by <a href="https://appstack.tech" target="_blank" rel="noopener noreferrer" className="text-white/70 underline underline-offset-2 hover:text-cyan-400 transition-colors">AppStack</a>.</>,
    link: 'https://www.debloat.ai/',
    linkLabel: 'Website',
    status: 'exited',
  },
  {
    id: '02',
    name: 'DaGame',
    type: 'Mobile Game',
    metric: '#1 App Store',
    icon: '/icons/dagame.png',
    description: 'The viral DaBaby car head meme transformed into an endless runner. Hit #1 on the US App Store, played by an estimated 20% of American high schoolers in 2021. DaBaby caught his own daughter playing it and posted it to IG—various news outlets covered the story.',
    link: 'https://www.xxlmag.com/dababy-daughter-video-game-head-car/',
    linkLabel: 'XXL Mag',
    status: 'live',
  },
  {
    id: '03',
    name: 'FaceKit 3D',
    type: 'Consumer App',
    metric: '1M+ scans',
    icon: '/icons/facekit_3d_icon.png',
    description: 'Facial analysis app leveraging Apple\'s TrueDepth camera for 3D attractiveness scoring. Pioneered a new marketing channel by partnering with a network of 10+ AI-generated influencers, driving organic virality across Instagram and TikTok.',
    link: 'https://apps.apple.com/ch/app/facekit-3d-face-analysis/id6756392359',
    linkLabel: 'App Store',
    status: 'live',
  },
  {
    id: '04',
    name: 'Obama Run',
    type: 'Mobile Game',
    metric: 'Viral Fame',
    icon: '/icons/obama_run_icon.png',
    description: 'The infamous presidential runner that became a meme in its own right. Played live by IShowSpeed and other major creators. Spawned countless fan edits, TikToks, and a dedicated cult following that persists years after launch.',
    link: 'https://apps.apple.com/us/app/obama-run-legacy/id1576515186',
    linkLabel: 'App Store',
    status: 'live',
  },
  {
    id: '05',
    name: 'Cronblizz Blitz',
    type: 'Branded Game',
    metric: '100M+ play minutes',
    icon: '/icons/starry.png',
    description: <>Partnered with PepsiCo to launch <a href="https://www.starrylemonlime.com/" target="_blank" rel="noopener noreferrer" className="text-white/70 underline underline-offset-2 hover:text-cyan-400 transition-colors">Starry's</a> holiday flavor. Built a custom game with influencer <a href="https://www.instagram.com/cron/?hl=en" target="_blank" rel="noopener noreferrer" className="text-white/70 underline underline-offset-2 hover:text-cyan-400 transition-colors">OkCron</a> where players collect and purchase the new drink. 100M+ minutes of playtime, driving brand loyalty and a successful product launch.</>,
    link: 'https://apps.apple.com/app/cranberry-blizz/id6737592107',
    linkLabel: 'App Store',
    status: 'live',
  },
  {
    id: '06',
    name: 'Skibidi War',
    type: 'Mobile Game',
    metric: '3M+ downloads',
    icon: '/icons/Game_image.webp',
    description: <>Official collaboration with <a href="https://www.youtube.com/@DaFuqBoom" target="_blank" rel="noopener noreferrer" className="text-white/70 underline underline-offset-2 hover:text-cyan-400 transition-colors">DaFuq!?Boom!</a>, creators of the Skibidi Toilet saga. Launched to 60M+ social media impressions and 3M downloads in the first two weeks. Hit #1 on the App Store in multiple countries before being discontinued.</>,
    link: 'https://skibidi-toilet.fandom.com/wiki/Skibidi_War:_Toilets_Attack',
    linkLabel: 'Fandom',
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
    <section id="portfolio" className="snap-section px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            <span className="text-cyan-400">Notable</span> Launches
          </h2>
        </motion.div>

        {/* Portfolio Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-[260px_1fr] gap-4 sm:gap-6 lg:gap-8">
          {/* Navigation - Horizontal scroll on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:justify-between lg:h-[400px] -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
          >
            {launches.map((launch) => (
              <button
                key={launch.id}
                onClick={() => setActiveId(launch.id)}
                className={`flex-shrink-0 lg:flex-shrink flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-all duration-200 lg:flex-1 ${
                  activeId === launch.id
                    ? 'bg-white/5'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <span className={`font-mono text-[10px] sm:text-xs transition-colors ${
                  activeId === launch.id ? 'text-cyan-400' : 'text-white/20'
                }`}>
                  {launch.id}
                </span>
                <span className={`text-xs sm:text-sm transition-colors whitespace-nowrap lg:whitespace-normal ${
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
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 lg:p-12 flex flex-col w-full min-h-[320px] sm:min-h-[360px] lg:h-[400px]"
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] flex items-center justify-center overflow-hidden shadow-lg">
                    <img src={activeLaunch.icon} alt={activeLaunch.name} className="w-full h-full object-cover rounded-2xl" />
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
