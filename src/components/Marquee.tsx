import { motion } from 'framer-motion';

const stats = [
  '8 #1 Apps',
  '3 Exits',
  '300M+ Views',
  '6 Years',
  '12 Partners',
  '$2M+ Revenue',
];

export default function Marquee() {
  return (
    <section className="relative py-5 overflow-hidden border-y border-[#222233]">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -2000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {[...Array(4)].map((_, setIndex) => (
          <div key={setIndex} className="flex">
            {stats.map((stat, index) => (
              <span
                key={`${setIndex}-${index}`}
                className="text-sm font-medium text-white/70 mx-12 md:mx-16"
              >
                {stat}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
