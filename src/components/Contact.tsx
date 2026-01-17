import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="snap-section px-6 relative">
      {/* Center Content */}
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-10">
            Talented? <span className="text-pink-400">Let's talk.</span>
          </h2>
          <a
            href="mailto:contact@mindmush.com"
            className="group relative inline-block"
          >
            <div className="absolute -inset-4 bg-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative px-8 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-pink-500/30 transition-all duration-300">
              <span className="text-xl md:text-2xl font-medium text-white/70 group-hover:text-pink-400 transition-colors duration-300">
                contact@mindmush.com
              </span>
            </div>
          </a>
        </motion.div>
      </div>

      {/* Footer - glassy pill at bottom */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-3 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] text-xs text-white/30">
            <span className="flex items-center gap-3">MINDMUSH LLC <span className="w-px h-3 bg-white/20" /> Zürich, Switzerland</span>
            <div className="flex items-center gap-6">
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
