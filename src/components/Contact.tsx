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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6">
            Talented? Let's talk.
          </h2>
          <a
            href="mailto:contact@mindmush.com"
            className="inline-block text-lg md:text-xl text-white/50 hover:text-pink-400 transition-colors duration-300"
          >
            contact@mindmush.com
          </a>
        </motion.div>
      </div>

      {/* Footer - glassy pill at bottom */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-3 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.05] text-xs text-white/30">
            <span className="flex items-center gap-3">MINDMUSH LLC <span className="w-px h-3 bg-white/20" /> Zürich, Switzerland</span>
            <div className="flex items-center gap-6">
              <a href="#philosophy" className="hover:text-white/50 transition-colors">Partners</a>
              <a href="/terms.html" className="hover:text-white/50 transition-colors">Terms</a>
              <a href="/privacy.html" className="hover:text-white/50 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
