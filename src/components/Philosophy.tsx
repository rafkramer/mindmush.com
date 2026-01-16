import { useState } from 'react';
import { motion } from 'framer-motion';

const partners = [
  {
    id: 'dev',
    label: 'Development',
    description: 'Elite studios and builders who ship fast.',
  },
  {
    id: 'dist',
    label: 'Distribution',
    description: 'Creators and platforms with reach.',
  },
  {
    id: 'acq',
    label: 'Acquisition',
    description: 'Buyers for exits, sellers for growth.',
  },
];

export default function Philosophy() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section id="philosophy" className="snap-section px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            Partners compound.
          </h2>
        </motion.div>

        {/* Partner Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setActiveId(partner.id)}
              onMouseLeave={() => setActiveId(null)}
              className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-default
                ${activeId === partner.id
                  ? 'bg-white/[0.03] border-white/[0.1]'
                  : 'bg-transparent border-white/[0.04] hover:border-white/[0.08]'
                }`}
            >
              <div className="flex flex-col h-full">
                <span className="text-xs font-mono text-emerald-400/40 mb-4">
                  0{index + 1}
                </span>
                <h3 className={`text-xl font-medium mb-3 transition-colors duration-300 ${
                  activeId === partner.id ? 'text-emerald-400' : 'text-white'
                }`}>
                  {partner.label}
                </h3>
                <p className={`text-base leading-relaxed transition-colors duration-300
                  ${activeId === partner.id ? 'text-white/50' : 'text-white/30'}`}
                >
                  {partner.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
