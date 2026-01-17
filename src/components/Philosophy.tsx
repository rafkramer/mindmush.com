import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
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
      { sender: 'mindmush', text: 'Told you', hasHeart: true },
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
      { sender: 'mindmush', text: '🤝', hasHeart: true },
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
      { sender: 'mindmush', text: 'Just getting started', hasHeart: true },
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
      { sender: 'mindmush', text: 'Research meets reality', hasHeart: true },
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
      { sender: 'mindmush', text: 'Pleasure doing business', hasHeart: true },
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
      { sender: 'mindmush', text: "We'll take it from here", hasHeart: true },
    ],
  },
];

interface Message {
  timestamp?: string;
  isHeader?: boolean;
  sender?: string;
  text?: string;
  hasHeart?: boolean;
}

function ChatMessage({ msg, index, isMindmush, shouldAnimate }: { msg: Message; index: number; isMindmush: boolean; shouldAnimate: boolean }) {
  if (msg.isHeader) {
    return (
      <motion.div
        initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: shouldAnimate ? index * 0.1 : 0 }}
        className="flex justify-center py-2"
      >
        <span className="text-[11px] text-white/30 bg-white/[0.04] px-3 py-1 rounded-full">
          {msg.timestamp}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20, x: isMindmush ? 30 : -30 } : false}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.5,
        delay: shouldAnimate ? index * 0.1 : 0,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`flex ${isMindmush ? 'justify-end' : 'justify-start'}`}
    >
      <div className="relative">
        <div
          className={`max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed ${
            isMindmush
              ? 'bg-emerald-500/15 text-emerald-50 rounded-2xl rounded-br-sm'
              : 'bg-white/[0.06] text-white/80 rounded-2xl rounded-bl-sm'
          }`}
        >
          {msg.text}
        </div>
        {msg.hasHeart && (
          <span className="absolute -bottom-2 right-0 text-sm bg-white/10 rounded-full px-1.5 py-0.5 backdrop-blur-sm">❤️</span>
        )}
      </div>
    </motion.div>
  );
}

export default function Philosophy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [activeTab, setActiveTab] = useState('creators');
  const [showTabs, setShowTabs] = useState(false);
  const [animateMessages, setAnimateMessages] = useState(false);
  const hasAnimated = useRef(false);

  const activeConversation = conversations.find(c => c.id === activeTab) || conversations[0];

  // Trigger intro animation when section comes into view
  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      setAnimateMessages(true);

      // Show tabs after messages have animated in
      const timer = setTimeout(() => {
        setShowTabs(true);
      }, 900); // Wait for messages to finish animating

      return () => clearTimeout(timer);
    }

    if (!isInView) {
      // Reset when leaving view so it plays again
      hasAnimated.current = false;
      setShowTabs(false);
      setAnimateMessages(false);
    }
  }, [isInView]);

  // Handle tab change
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setAnimateMessages(true);
    // Reset animation flag after a tick so messages animate
    setTimeout(() => setAnimateMessages(false), 50);
  };

  return (
    <section id="partners" className="snap-section px-6" ref={ref}>
      <div className="max-w-4xl mx-auto w-full flex flex-col justify-center items-center h-full">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
            Who we <span className="text-emerald-400">partner</span> with
          </h2>
        </motion.div>

        {/* Tab Buttons - appear after intro */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={showTabs ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-wrap justify-center gap-1 mb-8"
        >
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleTabChange(conv.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === conv.id
                  ? 'text-white bg-white/10'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </motion.div>

        {/* Chat Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-3xl"
        >
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            {/* Card Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                />
                <span className="text-sm font-medium text-white/70">{activeConversation.title}</span>
              </div>
              <span className="text-xs text-white/30">{activeConversation.subtitle}</span>
            </motion.div>

            {/* Messages */}
            <div className="space-y-3 min-h-[280px]">
              {activeConversation.messages.map((msg, i) => (
                <ChatMessage
                  key={`${activeTab}-${i}`}
                  msg={msg}
                  index={i}
                  isMindmush={msg.sender === 'mindmush'}
                  shouldAnimate={animateMessages}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
