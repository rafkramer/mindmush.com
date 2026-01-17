import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useInView } from 'framer-motion';

// Sound effects
const playSound = (src: string, volume = 0.3) => {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {}); // Ignore autoplay errors
};

const conversations = [
  {
    id: 'creators',
    title: 'Creators',
    subtitle: 'Audience → App',
    messages: [
      { timestamp: 'Today 2:34 PM', isHeader: true },
      { sender: 'partner', text: 'I have 2M followers but no app' },
      { sender: 'mindmush', text: "We got you. What's the niche?" },
      { sender: 'partner', text: 'Fitness accountability' },
      { sender: 'mindmush', text: 'Give us 8 weeks' },
      { timestamp: '4 months later', isHeader: true },
      { sender: 'partner', text: 'Just hit $47k/mo 🤯' },
      { sender: 'mindmush', text: 'Told you' },
    ],
  },
  {
    id: 'builders',
    title: 'Builders',
    subtitle: 'Code → Growth',
    messages: [
      { timestamp: 'March 15', isHeader: true },
      { sender: 'partner', text: 'Built an app, maybe 200 users, stuck' },
      { sender: 'mindmush', text: "What's the retention look like?" },
      { sender: 'partner', text: '40% d7' },
      { sender: 'mindmush', text: "Product's solid. Growth is the gap. We're in." },
      { timestamp: '8 months later', isHeader: true },
      { sender: 'partner', text: 'Just got acquired for $180k' },
      { sender: 'mindmush', text: '🤝' },
    ],
  },
  {
    id: 'academics',
    title: 'Academics',
    subtitle: 'Research → Revenue',
    messages: [
      { timestamp: 'January 22', isHeader: true },
      { sender: 'partner', text: 'PhD in computer vision, published papers, no product' },
      { sender: 'mindmush', text: 'What can your tech actually do?' },
      { sender: 'partner', text: 'Real-time face analysis, way better than existing apps' },
      { sender: 'mindmush', text: "Let's commercialize it" },
      { timestamp: '6 months later', isHeader: true },
      { sender: 'partner', text: 'App is top 10 in Health & Fitness' },
      { sender: 'mindmush', text: 'Research meets reality' },
    ],
  },
  {
    id: 'buyers',
    title: 'Buyers',
    subtitle: 'Capital → Apps',
    messages: [
      { timestamp: 'September 8', isHeader: true },
      { sender: 'partner', text: 'Interested in buying one of your apps' },
      { sender: 'mindmush', text: 'Which one caught your eye?' },
      { sender: 'partner', text: 'The AI face scanning one. What are you looking for?' },
      { sender: 'mindmush', text: 'Right buyer, fair price, smooth transition' },
      { timestamp: '3 weeks later', isHeader: true },
      { sender: 'partner', text: 'Deal closed. Team is thrilled.' },
      { sender: 'mindmush', text: 'Pleasure doing business' },
    ],
  },
  {
    id: 'sellers',
    title: 'Sellers',
    subtitle: 'Apps → Exit',
    messages: [
      { timestamp: 'November 12', isHeader: true },
      { sender: 'partner', text: 'Built this app 3 years ago, ready to move on' },
      { sender: 'mindmush', text: "What's the MRR and growth look like?" },
      { sender: 'partner', text: '$12k MRR, flat but solid retention' },
      { sender: 'mindmush', text: 'We might be interested. Let us dig in.' },
      { timestamp: '6 weeks later', isHeader: true },
      { sender: 'partner', text: 'Just signed. Thanks for the smooth process' },
      { sender: 'mindmush', text: "We'll take it from here" },
    ],
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Alex Chen',
    role: 'Fitness Creator',
    followers: '2.1M followers',
    quote: "MINDMUSH took my idea and turned it into a $47k/mo business in 4 months. They handle the tech so I can focus on content.",
    avatar: '/icons/debloat_ai_icon.png',
  },
  {
    id: 2,
    name: 'Sarah Kim',
    role: 'Indie Developer',
    followers: 'Solo founder',
    quote: "I was stuck at 200 users for a year. MINDMUSH helped me scale and exit for $180k. Best decision I made.",
    avatar: '/icons/facekit_3d_icon.png',
  },
  {
    id: 3,
    name: 'Dr. James Liu',
    role: 'ML Researcher',
    followers: 'Stanford PhD',
    quote: "Had the tech, no clue how to monetize. Now my app is top 10 in Health & Fitness. They made it happen.",
    avatar: '/icons/amanda_ai_icon.png',
  },
  {
    id: 4,
    name: 'Mike Torres',
    role: 'App Investor',
    followers: 'Angel investor',
    quote: "Smooth acquisition process. The team was professional and the transition was seamless. Would work with them again.",
    avatar: '/icons/obama_run_icon.png',
  },
];

export default function Philosophy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [activeTab, setActiveTab] = useState('creators');
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'intro' | 'complete'>('idle');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConversation = conversations.find(c => c.id === activeTab) || conversations[0];
  const hasVisited = visitedTabs.has(activeTab);

  const clearAnim = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runTypingAnimation = useCallback((msgCount: number, speed: number, onComplete: () => void, messages?: typeof conversations[0]['messages']) => {
    clearAnim();

    // Start with typing indicator showing (headers are always visible)
    // visibleCount = 1 means only index 0 messages show, but headers bypass this
    setVisibleCount(1);
    setIsTyping(true);

    if (msgCount <= 1) {
      setIsTyping(false);
      onComplete();
      return;
    }

    let count = 1;
    intervalRef.current = setInterval(() => {
      count++;
      setVisibleCount(count);

      // Play sound for new message
      if (messages && messages[count - 1] && !messages[count - 1].isHeader) {
        const isMindmush = messages[count - 1].sender === 'mindmush';
        if (isMindmush) {
          playSound('/sound-effects/receive-message.wav', 0.25);
        } else {
          playSound('/sound-effects/message-delivered.wav', 0.25);
        }
      }

      // Play typing sound if there's a next message coming
      if (messages && count < messages.length) {
        const nextMsg = messages[count];
        if (nextMsg && !nextMsg.isHeader) {
          playSound('/sound-effects/typing-indicator.wav', 0.15);
        }
      }

      // Keep typing indicator on until we reach the end
      if (count >= msgCount) {
        clearAnim();
        setIsTyping(false);
        onComplete();
      }
    }, speed);
  }, [clearAnim]);

  // Initial intro animation
  useEffect(() => {
    if (isInView && phase === 'idle') {
      setPhase('intro');
      setActiveTab('creators');
      setVisitedTabs(new Set());

      // Relaxed animation - 1200ms between messages
      runTypingAnimation(conversations[0].messages.length, 1200, () => {
        setTimeout(() => {
          setVisitedTabs(new Set(['creators']));
          setPhase('complete');
        }, 800);
      }, conversations[0].messages);
    }

    if (!isInView && phase !== 'idle') {
      clearAnim();
      setPhase('idle');
      setVisibleCount(0);
      setVisitedTabs(new Set());
      setIsTyping(false);
      setActiveTab('creators');
    }
  }, [isInView, phase, runTypingAnimation, clearAnim]);

  const handleTabChange = (id: string) => {
    if (phase !== 'complete') return;

    setActiveTab(id);

    if (!visitedTabs.has(id)) {
      const conv = conversations.find(c => c.id === id);
      if (conv) {
        // Same speed for all - 1200ms
        runTypingAnimation(conv.messages.length, 1200, () => {
          setVisitedTabs(prev => new Set([...prev, id]));
        }, conv.messages);
      }
    }
  };

  useEffect(() => {
    return () => clearAnim();
  }, [clearAnim]);

  const showUI = phase === 'complete';
  const showCategories = phase === 'intro' || phase === 'complete'; // Show during intro

  return (
    <section id="partners" className="snap-section px-4 sm:px-6" ref={ref}>
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center h-full">

        {/* Header - only render after intro complete */}
        <AnimatePresence>
          {showUI && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white text-center mb-6 sm:mb-8 md:mb-10"
            >
              Who we <span className="text-emerald-400">partner</span> with
            </motion.h2>
          )}
        </AnimatePresence>

        {/* Chat Card */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{
            opacity: isInView ? 1 : 0,
            y: isInView ? 0 : 30,
            scale: isInView ? 1 : 0.96
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
            layout: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }
          }}
          className="w-full max-w-2xl relative"
        >
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            {/* Card Header with Category Tabs and Video Call */}
            <div className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                {/* Category tabs */}
                <div className="flex items-center flex-1 justify-between">
                  {conversations.map((conv, index) => {
                    const isFirst = index === 0;
                    const shouldShow = isFirst || showUI;

                    return (
                      <motion.button
                        key={conv.id}
                        initial={{ opacity: isFirst ? 1 : 0, x: isFirst ? 0 : -10 }}
                        animate={shouldShow ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{
                          duration: 0.4,
                          delay: shouldShow && !isFirst ? (index - 1) * 0.06 : 0,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        onClick={() => handleTabChange(conv.id)}
                        className={`relative px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1 sm:gap-1.5 ${
                          activeTab === conv.id
                            ? 'text-white'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {activeTab === conv.id && (
                          <>
                            <motion.div
                              layoutId="activeCategory"
                              className="absolute inset-0 rounded-full bg-white/10 border border-white/10"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                            <motion.div
                              layoutId="activeDot"
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          </>
                        )}
                        <span className="relative z-10">{conv.title}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Call Button */}
                <AnimatePresence>
                  {showUI && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setShowTestimonials(!showTestimonials)}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                        showTestimonials
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">Testimonials</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages Container - responsive height */}
            <div className="h-[300px] sm:h-[360px] md:h-[440px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-3"
                >
                  {activeConversation.messages.map((msg, i) => {
                    const show = hasVisited || i < visibleCount;

                    // First header (date) is always visible, others animate in
                    if (msg.isHeader) {
                      const isFirstHeader = i === 0;
                      if (!isFirstHeader && !show) return null;

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: isFirstHeader ? 1 : 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="flex justify-center py-2"
                        >
                          <span className="text-[11px] text-white/30 bg-white/[0.04] px-3 py-1 rounded-full">
                            {msg.timestamp}
                          </span>
                        </motion.div>
                      );
                    }

                    // Messages animate in
                    if (!show) return null;

                    const isMindmush = msg.sender === 'mindmush';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.8,
                          ease: [0.16, 1, 0.3, 1],
                          opacity: { duration: 0.6, ease: "easeOut" }
                        }}
                        className={`flex ${isMindmush ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-[15px] leading-relaxed max-w-[85%] sm:max-w-none ${
                            isMindmush
                              ? 'bg-emerald-500/15 text-emerald-50 rounded-2xl rounded-br-sm'
                              : 'bg-white/[0.06] text-white/80 rounded-2xl rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Typing indicator - shows on the side of whoever is typing next */}
                  <AnimatePresence mode="popLayout">
                    {isTyping && !hasVisited && (() => {
                      const nextMsg = activeConversation.messages[visibleCount];
                      if (!nextMsg || nextMsg.isHeader) return null;

                      const isMindmushTyping = nextMsg.sender === 'mindmush';

                      return (
                        <motion.div
                          key={`typing-${visibleCount}-${isMindmushTyping}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className={`flex ${isMindmushTyping ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl flex items-center gap-[5px] sm:gap-[6px] ${
                            isMindmushTyping
                              ? 'bg-emerald-500/15 rounded-br-sm'
                              : 'bg-white/[0.06] rounded-bl-sm'
                          }`}>
                            <motion.span
                              animate={{ y: [0, -2.5, 0], opacity: [0.4, 0.8, 0.4] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                              className={`w-[5px] h-[5px] rounded-full ${isMindmushTyping ? 'bg-emerald-400' : 'bg-white/50'}`}
                            />
                            <motion.span
                              animate={{ y: [0, -2.5, 0], opacity: [0.4, 0.8, 0.4] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
                              className={`w-[5px] h-[5px] rounded-full ${isMindmushTyping ? 'bg-emerald-400' : 'bg-white/50'}`}
                            />
                            <motion.span
                              animate={{ y: [0, -2.5, 0], opacity: [0.4, 0.8, 0.4] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                              className={`w-[5px] h-[5px] rounded-full ${isMindmushTyping ? 'bg-emerald-400' : 'bg-white/50'}`}
                            />
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Call Popup - Fixed position next to chat */}
      <AnimatePresence>
        {showTestimonials && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-1/2 -translate-y-1/2 right-4 sm:right-8 lg:right-[calc(50%-380px)] z-50 hidden sm:block"
          >
            <div className="relative p-4 rounded-2xl bg-[#0d0d0f] border border-white/[0.08] w-[260px] shadow-2xl">
              {/* Call Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-white/60">Live Call</span>
                </div>
                <button
                  onClick={() => setShowTestimonials(false)}
                  className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Caller Info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-[#0d0d0f]">
                      <img
                        src={testimonials[testimonialIndex].avatar}
                        alt={testimonials[testimonialIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Speaking indicator */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                    >
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    </motion.div>
                  </div>

                  {/* Name & Role */}
                  <h4 className="text-white font-medium text-sm mb-0.5">{testimonials[testimonialIndex].name}</h4>
                  <p className="text-white/40 text-[11px] mb-3">{testimonials[testimonialIndex].role}</p>

                  {/* Quote */}
                  <p className="text-white/60 text-xs leading-relaxed">
                    "{testimonials[testimonialIndex].quote}"
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === testimonialIndex
                          ? 'bg-emerald-500 w-4'
                          : 'bg-white/20 w-1.5 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
