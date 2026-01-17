import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="snap-section px-4 sm:px-6 relative">
      {/* Center Content */}
      <div className="h-full flex items-center justify-center pb-24 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 sm:mb-10">
            Talented? <span className="text-pink-400">Let's talk.</span>
          </h2>
          <a
            href="mailto:contact@mindmush.com"
            className="group relative inline-block"
          >
            <div className="absolute -inset-4 bg-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative px-4 sm:px-8 py-3 sm:py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-pink-500/30 transition-all duration-300">
              <span className="text-sm sm:text-xl md:text-2xl font-medium text-white/70 group-hover:text-pink-400 transition-colors duration-300">
                contact@mindmush.com
              </span>
            </div>
          </a>
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
