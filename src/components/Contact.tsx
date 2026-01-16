import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="section section-light px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/40 mb-6">Get in touch</p>

          <motion.a
            href="mailto:contact@mindmush.com"
            className="group inline-block"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white group-hover:text-[#a78bfa] transition-colors duration-300">
              contact@mindmush.com
            </span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
