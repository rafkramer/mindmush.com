import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useInView } from 'framer-motion';

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
    id: 'founders',
    title: 'Founders',
    subtitle: 'Idea → Product',
    messages: [
      { timestamp: 'June 3', isHeader: true },
      { sender: 'partner', text: "I know the wedding industry cold but can't code" },
      { sender: 'mindmush', text: "You don't need to. What's the insight?" },
      { sender: 'partner', text: 'Vendors need a better booking flow' },
      { sender: 'mindmush', text: "We'll build it. You sell it." },
      { timestamp: '12 weeks later', isHeader: true },
      { sender: 'partner', text: '50k users. This is insane.' },
      { sender: 'mindmush', text: 'Just getting started' },
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

export default function Philosophy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [activeTab, setActiveTab] = useState('creators');
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'intro' | 'complete'>('idle');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConversation = conversations.find(c => c.id === activeTab) || conversations[0];
  const hasVisited = visitedTabs.has(activeTab);

  const clearAnim = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runTypingAnimation = useCallback((msgCount: number, speed: number, onComplete: () => void) => {
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
      });
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
        });
      }
    }
  };

  useEffect(() => {
    return () => clearAnim();
  }, [clearAnim]);

  const showUI = phase === 'complete';

  return (
    <section id="partners" className="snap-section px-4 sm:px-6" ref={ref}>
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center h-full">

        {/* Header & Tabs - only render after intro complete */}
        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white text-center mb-4 sm:mb-6 md:mb-8">
                Who we <span className="text-emerald-400">partner</span> with
              </h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="flex flex-wrap justify-center gap-1 mb-4 sm:mb-6"
              >
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleTabChange(conv.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeTab === conv.id
                        ? 'text-white bg-white/10'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {conv.title}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Card */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 15 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            layout: { duration: 1, ease: [0.16, 1, 0.3, 1] }
          }}
          className="w-full max-w-2xl"
        >
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm font-medium text-white/70">{activeConversation.title}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-white/30">{activeConversation.subtitle}</span>
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
    </section>
  );
}
