import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="snap-section px-4 sm:px-6 relative">
      {/* Pink nebula glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(236, 72, 153, 0.02) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Center Content */}
      <div className="h-full flex items-center justify-center pb-24 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <p className="text-sm sm:text-base text-white/40 mb-3 sm:mb-4 tracking-wide">
            Get in touch
          </p>
          <a
            href="mailto:contact@mindmush.com"
            className="group inline-block"
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white group-hover:text-pink-400 transition-colors duration-300">
              contact@mindmush.com
            </h2>
          </a>
          <p className="text-sm sm:text-base text-white/30 mt-6 sm:mt-8">
            We respond within 24 hours
          </p>
        </motion.div>
      </div>

      {/* Footer - glassy pill at bottom - hidden on mobile since we have bottom nav */}
      <div className="absolute bottom-20 md:bottom-6 left-4 right-4 sm:left-6 sm:right-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl sm:rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] text-[10px] sm:text-xs text-white/30">
            <span className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">MINDMUSH LLC <span className="w-px h-3 bg-white/20" /> Zürich</span>
            <div className="flex items-center gap-4 sm:gap-6 justify-center sm:justify-start">
              <a href="https://mindmush.com/platform" className="hover:text-white/50 transition-colors">Platform</a>
              <a href="/terms.html" className="hover:text-white/50 transition-colors">Terms</a>
              <a href="/privacy.html" className="hover:text-white/50 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
