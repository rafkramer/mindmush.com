import { motion } from 'framer-motion';

const approaches = [
  {
    number: '01',
    title: 'Build',
    description: 'We develop apps in-house and with a network of elite studios. From concept to launch in weeks, not months.',
  },
  {
    number: '02',
    title: 'Grow',
    description: 'Strategic partnerships with creators, publishers, and platforms. We know how to make apps go viral.',
  },
  {
    number: '03',
    title: 'Buy & Sell',
    description: 'We acquire promising apps and exit successful ones. Always looking for the next opportunity on both sides.',
  },
];

export default function Philosophy() {
  return (
    <section className="section section-dark px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight max-w-3xl">
            Find great people. Move fast. Ship products.
          </h2>
        </motion.div>

        {/* Approach Cards */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {approaches.map((approach, index) => (
            <motion.div
              key={approach.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Number */}
              <span className="text-xs font-mono text-[#444] mb-8 block">
                {approach.number}
              </span>

              {/* Title */}
              <h3 className="text-2xl font-semibold text-white mb-4">
                {approach.title}
              </h3>

              {/* Description */}
              <p className="text-[#666] leading-relaxed">
                {approach.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
